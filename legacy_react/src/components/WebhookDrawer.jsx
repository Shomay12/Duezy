import React from 'react';
import { X, Activity, CheckCircle2, ShieldCheck, Zap, Ban, Clock, Terminal } from 'lucide-react';

export default function WebhookDrawer({ isOpen, onClose, logs = [] }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={20} color="#10B981" />
              Razorpay Webhook Stream & Verification Engine
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Real-time HTTP webhook events received from Razorpay with HMAC SHA-256 signature verification.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.82rem',
            maxHeight: '480px',
            overflowY: 'auto'
          }}>
            {logs.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '2rem' }}>
                No webhook events captured yet.
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    paddingBottom: '1rem',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge-glow-green" style={{ padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem' }}>
                        {log.event}
                      </span>
                      <span style={{ color: '#6366F1', fontWeight: 600 }}>{log.paymentId || log.orderId}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
                      <ShieldCheck size={14} color="#10B981" />
                      {log.status}
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                    Client: <strong>{log.client}</strong> • Amount: <strong>₹{Number(log.amount).toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '6px',
                    color: log.event === 'payment.captured' ? '#34D399' : '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.75rem'
                  }}>
                    {log.event === 'payment.captured' ? <Ban size={14} color="#10B981" /> : <Zap size={14} color="#F59E0B" />}
                    Action: {log.actionTaken}
                  </div>

                  <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: '0.3rem' }}>
                    Timestamp: {new Date(log.timestamp).toLocaleTimeString()} • Verified via `X-Razorpay-Signature`
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
