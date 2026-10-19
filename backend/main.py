"""
DUEZY Authoritative Backend API
FastAPI implementation with CORS, validation, strict financial subunit integrity,
and multi-channel reminder orchestration.
"""

from fastapi import FastAPI, HTTPException, Request, Header, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import json

from backend.models import (
    User, Customer, CustomerCreate, Invoice, InvoiceCreate,
    CreatePaymentRequestPayload, ChatRequest, ChatResponse,
    CustomerClaimCreate, ClaimType
)
from backend.database import db
from backend.ledger import FinancialLedger
from backend.assistant import ConversationalAssistant
from backend.late_fee import LateFeeEngine
from backend.webhooks import WebhookProcessor, RAZORPAY_WEBHOOK_SECRET

app = FastAPI(
    title="DUEZY Financial Engine API",
    description="Authoritative API for DUEZY AI-Powered Payment Collection & Recovery Platform",
    version="2.0.0"
)

# Enable CORS for Flutter Web, iOS simulator, Android emulator, and desktop targets
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_USER_ID = "usr_rahul_sharma"

# ── Health Check ──
@app.get("/api/health")
def health():
    return {
        "status": "HEALTHY",
        "service": "DUEZY Financial API",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "CONNECTED",
        "ledger_engine": "ACTIVE"
    }

# ── Authentication & Profile ──
@app.post("/api/auth/login")
def login(payload: Dict[str, str]):
    email = payload.get("email", "").lower().strip()
    user = None
    for u in db.users.values():
        if u["email"].lower() == email:
            user = u
            break
    if not user:
        # Fallback to default user
        user = db.users.get(CURRENT_USER_ID)

    return {
        "token": f"duezy_jwt_mock_{user['id']}",
        "user": user
    }

@app.get("/api/auth/me")
def get_current_user():
    user = db.users.get(CURRENT_USER_ID)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ── Dashboard & SaaS Financial Metrics ──
@app.get("/api/dashboard/metrics")
def get_dashboard_metrics():
    invoices = db.get_invoices(CURRENT_USER_ID)
    total_outstanding_paise = sum(i["outstanding_amount_paise"] for i in invoices)
    total_recovered_paise = sum(i["paid_amount_paise"] for i in invoices)
    total_invoiced_paise = total_outstanding_paise + total_recovered_paise

    recovery_rate = (
        round((total_recovered_paise / total_invoiced_paise) * 100)
        if total_invoiced_paise > 0 else 100
    )

    unpaid_count = sum(1 for i in invoices if i["status"] in ["SENT", "OVERDUE"])
    partially_paid_count = sum(1 for i in invoices if i["status"] == "PARTIALLY_PAID")
    overdue_count = sum(1 for i in invoices if i["status"] == "OVERDUE")
    paid_count = sum(1 for i in invoices if i["status"] == "PAID")

    # Recent confirmed transactions
    recent_txs = sorted(
        db.transactions.values(),
        key=lambda x: x.get("verified_at", ""),
        reverse=True
    )[:5]

    return {
        "total_outstanding_paise": total_outstanding_paise,
        "total_outstanding_rupees": total_outstanding_paise / 100.0,
        "total_recovered_paise": total_recovered_paise,
        "total_recovered_rupees": total_recovered_paise / 100.0,
        "total_invoiced_rupees": total_invoiced_paise / 100.0,
        "recovery_rate_pct": recovery_rate,
        "unpaid_invoices_count": unpaid_count,
        "partially_paid_invoices_count": partially_paid_count,
        "overdue_invoices_count": overdue_count,
        "paid_invoices_count": paid_count,
        "active_ai_reminders_count": unpaid_count + partially_paid_count,
        "recent_transactions": recent_txs,
        "pending_claims_count": len([c for c in db.claims.values() if c["status"] == "PENDING_REVIEW"])
    }

# ── Customer Management ──
@app.get("/api/customers")
def list_customers():
    return db.get_customers(CURRENT_USER_ID)

@app.post("/api/customers", status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate):
    data = payload.dict()
    data["business_id"] = CURRENT_USER_ID
    return db.add_customer(data)

@app.get("/api/customers/{customer_id}")
def get_customer_detail(customer_id: str):
    cust = db.get_customer_by_id(customer_id)
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
    invoices = [i for i in db.invoices.values() if i["customer_id"] == customer_id]
    return {
        "customer": cust,
        "invoices": invoices,
        "total_invoices": len(invoices),
        "outstanding_rupees": cust["outstanding_paise"] / 100.0
    }

