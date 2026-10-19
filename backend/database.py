"""
DUEZY Authoritative Database & Data Store
Thread-safe in-memory store initialized with canonical DUEZY fixtures
and persistent SQLite sync for audit & ledger records.
"""

import threading
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any
from backend.models import (
    User, Customer, Invoice, PaymentRequest, PaymentTransaction,
    LateFeeAssessment, CustomerClaim, AuditEvent,
    InvoiceStatus, PaymentRequestStatus, TransactionStatus, UserRole
)

class Database:
    def __init__(self):
        self._lock = threading.RLock()
        self.users: Dict[str, Dict[str, Any]] = {}
        self.customers: Dict[str, Dict[str, Any]] = {}
        self.invoices: Dict[str, Dict[str, Any]] = {}
        self.payment_requests: Dict[str, Dict[str, Any]] = {}
        self.transactions: Dict[str, Dict[str, Any]] = {}
        self.late_fees: Dict[str, Dict[str, Any]] = {}
        self.claims: Dict[str, Dict[str, Any]] = {}
        self.audit_events: List[Dict[str, Any]] = []
        self.webhook_logs: List[Dict[str, Any]] = []
        self.processed_webhook_event_ids: set = set()
        self.plans: List[Dict[str, Any]] = []
        self.subscriptions: Dict[str, Dict[str, Any]] = {}
        self.feature_flags: List[Dict[str, Any]] = []
        self._seed_data()

    def _seed_data(self):
        with self._lock:
            # 1. Users
            self.users = {
                "usr_rahul_sharma": {
                    "id": "usr_rahul_sharma",
                    "name": "Rahul Sharma",
                    "email": "rahul@apexdynamics.in",
                    "phone": "+91 98765 43210",
                    "company": "Apex Dynamics Pvt Ltd",
                    "role": UserRole.BUSINESS_OWNER.value,
                    "status": "ACTIVE",
                    "created_at": "2026-03-15T09:30:00Z",
                    "last_login": "2026-08-08T14:10:00Z"
                },
                "usr_vikram_admin": {
                    "id": "usr_vikram_admin",
                    "name": "Vikram Malhotra",
                    "email": "admin@duezy.com",
                    "phone": "+91 98110 99887",
                    "company": "DUEZY Technologies",
                    "role": UserRole.SUPER_ADMIN.value,
                    "status": "ACTIVE",
                    "created_at": "2026-01-01T00:00:00Z",
                    "last_login": "2026-08-08T14:30:00Z"
                }
            }

            # 2. Customers (Debtors)
            self.customers = {
                "cust_rahul_apex": {
                    "id": "cust_rahul_apex",
                    "business_id": "usr_rahul_sharma",
                    "name": "Rahul Sharma",
                    "company": "Apex Dynamics Pvt Ltd",
                    "phone": "+91 98765 43210",
                    "email": "rahul@apexdynamics.in",
                    "gst": "27AADCA1234F1Z8",
                    "total_billed_paise": 2500000,
                    "outstanding_paise": 2500000,
                    "status": "OVERDUE"
                },
                "cust_priya_finpulse": {
                    "id": "cust_priya_finpulse",
                    "business_id": "usr_rahul_sharma",
                    "name": "Priya Patel",
                    "company": "FinPulse Labs",
                    "phone": "+91 98220 11990",
                    "email": "priya@finpulselabs.com",
                    "gst": "24AABCF5678G1Z2",
                    "total_billed_paise": 4200000,
                    "outstanding_paise": 0,
                    "status": "PAID"
                },
                "cust_vikram_logistics": {
                    "id": "cust_vikram_logistics",
                    "business_id": "usr_rahul_sharma",
                    "name": "Vikram Enterprises",
                    "company": "Vikram Logistics Global",
                    "phone": "+91 97110 44882",
                    "email": "accounts@vikramglobal.com",
                    "gst": "07AAACV9012E1Z5",
                    "total_billed_paise": 11500000,
                    "outstanding_paise": 11500000,
                    "status": "OVERDUE"
                },
                "cust_ananya_aura": {
                    "id": "cust_ananya_aura",
                    "business_id": "usr_rahul_sharma",
                    "name": "Ananya Roy",
                    "company": "Studio Aura Creative",
                    "phone": "+91 99300 88219",
                    "email": "ananya@studioaura.design",
                    "gst": "19AADCR3344P1Z1",
                    "total_billed_paise": 1850000,
                    "outstanding_paise": 1850000,
                    "status": "SENT"
                }
            }

            # 3. Invoices (amounts in integer paise: 1 INR = 100 paise)
            self.invoices = {
                "inv_rahul_25k": {
                    "id": "inv_rahul_25k",
                    "business_id": "usr_rahul_sharma",
                    "customer_id": "cust_rahul_apex",
                    "customer_name": "Rahul Sharma",
                    "customer_company": "Apex Dynamics Pvt Ltd",
                    "customer_email": "rahul@apexdynamics.in",
                    "customer_phone": "+91 98765 43210",
                    "invoice_number": "DZ-2026-942",
                    "description": "Full Stack Web Application & SEO Milestones - Sprint 3",
                    "original_amount_paise": 2500000,
                    "paid_amount_paise": 0,
                    "outstanding_amount_paise": 2500000,
                    "late_fee_paise": 0,
                    "currency": "INR",
                    "created_date": "2026-08-01",
                    "due_date": "2026-08-05",
                    "status": InvoiceStatus.OVERDUE.value,
                    "grace_period_days": 3,
                    "late_fee_daily_bps": 10,
                    "permitted_partial": True,
                    "min_partial_pct": 20,
                    "max_installments": 4,
                    "secure_token": "tok_rahul_942_secure_abc123",
                    "payment_link_url": "https://rzp.io/l/duezy_rahul_25k",
                    "upi_vpa": "duezy.collect@icici",
                    "reminder_strategy": "smart_adaptive",
                    "next_reminder_date": "2026-08-09T10:00:00Z",
                    "reminders_stopped": False
                },
                "inv_priya_42k": {
                    "id": "inv_priya_42k",
                    "business_id": "usr_rahul_sharma",
                    "customer_id": "cust_priya_finpulse",
                    "customer_name": "Priya Patel",
                    "customer_company": "FinPulse Labs",
                    "customer_email": "priya@finpulselabs.com",
                    "customer_phone": "+91 98220 11990",
                    "invoice_number": "DZ-2026-940",
                    "description": "Mobile App UI/UX Sprint 2 & React Native Prototyping",
                    "original_amount_paise": 4200000,
                    "paid_amount_paise": 4200000,
                    "outstanding_amount_paise": 0,
                    "late_fee_paise": 0,
                    "currency": "INR",
                    "created_date": "2026-07-28",
                    "due_date": "2026-08-02",
                    "status": InvoiceStatus.PAID.value,
                    "grace_period_days": 3,
                    "late_fee_daily_bps": 10,
                    "permitted_partial": True,
                    "min_partial_pct": 20,
                    "max_installments": 3,
                    "secure_token": "tok_priya_940_secure_def456",
                    "payment_link_url": "https://rzp.io/l/duezy_priya_42k",
                    "upi_vpa": "duezy.collect@icici",
                    "reminder_strategy": "balanced",
                    "next_reminder_date": None,
                    "reminders_stopped": True
                },
                "inv_vikram_115k": {
                    "id": "inv_vikram_115k",
                    "business_id": "usr_rahul_sharma",
                    "customer_id": "cust_vikram_logistics",
                    "customer_name": "Vikram Enterprises",
                    "customer_company": "Vikram Logistics Global",
                    "customer_email": "accounts@vikramglobal.com",
                    "customer_phone": "+91 97110 44882",
                    "invoice_number": "DZ-2026-938",
                    "description": "Enterprise Cloud Infrastructure Migration & DevOps Setup",
                    "original_amount_paise": 11500000,
                    "paid_amount_paise": 0,
                    "outstanding_amount_paise": 11500000,
                    "late_fee_paise": 0,
                    "currency": "INR",
                    "created_date": "2026-08-02",
                    "due_date": "2026-08-07",
                    "status": InvoiceStatus.OVERDUE.value,
                    "grace_period_days": 2,
                    "late_fee_daily_bps": 15,
                    "permitted_partial": True,
                    "min_partial_pct": 25,
                    "max_installments": 4,
                    "secure_token": "tok_vikram_938_secure_ghi789",
                    "payment_link_url": "https://rzp.io/l/duezy_vikram_115k",
                    "upi_vpa": "duezy.collect@icici",
                    "reminder_strategy": "firm",
                    "next_reminder_date": "2026-08-09T10:00:00Z",
                    "reminders_stopped": False
                },
                "inv_ananya_18k": {
                    "id": "inv_ananya_18k",
                    "business_id": "usr_rahul_sharma",
                    "customer_id": "cust_ananya_aura",
                    "customer_name": "Ananya Roy",
                    "customer_company": "Studio Aura Creative",
                    "customer_email": "ananya@studioaura.design",
                    "customer_phone": "+91 99300 88219",
                    "invoice_number": "DZ-2026-943",
                    "description": "Brand Identity, Typography Guidelines & Pitch Deck Design",
                    "original_amount_paise": 1850000,
                    "paid_amount_paise": 0,
                    "outstanding_amount_paise": 1850000,
                    "late_fee_paise": 0,
                    "currency": "INR",
                    "created_date": "2026-08-06",
                    "due_date": "2026-08-11",
                    "status": InvoiceStatus.SENT.value,
                    "grace_period_days": 3,
                    "late_fee_daily_bps": 10,
                    "permitted_partial": True,
                    "min_partial_pct": 30,
                    "max_installments": 2,
                    "secure_token": "tok_ananya_943_secure_jkl012",
                    "payment_link_url": "https://rzp.io/l/duezy_ananya_18k",
                    "upi_vpa": "duezy.collect@icici",
                    "reminder_strategy": "gentle",
                    "next_reminder_date": "2026-08-09T09:30:00Z",
                    "reminders_stopped": False
                }
            }

            # 4. Initial Payment Request for Rahul
            self.payment_requests = {
                "req_rahul_full": {
                    "id": "req_rahul_full",
                    "invoice_id": "inv_rahul_25k",
                    "amount_paise": 2500000,
                    "status": PaymentRequestStatus.PENDING.value,
                    "provider_order_id": "order_RH942001",
                    "razorpay_url": "https://rzp.io/l/duezy_rahul_25k",
                    "upi_vpa": "duezy.collect@icici",
                    "created_at": "2026-08-01T10:00:00Z",
                    "expires_at": "2026-09-01T10:00:00Z"
                }
            }

            # 5. Transactions (Initial for Priya)
            self.transactions = {
                "tx_priya_001": {
                    "id": "tx_priya_001",
                    "payment_request_id": None,
                    "invoice_id": "inv_priya_42k",
                    "amount_paise": 4200000,
                    "fee_paise": 84000,
                    "tax_paise": 15120,
                    "provider_payment_id": "pay_N8912739102",
                    "payment_method": "UPI (Google Pay)",
                    "status": TransactionStatus.SUCCESS.value,
                    "verified_at": "2026-08-02T14:22:15Z"
                }
            }

            # 6. Initial Webhook Logs
            self.webhook_logs = [
                {
                    "id": "wh_log_001",
                    "timestamp": "2026-08-02T14:22:15Z",
                    "event": "payment.captured",
                    "status": "VERIFIED_200",
                    "entity": "payment",
                    "paymentId": "pay_N8912739102",
                    "orderId": "order_PR881230",
                    "amount_paise": 4200000,
                    "amount_rupees": 42000,
                    "currency": "INR",
                    "client": "Priya Patel",
                    "actionTaken": "Payment recorded in ledger. Outstanding set to 0. Reminders stopped."
                },
                {
                    "id": "wh_log_002",
                    "timestamp": "2026-08-01T10:00:00Z",
                    "event": "payment_link.created",
                    "status": "PROCESSED_200",
                    "entity": "payment_link",
                    "paymentId": "plink_OQx92KnDslk",
                    "orderId": "order_RH942001",
                    "amount_paise": 2500000,
                    "amount_rupees": 25000,
                    "currency": "INR",
                    "client": "Rahul Sharma",
                    "actionTaken": "Payment link and dynamic UPI QR activated."
                }
            ]

            # 7. Initial Plans
            self.plans = [
                {
                    "id": "plan_free",
                    "name": "FREE",
                    "slug": "free",
                    "monthly_price": 0,
                    "six_month_price": 0,
                    "yearly_price": 0,
                    "currency": "INR",
                    "features": ["5 active payment trackers", "10 debtor customers", "Basic payment tracking"],
                    "limits": {"payment_trackers": 5, "customers": 10, "ai_generations_monthly": 10}
                },
                {
                    "id": "plan_pro",
                    "name": "PRO",
                    "slug": "pro",
                    "monthly_price": 499,
                    "six_month_price": 2499,
                    "yearly_price": 4499,
                    "currency": "INR",
                    "features": ["100 active payment trackers", "Unlimited customers", "Instant Razorpay QR", "Automated WhatsApp & Email", "AI conversational engine"],
                    "limits": {"payment_trackers": 100, "customers": 999999, "ai_generations_monthly": 500}
                },
                {
                    "id": "plan_business",
                    "name": "BUSINESS",
                    "slug": "business",
                    "monthly_price": 1499,
                    "six_month_price": 7499,
                    "yearly_price": 13499,
                    "currency": "INR",
                    "features": ["Unlimited active payment trackers", "Everything in Pro", "5 Team members", "Priority Webhooks", "Dedicated account manager"],
                    "limits": {"payment_trackers": 999999, "customers": 999999, "ai_generations_monthly": 2500}
                }
            ]

            # 8. Initial Subscriptions
            self.subscriptions = {
                "usr_rahul_sharma": {
                    "id": "sub_rahul_001",
                    "user_id": "usr_rahul_sharma",
                    "plan_id": "plan_pro",
                    "billing_period": "MONTHLY",
                    "status": "ACTIVE",
                    "started_at": "2026-04-08T10:00:00Z"
                }
            }

            # 9. Initial Feature Flags
            self.feature_flags = [
                {"id": "ff_ai", "key": "ai_assistant", "name": "AI Assistant & Tone Progression", "enabled": True},
                {"id": "ff_qr", "key": "qr_payments", "name": "Dynamic UPI QR Generation", "enabled": True},
                {"id": "ff_wa", "key": "whatsapp", "name": "WhatsApp Multi-channel Reminders", "enabled": True},
                {"id": "ff_late_fee", "key": "late_fee_engine", "name": "Configurable Late-Fee Engine", "enabled": True}
            ]

    # Thread-safe getters and modifiers
    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.users.get(user_id)

    def get_customers(self, business_id: str) -> List[Dict[str, Any]]:
        with self._lock:
            return [c for c in self.customers.values() if c["business_id"] == business_id]

    def get_customer_by_id(self, customer_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.customers.get(customer_id)

    def add_customer(self, data: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            cid = f"cust_{uuid.uuid4().hex[:8]}"
            data["id"] = cid
            data["total_billed_paise"] = 0
            data["outstanding_paise"] = 0
            data["status"] = "ACTIVE"
            self.customers[cid] = data
            return data

    def get_invoices(self, business_id: str) -> List[Dict[str, Any]]:
        with self._lock:
            return [i for i in self.invoices.values() if i["business_id"] == business_id]

    def get_invoice_by_id(self, invoice_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.invoices.get(invoice_id)

    def get_invoice_by_token(self, secure_token: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            for inv in self.invoices.values():
                if inv.get("secure_token") == secure_token:
                    return inv
            return None

    def add_invoice(self, data: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            iid = f"inv_{uuid.uuid4().hex[:8]}"
            token = f"tok_{uuid.uuid4().hex}"
            data["id"] = iid
            data["secure_token"] = token
            data["paid_amount_paise"] = 0
            data["outstanding_amount_paise"] = data["original_amount_paise"]
            data["late_fee_paise"] = 0
            data["status"] = InvoiceStatus.SENT.value
            data["created_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            data["payment_link_url"] = f"https://rzp.io/l/{iid}"
            data["upi_vpa"] = "duezy.collect@icici"
            data["reminders_stopped"] = False
            self.invoices[iid] = data

            # Update customer total billed & outstanding
            cid = data["customer_id"]
            if cid in self.customers:
                self.customers[cid]["total_billed_paise"] += data["original_amount_paise"]
                self.customers[cid]["outstanding_paise"] += data["original_amount_paise"]

            # Auto-create initial full payment request
            req_id = f"req_{uuid.uuid4().hex[:8]}"
            self.payment_requests[req_id] = {
                "id": req_id,
                "invoice_id": iid,
                "amount_paise": data["original_amount_paise"],
                "status": PaymentRequestStatus.PENDING.value,
                "provider_order_id": f"order_{uuid.uuid4().hex[:8].upper()}",
                "razorpay_url": data["payment_link_url"],
                "upi_vpa": data["upi_vpa"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }

            self.add_audit_event(
                business_id=data["business_id"],
                actor_id=data["business_id"],
                actor_role="BUSINESS_OWNER",
                action="INVOICE_CREATED",
                target_type="INVOICE",
                target_id=iid,
                metadata={"amount_paise": data["original_amount_paise"], "invoice_number": data["invoice_number"]}
            )

            return data

    def add_payment_request(self, invoice_id: str, amount_paise: int) -> Dict[str, Any]:
        with self._lock:
            inv = self.invoices.get(invoice_id)
            if not inv:
                raise ValueError("Invoice not found")

            # Invalidate any previous pending requests for this invoice
            for req in self.payment_requests.values():
                if req["invoice_id"] == invoice_id and req["status"] == PaymentRequestStatus.PENDING.value:
                    req["status"] = PaymentRequestStatus.CANCELLED.value

            req_id = f"req_{uuid.uuid4().hex[:8]}"
            new_req = {
                "id": req_id,
                "invoice_id": invoice_id,
                "amount_paise": amount_paise,
                "status": PaymentRequestStatus.PENDING.value,
                "provider_order_id": f"order_{uuid.uuid4().hex[:8].upper()}",
                "razorpay_url": f"https://rzp.io/l/{req_id}",
                "upi_vpa": inv.get("upi_vpa", "duezy.collect@icici"),
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            self.payment_requests[req_id] = new_req
            return new_req

    def get_payment_requests_for_invoice(self, invoice_id: str) -> List[Dict[str, Any]]:
        with self._lock:
            return [r for r in self.payment_requests.values() if r["invoice_id"] == invoice_id]

    def add_audit_event(self, business_id: str, actor_id: str, actor_role: str,
                        action: str, target_type: str, target_id: str, metadata: Dict[str, Any] = None):
        with self._lock:
            evt = {
                "id": f"aud_{uuid.uuid4().hex[:8]}",
                "business_id": business_id,
                "actor_id": actor_id,
                "actor_role": actor_role,
                "action": action,
                "target_type": target_type,
                "target_id": target_id,
                "metadata": metadata or {},
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            self.audit_events.insert(0, evt)

    def reset_rahul_scenario(self):
        with self._lock:
            self._seed_data()
            return True

db = Database()
