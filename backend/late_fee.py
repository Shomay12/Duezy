"""
DUEZY Deterministic Late-Fee Engine
Calculates late payment charges strictly from invoice terms:
due date, grace period, eligible outstanding principal, and basis points.
Late fees are tracked distinctly from original principal in integer paise subunits.
Revenue sharing (50% DUEZY share) is disabled by default and configurable.
"""

from datetime import datetime, timezone, date
import uuid
from typing import Dict, Any, Optional
from backend.database import db

class LateFeeEngine:
    REVENUE_SHARE_ENABLED = False  # Disabled by default as mandated

    @staticmethod
    def calculate_assessment(invoice_id: str, as_of_date: Optional[date] = None) -> Dict[str, Any]:
        """
        Calculates accrued late fees for an invoice deterministically:
        1. Checks due date + grace period.
        2. Calculates overdue days past grace period.
        3. Applies invoice late_fee_daily_bps (basis points per day: 10 bps = 0.1%/day).
        4. Calculates in integer paise without floating-point drift.
        """
        inv = db.invoices.get(invoice_id)
        if not inv:
            raise ValueError("Invoice not found")

        if inv["status"] in ["PAID", "DRAFT"]:
            return {
                "invoice_id": invoice_id,
                "is_eligible": False,
                "days_overdue": 0,
                "assessed_fee_paise": 0,
                "assessed_fee_rupees": 0.0,
                "calculation_basis": "Invoice is not overdue or has been settled."
            }

        due_date_obj = datetime.strptime(inv["due_date"], "%Y-%m-%d").date()
        current_date = as_of_date or datetime.now(timezone.utc).date()

        days_past_due = (current_date - due_date_obj).days
        grace_period = inv.get("grace_period_days", 3)
        chargeable_days = max(0, days_past_due - grace_period)

        if chargeable_days <= 0:
            return {
                "invoice_id": invoice_id,
                "is_eligible": False,
                "days_past_due": max(0, days_past_due),
                "grace_period_days": grace_period,
                "chargeable_days": 0,
                "assessed_fee_paise": 0,
                "assessed_fee_rupees": 0.0,
                "calculation_basis": f"Within grace period ({grace_period} days from due date {inv['due_date']})."
            }

        eligible_principal_paise = inv["outstanding_amount_paise"]
        daily_bps = inv.get("late_fee_daily_bps", 10)  # 10 bps = 0.1% per day = 0.001

        # Integer calculation: fee_paise = (principal_paise * daily_bps * chargeable_days) // 10000
        calculated_fee_paise = (eligible_principal_paise * daily_bps * chargeable_days) // 10000

        return {
            "invoice_id": invoice_id,
            "is_eligible": True,
            "due_date": inv["due_date"],
            "grace_period_days": grace_period,
            "chargeable_days": chargeable_days,
            "daily_basis_points": daily_bps,
            "eligible_principal_paise": eligible_principal_paise,
            "eligible_principal_rupees": eligible_principal_paise / 100.0,
            "assessed_fee_paise": calculated_fee_paise,
            "assessed_fee_rupees": calculated_fee_paise / 100.0,
            "revenue_share_enabled": LateFeeEngine.REVENUE_SHARE_ENABLED,
            "calculation_basis": (
                f"{chargeable_days} chargeable overdue days at {daily_bps / 100.0}% daily "
                f"on outstanding balance of ₹{eligible_principal_paise / 100:,.2f}"
            )
        }

    @staticmethod
    def apply_assessment(invoice_id: str) -> Dict[str, Any]:
        """Applies and records the late fee assessment in the authoritative database."""
        with db._lock:
            assessment = LateFeeEngine.calculate_assessment(invoice_id)
            if not assessment["is_eligible"] or assessment["assessed_fee_paise"] <= 0:
                return assessment

            inv = db.invoices[invoice_id]
            fee_paise = assessment["assessed_fee_paise"]

            aid = f"fee_{uuid.uuid4().hex[:8]}"
            db.late_fees[aid] = {
                "id": aid,
                "invoice_id": invoice_id,
                "assessed_amount_paise": fee_paise,
                "basis_days_overdue": assessment["chargeable_days"],
                "calculated_at": datetime.now(timezone.utc).isoformat(),
                "status": "ASSESSED"
            }

            # Update late fee separate from principal
            inv["late_fee_paise"] = fee_paise
            inv["outstanding_amount_paise"] = (inv["original_amount_paise"] + fee_paise) - inv["paid_amount_paise"]

            db.add_audit_event(
                business_id=inv["business_id"],
                actor_id="SYSTEM_LATE_FEE_ENGINE",
                actor_role="SYSTEM",
                action="LATE_FEE_ASSESSED",
                target_type="INVOICE",
                target_id=invoice_id,
                metadata={
                    "assessment_id": aid,
                    "assessed_paise": fee_paise,
                    "chargeable_days": assessment["chargeable_days"]
                }
            )

            assessment["assessment_id"] = aid
            return assessment

late_fee_engine = LateFeeEngine()
