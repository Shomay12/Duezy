"""
DUEZY Backend Automated Verification Test Suite
Tests financial integrity, ledger correctness, conversational intents,
webhook idempotency, claims non-mutation of balances, and late fee calculations.
"""

import unittest
from datetime import datetime, timezone, timedelta
from backend.database import db
from backend.ledger import FinancialLedger
from backend.assistant import ConversationalAssistant
from backend.late_fee import LateFeeEngine
from backend.webhooks import WebhookProcessor

class TestDuezyBackend(unittest.TestCase):
    def setUp(self):
        # Reset to clean initial state before each test
        db.reset_rahul_scenario()

    def test_initial_state_and_subunit_integrity(self):
        """Verifies integer paise currency subunits (1 INR = 100 paise) and zero float drift."""
        inv = db.get_invoice_by_id("inv_rahul_25k")
        self.assertIsNotNone(inv)
        self.assertEqual(inv["original_amount_paise"], 2500000)  # ₹25,000.00
        self.assertEqual(inv["paid_amount_paise"], 0)
        self.assertEqual(inv["outstanding_amount_paise"], 2500000)
        self.assertEqual(inv["status"], "OVERDUE")

    def test_partial_payment_ledger_recalculation(self):
        """Test recording ₹10,000 partial payment against ₹25,000 invoice: balance must become ₹15,000."""
        inv_id = "inv_rahul_25k"
        tx, updated_inv = FinancialLedger.record_confirmed_payment(
            invoice_id=inv_id,
            amount_paise=1000000,  # ₹10,000
            provider_payment_id="pay_TEST_PARTIAL_001",
            payment_method="UPI"
        )
        self.assertEqual(updated_inv["paid_amount_paise"], 1000000)
        self.assertEqual(updated_inv["outstanding_amount_paise"], 1500000)  # ₹15,000
        self.assertEqual(updated_inv["status"], "PARTIALLY_PAID")
        self.assertFalse(updated_inv["reminders_stopped"])

    def test_multiple_payments_settlement_and_reminders_halt(self):
        """Test multiple payments against one invoice until fully settled, verifying reminders halt."""
        inv_id = "inv_rahul_25k"
        # Payment 1: ₹15,000
        FinancialLedger.record_confirmed_payment(
            invoice_id=inv_id,
            amount_paise=1500000,
            provider_payment_id="pay_MULTI_001"
        )
        # Payment 2: ₹10,000
        tx2, final_inv = FinancialLedger.record_confirmed_payment(
            invoice_id=inv_id,
            amount_paise=1000000,
            provider_payment_id="pay_MULTI_002"
        )
        self.assertEqual(final_inv["paid_amount_paise"], 2500000)
        self.assertEqual(final_inv["outstanding_amount_paise"], 0)
        self.assertEqual(final_inv["status"], "PAID")
        self.assertTrue(final_inv["reminders_stopped"])
        self.assertIsNone(final_inv["next_reminder_date"])

    def test_duplicate_webhook_idempotency(self):
        """Verifies duplicate webhook events cannot record payment twice."""
        inv_id = "inv_rahul_25k"
        tx1, _ = FinancialLedger.record_confirmed_payment(
            invoice_id=inv_id,
            amount_paise=2500000,
            provider_payment_id="pay_DUPLICATE_IDEMPOTENT_001"
        )
        # Attempt second record with same provider_payment_id
        tx2, inv_after = FinancialLedger.record_confirmed_payment(
            invoice_id=inv_id,
            amount_paise=2500000,
            provider_payment_id="pay_DUPLICATE_IDEMPOTENT_001"
        )
        self.assertEqual(tx1["id"], tx2["id"])
        self.assertEqual(inv_after["paid_amount_paise"], 2500000)
        self.assertEqual(inv_after["outstanding_amount_paise"], 0)

    def test_customer_claim_does_not_mark_invoice_paid(self):
        """CRITICAL: Unverified customer claims ('I already paid') must NOT reduce balance."""
        token = "tok_rahul_942_secure_abc123"
        resp = ConversationalAssistant.process_message(token, "I already paid yesterday via UPI")
        self.assertEqual(resp.detected_intent.value, "PAYMENT_COMPLETED_CLAIM")

        # Authoritative balance must remain ₹25,000
        inv = db.get_invoice_by_token(token)
        self.assertEqual(inv["outstanding_amount_paise"], 2500000)
        self.assertEqual(inv["paid_amount_paise"], 0)
        self.assertEqual(inv["status"], "OVERDUE")
        self.assertEqual(len(db.claims), 1)

    def test_dispute_intent_pauses_reminders(self):
        """Customer dispute must move status to DISPUTED and pause reminders."""
        token = "tok_rahul_942_secure_abc123"
        resp = ConversationalAssistant.process_message(token, "The amount is incorrect and work wasn't delivered")
        self.assertEqual(resp.detected_intent.value, "PAYMENT_DISPUTE")

        inv = db.get_invoice_by_token(token)
        self.assertEqual(inv["status"], "DISPUTED")
        self.assertTrue(inv["reminders_stopped"])

    def test_conversational_partial_payment_rule_enforcement(self):
        """Assistant validates minimum partial payment threshold (e.g. 20%)."""
        token = "tok_rahul_942_secure_abc123"
        # 1. Below 20% (₹25,000 * 20% = ₹5,000 minimum). Requesting ₹1,000 should be rejected
        resp_low = ConversationalAssistant.process_message(token, "Can I pay ₹1,000 now?")
        self.assertEqual(resp_low.detected_intent.value, "REQUEST_PARTIAL_PAYMENT")
        self.assertFalse(resp_low.proposal.can_fulfill)

        # 2. Permitted amount (₹10,000 >= ₹5,000). Should generate payment request
        resp_valid = ConversationalAssistant.process_message(token, "Can I pay ₹10,000 today?")
        self.assertEqual(resp_valid.detected_intent.value, "REQUEST_PARTIAL_PAYMENT")
        self.assertTrue(resp_valid.proposal.can_fulfill)
        self.assertEqual(resp_valid.proposal.amount_rupees, 10000.0)

    def test_deterministic_late_fee_engine(self):
        """Late fee calculated deterministically based on grace period and daily basis points."""
        inv_id = "inv_rahul_25k"
        # Force a calculation date 10 days after due date (Aug 15 vs due date Aug 5, grace 3d = 7 chargeable days)
        test_date = datetime.strptime("2026-08-15", "%Y-%m-%d").date()
        calc = LateFeeEngine.calculate_assessment(inv_id, as_of_date=test_date)
        self.assertTrue(calc["is_eligible"])
        self.assertEqual(calc["chargeable_days"], 7)
        # 2,500,000 paise * 10 bps * 7 days // 10,000 = 17,500 paise (₹175.00)
        self.assertEqual(calc["assessed_fee_paise"], 17500)
        self.assertEqual(calc["assessed_fee_rupees"], 175.0)

    def test_payment_request_replacement(self):
        """Changing requested partial amount invalidates or cancels older request."""
        inv_id = "inv_rahul_25k"
        req1 = db.add_payment_request(inv_id, 1000000)
        self.assertEqual(req1["status"], "PENDING")

        req2 = db.add_payment_request(inv_id, 1500000)
        self.assertEqual(req2["status"], "PENDING")

        # Older request must be cancelled
        self.assertEqual(db.payment_requests[req1["id"]]["status"], "CANCELLED")

if __name__ == "__main__":
    unittest.main()
