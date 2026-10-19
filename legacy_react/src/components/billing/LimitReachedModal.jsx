import React from 'react';
import { X, Sparkles, ArrowRight, ShieldAlert, Check } from 'lucide-react';

export default function LimitReachedModal({ 
  isOpen, 
  onClose, 
  featureName = "payment trackers", 
  currentUsage = 5, 
  limit = 5, 
  targetPlan = "PRO",
  onUpgrade 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#6366F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={24} />
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ paddingTop: '0.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            You've reached your {featureName} limit
          </h3>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
            You've used <strong>{currentUsage} of {limit}</strong> {featureName} this month. Upgrade to <strong>{targetPlan}</strong> to unlock higher quotas, automated WhatsApp cadences, and dynamic Razorpay payment links.
          </p>

          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              Included in {targetPlan}
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981' }}>
                <Check size={14} />
                <span>100 active payment trackers</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981' }}>
                <Check size={14} />
                <span>Unlimited debtor customers</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981' }}>
                <Check size={14} />
                <span>Automated WhatsApp & Email AI follow-ups</span>
              </li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onClose}>
              Maybe Later
            </button>
            <button 
              id="btn-upgrade-contextual"
              className="btn-primary" 
              onClick={() => {
                onClose();
                onUpgrade && onUpgrade();
              }}
            >
              Upgrade to {targetPlan}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
