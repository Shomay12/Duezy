"""
DUEZY Conversational Payment Assistant Engine
Understands natural language customer payment requests, disputes, extension proposals,
and payment claims. Maps them into structured intents and validates against business-configured rules.
The AI NEVER alters the authoritative balance independently or declares an invoice paid.
"""

import re
from typing import Dict, Any, Tuple, Optional
from datetime import datetime, timezone, timedelta
from backend.models import ChatIntent, ChatProposal, ChatResponse
from backend.database import db

class ConversationalAssistant:
    @staticmethod
    def parse_amount(text: str) -> Optional[float]:
        """Extracts numerical amount in rupees from messages like 'pay 10000', '₹15,000', 'pay 12k'."""
        cleaned = text.replace(",", "").replace("₹", "").replace("rs", "").replace("inr", "")
        # Match '10k', '25k'
        k_match = re.search(r'(\d+(?:\.\d+)?)\s*k\b', cleaned, re.IGNORECASE)
        if k_match:
            return float(k_match.group(1)) * 1000.0

        # Match regular numbers
        num_match = re.search(r'\b(\d+(?:\.\d+)?)\b', cleaned)
        if num_match:
            return float(num_match.group(1))
        return None

    @staticmethod
    def process_message(invoice_token: str, message: str) -> ChatResponse:
        """
        Analyzes the customer message against the authoritative invoice record.
        Identifies structured intent and validates proposal against business rules.
        """
        inv = db.get_invoice_by_token(invoice_token)
        if not inv:
            raise ValueError("Invalid invoice access token")

        msg = message.lower().strip()
        orig_amount_rupees = inv["original_amount_paise"] / 100.0
        outstanding_rupees = inv["outstanding_amount_paise"] / 100.0
        customer_name = inv.get("customer_name", "there")

        # 1. Intent: PAYMENT_COMPLETED_CLAIM ("I already paid", "paid yesterday", "payment done")
        if any(w in msg for w in ["already paid", "i paid", "payment done", "transferred", "sent money", "done payment", "settled yesterday"]):
            claim_id = f"clm_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            db.claims[claim_id] = {
                "id": claim_id,
                "invoice_id": inv["id"],
                "claim_type": "PAID_CLAIM",
                "customer_note": message,
                "status": "PENDING_REVIEW",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            # Record audit event
            db.add_audit_event(
                business_id=inv["business_id"],
                actor_id=inv["customer_id"],
                actor_role="CUSTOMER",
                action="CUSTOMER_CLAIM_RECORDED",
                target_type="INVOICE",
                target_id=inv["id"],
                metadata={"customer_note": message, "claim_id": claim_id}
            )
            return ChatResponse(
                reply=(
                    f"Thank you for notifying us, {customer_name}. We have logged your payment claim for the business accounts team to verify. "
                    "Please note that the balance remains open until confirmed by our bank integration or approved by the business. "
                    "If you paid via UPI or NetBanking, please share the 12-digit UTR/transaction reference for instant reconciliation."
                ),
                detected_intent=ChatIntent.PAYMENT_COMPLETED_CLAIM,
                proposal=ChatProposal(
                    can_fulfill=False,
                    proposed_action="SUBMIT_CLAIM",
                    explanation="Payment claim recorded for accounts review. Outstanding balance will update upon verification."
                ),
                updated_outstanding_rupees=outstanding_rupees
            )

        # 2. Intent: PAYMENT_DISPUTE ("amount is incorrect", "wrong amount", "dispute", "not agreed")
        if any(w in msg for w in ["incorrect", "wrong amount", "dispute", "didn't agree", "not agreed", "overcharged", "error in bill"]):
            disp_id = f"disp_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            db.claims[disp_id] = {
                "id": disp_id,
                "invoice_id": inv["id"],
                "claim_type": "DISPUTE",
                "customer_note": message,
                "status": "PENDING_REVIEW",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            inv["status"] = "DISPUTED"
            inv["reminders_stopped"] = True  # Pause automated collection reminders during active dispute

            db.add_audit_event(
                business_id=inv["business_id"],
                actor_id=inv["customer_id"],
                actor_role="CUSTOMER",
                action="INVOICE_DISPUTED",
                target_type="INVOICE",
                target_id=inv["id"],
                metadata={"note": message, "dispute_id": disp_id}
            )

            return ChatResponse(
                reply=(
                    f"We understand your concern regarding the billed amount. We have flagged invoice #{inv['invoice_number']} as 'Under Review' "
                    "and paused all automated collection reminders. The accounts team has been alerted to review the deliverables and line items with you."
                ),
                detected_intent=ChatIntent.PAYMENT_DISPUTE,
                proposal=ChatProposal(
                    can_fulfill=True,
                    proposed_action="SUBMIT_DISPUTE",
                    explanation="Invoice marked as Disputed. Reminders paused until review completes."
                ),
                updated_outstanding_rupees=outstanding_rupees
            )

        # 3. Intent: REQUEST_EXTENSION ("need extension", "pay next week", "pay later", "delay payment", "give me time")
        if any(w in msg for w in ["extension", "next week", "later", "more time", "delay", "give me time", "by 15th", "end of month"]):
            ext_id = f"ext_{datetime.now().strftime('%Y%m%d%H%M%S')}"
            proposed_date = (datetime.now(timezone.utc) + timedelta(days=7)).strftime("%Y-%m-%d")
            db.claims[ext_id] = {
                "id": ext_id,
                "invoice_id": inv["id"],
                "claim_type": "EXTENSION_REQUEST",
                "customer_note": message,
                "proposed_date": proposed_date,
                "status": "PENDING_REVIEW",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            return ChatResponse(
                reply=(
                    f"We understand, {customer_name}. We have submitted your extension request for review with proposed target date {proposed_date}. "
                    "In the meantime, making an immediate partial settlement (e.g. 25-50%) helps maintain your credit terms."
                ),
                detected_intent=ChatIntent.REQUEST_EXTENSION,
                proposal=ChatProposal(
                    can_fulfill=True,
                    proposed_action="SUBMIT_EXTENSION",
                    proposed_date=proposed_date,
                    explanation=f"Extension request logged for review until {proposed_date}."
                ),
                updated_outstanding_rupees=outstanding_rupees
            )

        # 4. Intent: REQUEST_INSTALLMENT_PLAN ("pay in three installments", "installment plan", "emi", "split into 3")
        if any(w in msg for w in ["installment", "installments", "split", "emi", "parts", "three parts", "two parts"]):
            # Extract number of installments
            parts = 2
            if "three" in msg or "3" in msg:
                parts = 3
            elif "four" in msg or "4" in msg:
                parts = 4

            max_allowed = inv.get("max_installments", 4)
            if parts > max_allowed:
                parts = max_allowed

            installment_amount = round(outstanding_rupees / parts, 2)
            return ChatResponse(
                reply=(
                    f"Under the business payment terms, you can settle this invoice in {parts} monthly/weekly installments. "
                    f"Each installment would be ₹{installment_amount:,.2f}. Would you like to generate the first payment link for ₹{installment_amount:,.2f} today?"
                ),
                detected_intent=ChatIntent.REQUEST_INSTALLMENT_PLAN,
                proposal=ChatProposal(
                    can_fulfill=True,
                    proposed_action="GENERATE_PAYMENT_REQUEST",
                    amount_rupees=installment_amount,
                    explanation=f"Permitted {parts}-part installment plan: ₹{installment_amount:,.2f} per part."
                ),
                updated_outstanding_rupees=outstanding_rupees
            )

        # 5. Intent: REQUEST_PARTIAL_PAYMENT ("pay half today", "pay 10,000", "pay 50%", "can i pay")
        extracted_amount = None
        if "half" in msg or "50%" in msg:
            extracted_amount = round(outstanding_rupees * 0.5, 2)
        else:
            extracted_amount = ConversationalAssistant.parse_amount(msg)

        if extracted_amount is not None and extracted_amount > 0:
            min_pct = inv.get("min_partial_pct", 20)
            min_allowed_rupees = round(outstanding_rupees * (min_pct / 100.0), 2)

            if not inv.get("permitted_partial", True):
                return ChatResponse(
                    reply=(
                        f"Partial payments are not enabled for this invoice according to business terms. "
                        f"The full outstanding amount of ₹{outstanding_rupees:,.2f} is required."
                    ),
                    detected_intent=ChatIntent.REQUEST_PARTIAL_PAYMENT,
                    proposal=ChatProposal(
                        can_fulfill=False,
                        explanation="Business terms require full settlement for this invoice."
                    ),
                    updated_outstanding_rupees=outstanding_rupees
                )

            if extracted_amount < min_allowed_rupees:
                return ChatResponse(
                    reply=(
                        f"The requested amount of ₹{extracted_amount:,.2f} is below the minimum permitted partial payment of {min_pct}% "
                        f"(minimum: ₹{min_allowed_rupees:,.2f}). Would you like to proceed with ₹{min_allowed_rupees:,.2f} instead?"
                    ),
                    detected_intent=ChatIntent.REQUEST_PARTIAL_PAYMENT,
                    proposal=ChatProposal(
                        can_fulfill=False,
                        amount_rupees=min_allowed_rupees,
                        explanation=f"Amount must be at least ₹{min_allowed_rupees:,.2f} ({min_pct}% minimum threshold)."
                    ),
                    updated_outstanding_rupees=outstanding_rupees
                )

            if extracted_amount > outstanding_rupees:
                extracted_amount = outstanding_rupees

            # Generate new dynamic payment request on the authoritative backend
            amount_paise = int(extracted_amount * 100)
            req = db.add_payment_request(inv["id"], amount_paise)

            return ChatResponse(
                reply=(
                    f"Great! We have generated a custom payment request for ₹{extracted_amount:,.2f}. "
                    "You can pay instantly via UPI (Google Pay, PhonePe, Paytm) or Cards using the dynamic QR code on screen."
                ),
                detected_intent=ChatIntent.REQUEST_PARTIAL_PAYMENT,
                proposal=ChatProposal(
                    can_fulfill=True,
                    proposed_action="GENERATE_PAYMENT_REQUEST",
                    amount_rupees=extracted_amount,
                    explanation=f"Custom payment request #{req['id']} generated for ₹{extracted_amount:,.2f}."
                ),
                updated_outstanding_rupees=outstanding_rupees
            )

        # 6. Intent: PAYMENT_METHOD_QUERY
        if any(w in msg for w in ["how to pay", "payment methods", "google pay", "phonepe", "upi", "card", "netbanking", "qr"]):
            return ChatResponse(
                reply=(
                    f"DUEZY supports all major Indian payment methods powered by Razorpay: "
                    "1. UPI (Instant 1-click via Google Pay, PhonePe, Paytm, CRED). "
                    "2. Dynamic BharatQR scan from any banking app. "
                    "3. Debit & Credit Cards (Visa, MasterCard, RuPay). "
                    "4. NetBanking across 50+ Indian banks. "
                    "All payments are 256-bit encrypted and verified instantly via webhooks."
                ),
                detected_intent=ChatIntent.PAYMENT_METHOD_QUERY,
                proposal=ChatProposal(
                    can_fulfill=True,
                    proposed_action="INFO_ONLY",
                    explanation="Payment methods detailed."
                ),
                updated_outstanding_rupees=outstanding_rupees
            )

        # 7. General Invoice Query fallback
        return ChatResponse(
            reply=(
                f"Hello {customer_name}! Your invoice #{inv['invoice_number']} for {inv['description']} has an outstanding balance "
                f"of ₹{outstanding_rupees:,.2f} due on {inv['due_date']}. You can pay the full amount or request permitted partial payments "
                "or extensions directly through this chat."
            ),
            detected_intent=ChatIntent.GENERAL_INVOICE_QUERY,
            proposal=ChatProposal(
                can_fulfill=True,
                proposed_action="INFO_ONLY",
                explanation=f"Invoice #{inv['invoice_number']} summary."
            ),
            updated_outstanding_rupees=outstanding_rupees
        )

assistant = ConversationalAssistant()
