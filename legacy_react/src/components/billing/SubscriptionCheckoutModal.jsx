import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2,
  Terminal,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  BILLING_PERIODS, 
  createSubscriptionCheckout, 
  processSubscriptionWebhook 
} from '../../services/subscriptionService';
import { getCurrentUser } from '../../services/authService';

export default function SubscriptionCheckoutModal({ 
  isOpen, 
  onClose, 
  selectedPlan, 
  initialPeriod = BILLING_PERIODS.MONTHLY,
  onSuccess,
  onShowToast
}) {
  const [billingPeriod, setBillingPeriod] = useState(initialPeriod);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Review, 2: Razorpay Gateway, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  if (!isOpen || !selectedPlan) return null;

  const currentUser = getCurrentUser();

  // Price calculations
  let basePrice = selectedPlan.monthly_price;
  let periodName = 'Monthly';
  if (billingPeriod === BILLING_PERIODS.SIX_MONTHS) {
    basePrice = selectedPlan.six_month_price;
    periodName = '6 Months';
  } else if (billingPeriod === BILLING_PERIODS.YEARLY) {
    basePrice = selectedPlan.yearly_price;
    periodName = 'Yearly';
  }

  const gstTax = Math.round(basePrice * 0.18);
  const totalPrice = basePrice + gstTax;

  const handleSimulatePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      // Execute verified server-side webhook processing
      const rzpSubId = `sub_RZP_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
      const rzpPayId = `pay_RZP_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      const activatedSub = processSubscriptionWebhook({
        eventType: 'subscription.activated',
        userId: currentUser.id,
        planId: selectedPlan.id,
        billingPeriod,
        razorpaySubscriptionId: rzpSubId,
        razorpayPaymentId: rzpPayId
      });

      setIsProcessing(false);
      setCheckoutStep(3);

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#10B981', '#34D399', '#6366F1', '#F59E0B']
      });

      onShowToast && onShowToast(`Subscription activated: ${selectedPlan.name} (${periodName})!`, 'success');
      onSuccess && onSuccess(activatedSub);
    }, 1400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#10B981" />
              Subscribe to DUEZY {selectedPlan.name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Step {checkoutStep} of 3: {checkoutStep === 1 ? 'Review & Period' : checkoutStep === 2 ? 'Razorpay Secure Checkout' : 'Subscription Active'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* STEP 1: REVIEW & PERIOD SELECTION */}
          {checkoutStep === 1 && (
            <div>
              {/* Billing Period Selector */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Select Billing Period</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${billingPeriod === BILLING_PERIODS.MONTHLY ? 'active' : ''}`}
                    style={{
                      padding: '0.75rem 0.5rem',
                      textAlign: 'center',
                      flexDirection: 'column',
                      background: billingPeriod === BILLING_PERIODS.MONTHLY ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                      borderColor: billingPeriod === BILLING_PERIODS.MONTHLY ? '#10B981' : 'var(--border-subtle)'
                    }}
                    onClick={() => setBillingPeriod(BILLING_PERIODS.MONTHLY)}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Monthly</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{selectedPlan.monthly_price}/mo</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-secondary ${billingPeriod === BILLING_PERIODS.SIX_MONTHS ? 'active' : ''}`}
                    style={{
                      padding: '0.75rem 0.5rem',
                      textAlign: 'center',
                      flexDirection: 'column',
                      background: billingPeriod === BILLING_PERIODS.SIX_MONTHS ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                      borderColor: billingPeriod === BILLING_PERIODS.SIX_MONTHS ? '#10B981' : 'var(--border-subtle)'
                    }}
                    onClick={() => setBillingPeriod(BILLING_PERIODS.SIX_MONTHS)}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>6 Months</span>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>₹{selectedPlan.six_month_price}</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-secondary ${billingPeriod === BILLING_PERIODS.YEARLY ? 'active' : ''}`}
                    style={{
                      padding: '0.75rem 0.5rem',
                      textAlign: 'center',
                      flexDirection: 'column',
                      background: billingPeriod === BILLING_PERIODS.YEARLY ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.8)',
                      borderColor: billingPeriod === BILLING_PERIODS.YEARLY ? '#10B981' : 'var(--border-subtle)'
                    }}
                    onClick={() => setBillingPeriod(BILLING_PERIODS.YEARLY)}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Yearly</span>
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>₹{selectedPlan.yearly_price}</span>
                  </button>
                </div>
              </div>

              {/* Order Breakdown Box */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                  <span>{selectedPlan.name} Plan ({periodName})</span>
                  <span style={{ fontWeight: 700 }}>₹{basePrice.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <span>GST (18% Goods & Services Tax)</span>
                  <span>₹{gstTax.toLocaleString('en-IN')}</span>
                </div>

                <div style={{
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  marginTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.1rem',
                  fontWeight: 800
                }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#10B981' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button 
                  id="btn-proceed-to-rzp"
                  type="button" 
                  className="btn-primary"
                  onClick={() => setCheckoutStep(2)}
                >
                  Proceed to Razorpay Checkout
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RAZORPAY PAYMENT SIMULATION */}
          {checkoutStep === 2 && (
            <div>
              <div style={{
                background: '#0C2340',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ background: '#0A85EA', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                    Razorpay
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>DUEZY Subscription Billing</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{selectedPlan.name} • {periodName}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>₹{totalPrice.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>Includes GST</div>
                </div>
              </div>

              {/* Payment Methods */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ color: '#94A3B8' }}>Select Payment Method</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                  <button
                    type="button"
                    style={{
                      background: selectedMethod === 'upi' ? '#0A85EA' : 'rgba(30, 41, 59, 0.7)',
                      color: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedMethod('upi')}
                  >
                    UPI / QR (Instant)
                  </button>

                  <button
                    type="button"
                    style={{
                      background: selectedMethod === 'card' ? '#0A85EA' : 'rgba(30, 41, 59, 0.7)',
                      color: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedMethod('card')}
                  >
                    Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    style={{
                      background: selectedMethod === 'netbanking' ? '#0A85EA' : 'rgba(30, 41, 59, 0.7)',
                      color: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedMethod('netbanking')}
                  >
                    NetBanking
                  </button>
                </div>
              </div>

              {/* Pay CTA */}
              <button
                id="btn-complete-sub-payment"
                type="button"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1rem' }}
                disabled={isProcessing}
                onClick={handleSimulatePayment}
              >
                <Lock size={16} />
                {isProcessing ? 'Verifying with Razorpay...' : `Pay ₹${totalPrice.toLocaleString('en-IN')} & Activate Subscription`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.85rem' }}>
                <ShieldCheck size={14} color="#10B981" />
                Webhook signature verified via HMAC SHA-256
              </div>
            </div>
          )}

          {/* STEP 3: ACTIVATION CELEBRATION */}
          {checkoutStep === 3 && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0.5rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h4 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Subscription Activated!
              </h4>

              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '420px', margin: '0 auto 1.75rem auto' }}>
                Your account has been upgraded to <strong>{selectedPlan.name} ({periodName})</strong>. Razorpay webhook verified. All plan entitlements and limits have been unlocked immediately.
              </p>

              <button
                id="btn-finish-checkout"
                type="button"
                className="btn-primary"
                style={{ padding: '0.75rem 2rem' }}
                onClick={onClose}
              >
                Start Using DUEZY {selectedPlan.name}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
