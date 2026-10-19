import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Send, 
  CreditCard, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Ban,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RahulSandboxCard({ 
  payment, 
  onOpenQR, 
  onOpenAIReminders, 
  onTriggerPay, 
  onReset 
}) {
  if (!payment) return null;

  const isPaid = payment.status === 'PAID';

  const handlePayClick = () => {
    onTriggerPay();
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#10B981', '#34D399', '#6366F1', '#F59E0B']
    });
  };

  return (
    <div className="featured-hero-card" id="rahul-featured-scenario">
      <div className="featured-badge">
        <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} />
        Live Prompt Scenario — Rahul ₹25,000
      </div>

      <div className="featured-content">
        {/* Left Side: Client & Status Overview */}
        <div className="featured-left">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3>
              {payment.clientName}
              <span className={`status-pill ${isPaid ? 'paid' : 'overdue'}`}>
                {isPaid ? (
                  <>
                    <CheckCircle2 size={14} />
                    ₹25,000 → PAID ✓
                  </>
                ) : (
                  <>
                    <Clock size={14} />
                    Unpaid — DUEZY Tracking Due Date
                  </>
                )}
              </span>
            </h3>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
              Invoice <strong style={{ color: 'var(--text-primary)' }}>#{payment.invoiceNumber}</strong>
            </div>
          </div>

          <div className="featured-client-tag">
            {payment.clientCompany} • {payment.clientPhone} • {payment.clientEmail}
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
            {payment.description}
          </div>

          <div className="scenario-details-grid">
            <div>
              <div className="scenario-item-label">Amount Payable</div>
              <div className="scenario-item-val" style={{ fontSize: '1.4rem', color: isPaid ? '#10B981' : '#F8FAFC' }}>
                ₹{payment.amount.toLocaleString('en-IN')}
              </div>
            </div>

            <div>
              <div className="scenario-item-label">Razorpay Link & QR</div>
              <div className="scenario-item-val" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="badge-glow-purple" style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                  Live Active
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>UPI + Cards</span>
              </div>
            </div>

            <div>
              <div className="scenario-item-label">AI Reminder State</div>
              <div className="scenario-item-val">
                {isPaid ? (
                  <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <Ban size={14} />
                    ALL FUTURE REMINDERS STOPPED
                  </span>
                ) : (
                  <span style={{ color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <MessageSquare size={14} />
                    WhatsApp + Email Scheduled
                  </span>
                )}
              </div>
            </div>

            <div>
              <div className="scenario-item-label">Settlement Mode</div>
              <div className="scenario-item-val" style={{ fontSize: '0.85rem' }}>
                {isPaid ? 'Razorpay Webhook (Captured)' : 'Awaiting Razorpay Checkout'}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="featured-actions">
            <button 
              id="btn-open-ai-studio"
              className="btn-secondary" 
              onClick={onOpenAIReminders}
            >
              <Sparkles size={16} color="#6366F1" />
              View AI Reminders (WhatsApp/Email/SMS)
            </button>

            <button 
              id="btn-open-rzp-qr"
              className="btn-secondary" 
              onClick={onOpenQR}
            >
              <QrCode size={16} color="#10B981" />
              Razorpay Link & Dynamic QR
            </button>

            {isPaid ? (
              <button 
                id="btn-reset-rahul"
                className="btn-ghost" 
                onClick={onReset}
                style={{ color: 'var(--text-secondary)' }}
              >
                Reset Scenario to Unpaid
              </button>
            ) : null}
          </div>
        </div>

        {/* Right Side: Interactive Sandbox Triggers */}
        <div className="featured-right">
          <div className="sandbox-controller-title">
            <span>One-Click Scenario Controller</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>DUEZY Auto-Engine</span>
          </div>

          <div className="simulator-btn-row">
            {!isPaid ? (
              <button 
                id="btn-simulate-rahul-pay"
                className="sim-btn sim-btn-pay" 
                onClick={handlePayClick}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>Simulate: Rahul Pays ₹25,000</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Fires Razorpay Webhook & halts reminders</div>
                </div>
                <CreditCard size={18} />
              </button>
            ) : (
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                textAlign: 'center'
              }}>
                <div style={{ color: '#10B981', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <CheckCircle2 size={20} />
                  ₹25,000 → PAID ✓
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Razorpay Webhook verified. All scheduled WhatsApp, Email, and SMS reminders have been cancelled permanently.
                </div>
              </div>
            )}

            <button 
              id="btn-preview-checkout-link"
              className="sim-btn"
              onClick={onOpenQR}
            >
              <div>
                <div style={{ fontWeight: 700 }}>Open Razorpay Checkout View</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Client-facing UPI / QR payment portal</div>
              </div>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