# ── Invoice Management ──
@app.get("/api/invoices")
def list_invoices(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None)
):
    invoices = db.get_invoices(CURRENT_USER_ID)
    if search:
        s = search.lower()
        invoices = [
            i for i in invoices
            if s in i["customer_name"].lower()
            or s in i["customer_company"].lower()
            or s in i["invoice_number"].lower()
        ]
    if status_filter and status_filter != "ALL":
        invoices = [i for i in invoices if i["status"] == status_filter]

    # Convert paise to display rupees in response
    results = []
    for inv in invoices:
        item = dict(inv)
        item["original_amount_rupees"] = inv["original_amount_paise"] / 100.0
        item["paid_amount_rupees"] = inv["paid_amount_paise"] / 100.0
        item["outstanding_amount_rupees"] = inv["outstanding_amount_paise"] / 100.0
        item["late_fee_rupees"] = inv.get("late_fee_paise", 0) / 100.0
        results.append(item)
    return results

@app.post("/api/invoices", status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate):
    cust = db.get_customer_by_id(payload.customer_id)
    if not cust:
        raise HTTPException(status_code=400, detail="Customer not found")

    amount_paise = int(payload.amount_rupees * 100)
    data = {
        "business_id": CURRENT_USER_ID,
        "customer_id": cust["id"],
        "customer_name": cust["name"],
        "customer_company": cust["company"],
        "customer_email": cust["email"],
        "customer_phone": cust["phone"],
        "invoice_number": payload.invoice_number,
        "description": payload.description,
        "original_amount_paise": amount_paise,
        "currency": "INR",
        "due_date": payload.due_date,
        "grace_period_days": payload.grace_period_days,
        "permitted_partial": payload.permitted_partial,
        "min_partial_pct": payload.min_partial_pct,
        "max_installments": payload.max_installments,
        "reminder_strategy": payload.reminder_strategy
    }
    return db.add_invoice(data)

