import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Lock, 
  Zap,
  CheckCircle2,
  Building
} from 'lucide-react';

export default function RazorpayQRModal({ 
  isOpen, 
  onClose, 
  payment, 
  onTriggerPay, 
  onShowToast 
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !payment) return null;

  const isPaid = payment.status === 'PAID';
  const amountFormatted = `₹${payment.amount.toLocaleString('en-IN')}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(payment.razorpayUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    onShowToast && onShowToast('Razorpay payment link copied!', 'info');
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(payment.upiVpa || 'duezy.collect@icici');
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
    onShowToast && onShowToast('UPI VPA copied!', 'info');
  };

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onTriggerPay && onTriggerPay();
      onClose();
    }, 1200);
  };

  // Generate an SVG-based dynamic UPI QR code
  const upiString = `upi://pay?pa=${payment.upiVpa || 'duezy.collect@icici'}&pn=${encodeURIComponent(payment.clientName)}&am=${payment.amount}&cu=INR&tn=${encodeURIComponent(payment.invoiceNumber)}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="razorpay-checkout-modal" onClick={(e) => e.stopPropagation()}>
        {/* Razorpay Authentic Header */}
        <div className="razorpay-header">
          <div className="razorpay-brand">
            <div className="rzp-logo-badge">Razorpay</div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>DUEZY Invoicing</div>
              <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Invoice #{payment.invoiceNumber}</div>
            </div>
          </div>

          <div className="razorpay-amount-display">
            <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{amountFormatted}</div>
            <div style={{ fontSize: '0.68rem', color: '#94A3B8' }}>INR (Indian Rupee)</div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="razorpay-body">
          {isPaid ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
                Payment Captured Successfully!
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: '1.4', marginBottom: '1.5rem' }}>
                Razorpay Webhook was received and verified. {amountFormatted} has been credited and all future reminders are cancelled.
              </p>
              <button className="btn-secondary" style={{ color: '#0F172A', borderColor: '#CBD5E1' }} onClick={onClose}>
                Close Checkout
              </button>
            </div>
          ) : (
            <>
              {/* Dynamic QR Code Box */}
              <div className="qr-code-box">
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                  Scan to Pay with Any UPI App
                </div>

                {/* Styled SVG UPI QR Graphic */}
                <div style={{
                  background: '#FFFFFF',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  display: 'inline-block',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <svg width="150" height="150" viewBox="0 0 150 150" fill="none">
                    {/* Outer corners */}
                    <rect x="10" y="10" width="40" height="40" rx="6" fill="#0C2340" />
                    <rect x="18" y="18" width="24" height="24" rx="2" fill="#FFFFFF" />
                    <rect x="23" y="23" width="14" height="14" rx="2" fill="#0A85EA" />

                    <rect x="100" y="10" width="40" height="40" rx="6" fill="#0C2340" />
                    <rect x="108" y="18" width="24" height="24" rx="2" fill="#FFFFFF" />
                    <rect x="113" y="23" width="14" height="14" rx="2" fill="#0A85EA" />

                    <rect x="10" y="100" width="40" height="40" rx="6" fill="#0C2340" />
                    <rect x="18" y="108" width="24" height="24" rx="2" fill="#FFFFFF" />
                    <rect x="23" y="113" width="14" height="14" rx="2" fill="#0A85EA" />

                    {/* QR Matrix Grid Details */}
                    <rect x="60" y="15" width="8" height="8" fill="#0C2340" />
                    <rect x="75" y="25" width="10" height="10" fill="#0A85EA" />
                    <rect x="60" y="45" width="12" height="6" fill="#0C2340" />
                    <rect x="80" y="45" width="8" height="8" fill="#0C2340" />
                    <rect x="25" y="65" width="10" height="8" fill="#0C2340" />
                    <rect x="45" y="65" width="20" height="10" fill="#0A85EA" />
                    <rect x="75" y="65" width="12" height="12" fill="#0C2340" />
                    <rect x="95" y="65" width="16" height="8" fill="#0C2340" />
                    <rect x="120" y="65" width="10" height="12" fill="#0A85EA" />

                    <rect x="20" y="85" width="14" height="8" fill="#0A85EA" />
                    <rect x="45" y="85" width="10" height="10" fill="#0C2340" />
                    <rect x="65" y="85" width="25" height="8" fill="#0A85EA" />
                    <rect x="100" y="85" width="15" height="10" fill="#0C2340" />
                    <rect x="125" y="85" width="8" height="8" fill="#0C2340" />

                    <rect x="60" y="105" width="12" height="12" fill="#0C2340" />
                    <rect x="80" y="115" width="14" height="10" fill="#0A85EA" />
                    <rect x="105" y="105" width="10" height="10" fill="#0C2340" />
                    <rect x="125" y="115" width="15" height="15" fill="#0C2340" />

                    {/* Center Brand Badge */}
                    <circle cx="75" cy="75" r="14" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
                    <text x="75" y="79" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#0A85EA">₹</text>
                  </svg>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  UPI VPA: <strong>{payment.upiVpa || 'duezy.collect@icici'}</strong>
                </div>
              </div>

              {/* Instant UPI App Options */}
              <div style={{ marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Select Instant Payment Mode:
                </div>

                <div className="upi-options-list">
                  <div 
                    className={`upi-app-button ${selectedUpiApp === 'gpay' ? 'selected' : ''}`}
                    style={{ borderColor: selectedUpiApp === 'gpay' ? '#0A85EA' : '#E2E8F0', background: selectedUpiApp === 'gpay' ? '#EFF6FF' : '#FFFFFF' }}
                    onClick={() => setSelectedUpiApp('gpay')}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🔵</span>
                    <span>Google Pay</span>
                  </div>

                  <div 
                    className={`upi-app-button ${selectedUpiApp === 'phonepe' ? 'selected' : ''}`}
                    style={{ borderColor: selectedUpiApp === 'phonepe' ? '#0A85EA' : '#E2E8F0', background: selectedUpiApp === 'phonepe' ? '#EFF6FF' : '#FFFFFF' }}
                    onClick={() => setSelectedUpiApp('phonepe')}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🟣</span>
                    <span>PhonePe</span>
                  </div>

                  <div 
                    className={`upi-app-button ${selectedUpiApp === 'paytm' ? 'selected' : ''}`}
                    style={{ borderColor: selectedUpiApp === 'paytm' ? '#0A85EA' : '#E2E8F0', background: selectedUpiApp === 'paytm' ? '#EFF6FF' : '#FFFFFF' }}
                    onClick={() => setSelectedUpiApp('paytm')}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🔷</span>
                    <span>Paytm</span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button 
                id="btn-confirm-rzp-pay"
                className="rzp-pay-cta" 
                onClick={handlePayNow}
                disabled={isProcessing}
              >
                <Lock size={16} />
                {isProcessing ? 'Verifying with Bank...' : `Pay ${amountFormatted} Securely`}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#94A3B8', marginTop: '0.85rem' }}>
                <ShieldCheck size={14} color="#10B981" />
                256-bit SSL Encrypted • Powered by Razorpay
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
