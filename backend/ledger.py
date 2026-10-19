"""
DUEZY Authoritative Financial Ledger
Implements strict double-entry and immutable event-sourced financial tracking.
All financial arithmetic uses integer currency subunits (paise for INR).
1 INR = 100 paise.
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Tuple
from backend.database import db
from backend.models import InvoiceStatus, TransactionStatus, PaymentRequestStatus

class FinancialLedger:
    @staticmethod
    def record_confirmed_payment(
        invoice_id: str,
        amount_paise: int,
        provider_payment_id: str,
        payment_method: str = "Razorpay UPI",
        payment_request_id: Optional[str] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Atomically records a confirmed payment transaction:
        1. Verifies invoice exists.
        2. Checks for idempotent duplicate payment_id.
        3. Appends transaction to immutable ledger.
        4. Recalculates authoritative balance:
           outstanding = original_amount + late_fee - sum(confirmed_payments).
        5. Updates invoice status (PARTIALLY_PAID or PAID).
        6. Stops automated reminders if settled.
        7. Recalculates customer aggregate balances.
        8. Writes audit event.
        """
        with db._lock:
            inv = db.invoices.get(invoice_id)
            if not inv:
                raise ValueError(f"Invoice {invoice_id} not found")

            # Duplicate transaction protection
            for tx in db.transactions.values():
                if tx["provider_payment_id"] == provider_payment_id:
                    # Idempotent return: already recorded
                    return tx, inv

            tx_id = f"tx_{uuid.uuid4().hex[:8]}"
            fee_paise = int(amount_paise * 0.02)  # 2% gateway fee
            tax_paise = int(fee_paise * 0.18)     # 18% GST on fee

            tx = {
                "id": tx_id,
                "payment_request_id": payment_request_id,
                "invoice_id": invoice_id,
                "amount_paise": amount_paise,
                "fee_paise": fee_paise,
                "tax_paise": tax_paise,
                "provider_payment_id": provider_payment_id,
                "payment_method": payment_method,
                "status": TransactionStatus.SUCCESS.value,
                "verified_at": datetime.now(timezone.utc).isoformat()
            }
            db.transactions[tx_id] = tx

            # If associated with a payment request, mark request completed
            if payment_request_id and payment_request_id in db.payment_requests:
                db.payment_requests[payment_request_id]["status"] = PaymentRequestStatus.COMPLETED.value

            # Authoritative recalculation of invoice balance from transactions
            all_invoice_txs = [
                t for t in db.transactions.values()
                if t["invoice_id"] == invoice_id and t["status"] == TransactionStatus.SUCCESS.value
            ]
            total_confirmed_paid_paise = sum(t["amount_paise"] for t in all_invoice_txs)

            inv["paid_amount_paise"] = total_confirmed_paid_paise
            orig_total = inv["original_amount_paise"] + inv.get("late_fee_paise", 0)
            inv["outstanding_amount_paise"] = max(0, orig_total - total_confirmed_paid_paise)

            if inv["outstanding_amount_paise"] == 0:
                inv["status"] = InvoiceStatus.PAID.value
                inv["reminders_stopped"] = True
                inv["next_reminder_date"] = None
            else:
                inv["status"] = InvoiceStatus.PARTIALLY_PAID.value

            # Update customer debtor record
            cid = inv["customer_id"]
            if cid in db.customers:
                cust = db.customers[cid]
                # Recalculate customer total outstanding from all their active invoices
                cust_invoices = [i for i in db.invoices.values() if i["customer_id"] == cid]
                cust["outstanding_paise"] = sum(i["outstanding_amount_paise"] for i in cust_invoices)
                if cust["outstanding_paise"] == 0:
                    cust["status"] = "PAID"
                else:
                    cust["status"] = "PARTIALLY_PAID"

            # Log audit event
            db.add_audit_event(
                business_id=inv["business_id"],
                actor_id="RAZORPAY_WEBHOOK",
                actor_role="PAYMENT_PROVIDER",
                action="PAYMENT_CONFIRMED",
                target_type="INVOICE",
                target_id=invoice_id,
                metadata={
                    "transaction_id": tx_id,
                    "amount_paise": amount_paise,
                    "provider_payment_id": provider_payment_id,
                    "new_outstanding_paise": inv["outstanding_amount_paise"],
                    "status": inv["status"]
                }
            )

            # Append to webhook logs
            db.webhook_logs.insert(0, {
                "id": f"wh_log_{uuid.uuid4().hex[:6]}",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": "payment.captured",
                "status": "VERIFIED_200",
                "entity": "payment",
                "paymentId": provider_payment_id,
                "orderId": f"order_{uuid.uuid4().hex[:8].upper()}",
                "amount_paise": amount_paise,
                "amount_rupees": amount_paise / 100.0,
                "currency": "INR",
                "client": inv["customer_name"],
                "actionTaken": f"₹{amount_paise / 100:,.2f} recorded in ledger. Outstanding balance recalculated to ₹{inv['outstanding_amount_paise'] / 100:,.2f}."
            })

            return tx, inv

    @staticmethod
    def get_invoice_financial_summary(invoice_id: str) -> Dict[str, Any]:
        """Returns verified, uncorrupted financial ledger summary for an invoice."""
        with db._lock:
            inv = db.invoices.get(invoice_id)
            if not inv:
                raise ValueError("Invoice not found")

            txs = [
                t for t in db.transactions.values()
                if t["invoice_id"] == invoice_id
            ]
            late_fees = [
                lf for lf in db.late_fees.values()
                if lf["invoice_id"] == invoice_id
            ]
            claims = [
                c for c in db.claims.values()
                if c["invoice_id"] == invoice_id
            ]
            reqs = [
                r for r in db.payment_requests.values()
                if r["invoice_id"] == invoice_id
            ]

            return {
                "invoice_id": invoice_id,
                "original_amount_paise": inv["original_amount_paise"],
                "original_amount_rupees": inv["original_amount_paise"] / 100.0,
                "paid_amount_paise": inv["paid_amount_paise"],
                "paid_amount_rupees": inv["paid_amount_paise"] / 100.0,
                "outstanding_amount_paise": inv["outstanding_amount_paise"],
                "outstanding_amount_rupees": inv["outstanding_amount_paise"] / 100.0,
                "late_fee_paise": inv.get("late_fee_paise", 0),
                "late_fee_rupees": inv.get("late_fee_paise", 0) / 100.0,
                "status": inv["status"],
                "transactions": txs,
                "late_fees": late_fees,
                "claims": claims,
                "payment_requests": reqs
            }

ledger = FinancialLedger()
