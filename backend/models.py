"""
DUEZY Data Models & Schemas
Financial figures use integer currency subunits (paise for INR).
1 INR = 100 paise.
"""

from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field
from datetime import datetime

class UserRole(str, Enum):
    BUSINESS_OWNER = "BUSINESS_OWNER"
    TEAM_MEMBER = "TEAM_MEMBER"
    CUSTOMER = "CUSTOMER"
    SUPER_ADMIN = "SUPER_ADMIN"

class InvoiceStatus(str, Enum):
    DRAFT = "DRAFT"
    SENT = "SENT"
    PARTIALLY_PAID = "PARTIALLY_PAID"
    PAID = "PAID"
    OVERDUE = "OVERDUE"
    DISPUTED = "DISPUTED"

class PaymentRequestStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"

class TransactionStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class ClaimType(str, Enum):
    PAID_CLAIM = "PAID_CLAIM"
    DISPUTE = "DISPUTE"
    EXTENSION_REQUEST = "EXTENSION_REQUEST"

class ClaimStatus(str, Enum):
    PENDING_REVIEW = "PENDING_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ChatIntent(str, Enum):
    REQUEST_PARTIAL_PAYMENT = "REQUEST_PARTIAL_PAYMENT"
    REQUEST_INSTALLMENT_PLAN = "REQUEST_INSTALLMENT_PLAN"
    REQUEST_EXTENSION = "REQUEST_EXTENSION"
    PAYMENT_COMPLETED_CLAIM = "PAYMENT_COMPLETED_CLAIM"
    PAYMENT_DISPUTE = "PAYMENT_DISPUTE"
    PAYMENT_METHOD_QUERY = "PAYMENT_METHOD_QUERY"
    GENERAL_INVOICE_QUERY = "GENERAL_INVOICE_QUERY"

# User
class User(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    company: Optional[str] = None
    role: UserRole = UserRole.BUSINESS_OWNER
    status: str = "ACTIVE"
    created_at: str
    last_login: Optional[str] = None

# Customer (Debtor)
class Customer(BaseModel):
    id: str
    business_id: str
    name: str
    company: str
    phone: str
    email: str
    gst: Optional[str] = None
    total_billed_paise: int = 0
    outstanding_paise: int = 0
    status: str = "ACTIVE"

class CustomerCreate(BaseModel):
    name: str
    company: str
    phone: str
    email: str
    gst: Optional[str] = None

# Invoice
class Invoice(BaseModel):
    id: str
    business_id: str
    customer_id: str
    customer_name: str
    customer_company: str
    customer_email: str
    customer_phone: str
    invoice_number: str
    description: str
    original_amount_paise: int
    paid_amount_paise: int = 0
    outstanding_amount_paise: int
    late_fee_paise: int = 0
    currency: str = "INR"
    created_date: str
    due_date: str
    status: InvoiceStatus = InvoiceStatus.SENT
    grace_period_days: int = 3
    late_fee_daily_bps: int = 10  # 10 bps = 0.1% per day after grace period
    permitted_partial: bool = True
    min_partial_pct: int = 20    # Minimum 20% partial payment allowed
    max_installments: int = 4
    secure_token: str
    payment_link_url: Optional[str] = None
    upi_vpa: str = "duezy.collect@icici"
    reminder_strategy: str = "smart_adaptive"
    next_reminder_date: Optional[str] = None
    reminders_stopped: bool = False

class InvoiceCreate(BaseModel):
    customer_id: str
    invoice_number: str
    description: str
    amount_rupees: float
    due_date: str
    grace_period_days: int = 3
    permitted_partial: bool = True
    min_partial_pct: int = 20
    max_installments: int = 4
    reminder_strategy: str = "smart_adaptive"

# Payment Request
class PaymentRequest(BaseModel):
    id: str
    invoice_id: str
    amount_paise: int
    status: PaymentRequestStatus = PaymentRequestStatus.PENDING
    provider_order_id: str
    razorpay_url: str
    upi_vpa: str
    created_at: str
    expires_at: Optional[str] = None

class CreatePaymentRequestPayload(BaseModel):
    requested_amount_rupees: float

# Payment Transaction
class PaymentTransaction(BaseModel):
    id: str
    payment_request_id: Optional[str] = None
    invoice_id: str
    amount_paise: int
    fee_paise: int = 0
    tax_paise: int = 0
    provider_payment_id: str
    payment_method: str
    status: TransactionStatus = TransactionStatus.SUCCESS
    verified_at: str

# Late Fee Assessment
class LateFeeAssessment(BaseModel):
    id: str
    invoice_id: str
    assessed_amount_paise: int
    basis_days_overdue: int
    calculated_at: str
    status: str = "ASSESSED"

# Customer Claim
class CustomerClaim(BaseModel):
    id: str
    invoice_id: str
    claim_type: ClaimType
    claimed_amount_paise: Optional[int] = None
    customer_note: str
    proposed_date: Optional[str] = None
    status: ClaimStatus = ClaimStatus.PENDING_REVIEW
    created_at: str

class CustomerClaimCreate(BaseModel):
    claim_type: ClaimType
    claimed_amount_rupees: Optional[float] = None
    customer_note: str
    proposed_date: Optional[str] = None

# Audit Event
class AuditEvent(BaseModel):
    id: str
    business_id: str
    actor_id: str
    actor_role: str
    action: str
    target_type: str
    target_id: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    timestamp: str

# Chat Assistant Request / Response
class ChatMessage(BaseModel):
    sender: str  # "customer" or "assistant"
    text: str
    timestamp: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)

class ChatProposal(BaseModel):
    can_fulfill: bool
    proposed_action: Optional[str] = None  # "GENERATE_PAYMENT_REQUEST", "SUBMIT_CLAIM", "SUBMIT_EXTENSION", "INFO_ONLY"
    amount_rupees: Optional[float] = None
    proposed_date: Optional[str] = None
    explanation: str

class ChatResponse(BaseModel):
    reply: str
    detected_intent: ChatIntent
    proposal: ChatProposal
    updated_outstanding_rupees: float

# Webhook payload
class RazorpayWebhookPayload(BaseModel):
    event: str
    event_id: Optional[str] = None
    payload: Dict[str, Any]