@app.get("/api/invoices/{invoice_id}")
def get_invoice(invoice_id: str):
    inv = db.get_invoice_by_id(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    summary = FinancialLedger.get_invoice_financial_summary(invoice_id)
    return {
        "invoice": inv,
        "financial_summary": summary
    }

@app.get("/api/invoices/{invoice_id}/timeline")
def get_invoice_timeline(invoice_id: str):
    inv = db.get_invoice_by_id(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    events = [
        e for e in db.audit_events
        if e["target_id"] == invoice_id or e.get("metadata", {}).get("invoice_id") == invoice_id
    ]
    transactions = [t for t in db.transactions.values() if t["invoice_id"] == invoice_id]
    claims = [c for c in db.claims.values() if c["invoice_id"] == invoice_id]
    late_fees = [lf for lf in db.late_fees.values() if lf["invoice_id"] == invoice_id]

    return {
        "invoice_id": invoice_id,
        "audit_events": events,
        "transactions": transactions,
        "claims": claims,
        "late_fees": late_fees
    }

# ── Customer-Facing Payment Portal ──
@app.get("/api/portal/invoice/{token}")
def get_portal_invoice(token: str):
    inv = db.get_invoice_by_token(token)
    if not inv:
        raise HTTPException(status_code=404, detail="Payment link not found or expired")

    # Safe customer-facing view: NEVER leaks internal notes, business margins, or API credentials
    active_requests = [
        r for r in db.payment_requests.values()
        if r["invoice_id"] == inv["id"] and r["status"] == "PENDING"
    ]
    latest_request = active_requests[0] if active_requests else None

    # Calculate accrued late fees if applicable
    late_fee_info = LateFeeEngine.calculate_assessment(inv["id"])

    return {
        "invoice_number": inv["invoice_number"],
        "description": inv["description"],
        "business_name": "Apex Dynamics / DUEZY Client",
        "customer_name": inv["customer_name"],
        "customer_company": inv["customer_company"],
        "original_amount_rupees": inv["original_amount_paise"] / 100.0,
        "paid_amount_rupees": inv["paid_amount_paise"] / 100.0,
        "outstanding_amount_rupees": inv["outstanding_amount_paise"] / 100.0,
        "late_fee_rupees": inv.get("late_fee_paise", 0) / 100.0,
        "currency": inv["currency"],
        "due_date": inv["due_date"],
        "status": inv["status"],
        "permitted_partial": inv.get("permitted_partial", True),
        "min_partial_pct": inv.get("min_partial_pct", 20),
        "min_partial_amount_rupees": round((inv["outstanding_amount_paise"] / 100.0) * (inv.get("min_partial_pct", 20) / 100.0), 2),
        "upi_vpa": inv.get("upi_vpa", "duezy.collect@icici"),
        "razorpay_url": inv.get("payment_link_url"),
        "latest_payment_request": latest_request,
        "late_fee_assessment": late_fee_info,
        "secure_token": token
    }

@app.post("/api/portal/chat/{token}", response_model=ChatResponse)
def portal_chat(token: str, request: ChatRequest):
    try:
        response = ConversationalAssistant.process_message(token, request.message)
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/portal/payment-request/{token}")
def create_portal_payment_request(token: str, payload: CreatePaymentRequestPayload):
    inv = db.get_invoice_by_token(token)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    outstanding_rupees = inv["outstanding_amount_paise"] / 100.0
    req_amount = payload.requested_amount_rupees

    min_pct = inv.get("min_partial_pct", 20)
    min_allowed = round(outstanding_rupees * (min_pct / 100.0), 2)

    if req_amount < min_allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Requested amount ₹{req_amount:,.2f} is below minimum allowed ₹{min_allowed:,.2f}"
        )
    if req_amount > outstanding_rupees:
        req_amount = outstanding_rupees

    amount_paise = int(req_amount * 100)
    new_req = db.add_payment_request(inv["id"], amount_paise)
    return {
        "payment_request": new_req,
        "amount_rupees": req_amount,
        "upi_string": f"upi://pay?pa={new_req['upi_vpa']}&pn={inv['customer_name']}&am={req_amount}&cu=INR&tn={inv['invoice_number']}"
    }

@app.post("/api/portal/simulate-payment/{token}")
def simulate_portal_payment(token: str, payload: Dict[str, Any] = None):
    """
    Simulates customer completing payment via Razorpay checkout,
    invoking the authoritative ledger and stopping all future reminders.
    """
    inv = db.get_invoice_by_token(token)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    amount_paise = payload.get("amount_paise") if payload else None
    if not amount_paise:
        # Default to full outstanding
        amount_paise = inv["outstanding_amount_paise"]

    tx, updated_inv = FinancialLedger.record_confirmed_payment(
        invoice_id=inv["id"],
        amount_paise=amount_paise,
        provider_payment_id=f"pay_RZP_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        payment_method="Razorpay UPI (Google Pay)"
    )

    return {
        "success": True,
        "message": f"₹{amount_paise / 100:,.2f} confirmed! Reminders halted.",
        "transaction": tx,
        "outstanding_rupees": updated_inv["outstanding_amount_paise"] / 100.0,
        "invoice_status": updated_inv["status"]
    }

# ── Razorpay Webhook Ingestion ──
@app.post("/api/webhooks/razorpay")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    raw_body = await request.body()
    try:
        event_data = json.loads(raw_body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # If signature provided in production, verify it
    if x_razorpay_signature:
        is_valid = WebhookProcessor.verify_signature(raw_body, x_razorpay_signature)
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid HMAC SHA-256 signature")

    success, code, details = WebhookProcessor.process_event(raw_body, x_razorpay_signature or "", event_data)
    return JSONResponse(status_code=200, content={"status": code, "details": details})

@app.get("/api/webhooks/logs")
def get_webhook_logs():
    return db.webhook_logs

# ── Late-Fee Engine Endpoints ──
@app.get("/api/invoices/{invoice_id}/calculate-late-fee")
def calculate_late_fee(invoice_id: str):
    try:
        return LateFeeEngine.calculate_assessment(invoice_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/api/invoices/{invoice_id}/apply-late-fee")
def apply_late_fee(invoice_id: str):
    try:
        return LateFeeEngine.apply_assessment(invoice_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

# ── Reminders Engine ──
@app.post("/api/reminders/process")
def process_reminders():
    invoices = db.get_invoices(CURRENT_USER_ID)
    processed = []
    for inv in invoices:
        if inv["status"] in ["PAID", "DISPUTED"] or inv.get("reminders_stopped"):
            continue
        processed.append({
            "invoice_id": inv["id"],
            "invoice_number": inv["invoice_number"],
            "customer": inv["customer_name"],
            "channels": ["WhatsApp", "Email", "SMS"],
            "status": "QUEUED"
        })
    return {
        "processed_count": len(processed),
        "items": processed
    }

# ── Plans & Subscriptions ──
@app.get("/api/plans")
def get_plans():
    return db.plans

@app.get("/api/subscriptions/me")
def get_my_subscription():
    sub = db.subscriptions.get(CURRENT_USER_ID)
    plan = next((p for p in db.plans if p["id"] == sub["plan_id"]), db.plans[1])
    return {
        "subscription": sub,
        "plan": plan
    }

# ── Reset Demo Scenario ──
@app.post("/api/scenario/reset-rahul")
def reset_rahul():
    db.reset_rahul_scenario()
    return {"success": True, "message": "Rahul ₹25k scenario reset to initial unpaid state."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
