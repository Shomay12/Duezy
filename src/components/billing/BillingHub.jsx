import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Download, 
  RotateCcw,
  Ban,
  ShieldCheck,
  Zap,
  TrendingUp
} from 'lucide-react';
import { 
  getUserSubscription, 
  getUserPlan, 
  cancelUserSubscription, 
  resumeUserSubscription, 
  getUserInvoices,
  BILLING_PERIODS
} from '../../services/subscriptionService';
import { getUsage } from '../../services/usageService';
import { getCurrentUser } from '../../services/authService';

export default function BillingHub({ onOpenPricing, onShowToast }) {
  const currentUser = getCurrentUser();
  const [sub, setSub] = useState(() => getUserSubscription(currentUser.id));
  const plan = getUserPlan(currentUser.id);
  const usage = getUsage(currentUser.id);
  const invoices = getUserInvoices(currentUser.id);

  const handleCancel = () => {
    const updated = cancelUserSubscription(currentUser.id);
    setSub(updated);
    onShowToast && onShowToast('Subscription cancelled. You will retain access until the end of your billing period.', 'warning');
  };

  const handleResume = () => {
    const updated = resumeUserSubscription(currentUser.id);
    setSub(updated);
    onShowToast && onShowToast('Subscription resumed successfully! Automatic renewals are active.', 'success');
  };

  // Usage percentages
  const trackerLimit = plan.limits?.payment_trackers || 5;
  const trackerPct = Math.min(100, Math.round((usage.payments_tracked_this_month / trackerLimit) * 100));

  const aiLimit = plan.limits?.ai_generations_monthly || 10;
  const aiPct = Math.min(100, Math.round((usage.ai_generations_this_month / aiLimit) * 100));

  const waLimit = plan.limits?.whatsapp_monthly || 1;
  const waPct = waLimit > 0 ? Math.min(100, Math.round((usage.whatsapp_sent_this_month / waLimit) * 100)) : 0;

  const nextDateFormatted = sub.current_period_end 
    ? new Date(sub.current_period_end).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'September 8, 2026';

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CreditCard size={24} color="#10B981" />
          Billing & Subscription Management
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage your plan, track monthly feature usage, review Razorpay invoices, and update billing intervals.
        </p>
      </div>

      {/* Active Plan Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1.5px solid var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Plan
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{plan.name} Plan</h3>
              <span className={`status-pill ${sub.status === 'ACTIVE' && !sub.cancel_at_period_end ? 'paid' : 'overdue'}`}>
                {sub.cancel_at_period_end ? 'Cancels at Period End' : sub.status}
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10B981' }}>
              ₹{plan.monthly_price > 0 ? (sub.billing_period === 'YEARLY' ? Math.round(plan.yearly_price / 12) : plan.monthly_price) : 0}
              <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 600 }}> / month</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Billed {sub.billing_period || 'MONTHLY'} via {sub.provider || 'RAZORPAY'}
            </div>
          </div>
        </div>

        {/* Status Notice */}
        {sub.cancel_at_period_end ? (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            color: '#F59E0B',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div>
              Your subscription will remain active until <strong>{nextDateFormatted}</strong>. You will not be charged again.
            </div>
            <button className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.8rem' }} onClick={handleResume}>
              Resume Subscription
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Next billing renewal: <strong style={{ color: 'var(--text-primary)' }}>{nextDateFormatted}</strong>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={onOpenPricing}>
            <Sparkles size={16} />
            Change Plan / Upgrade
          </button>

          {!sub.cancel_at_period_end && plan.id !== 'plan_free' && (
            <button className="btn-secondary" style={{ color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.4)' }} onClick={handleCancel}>
              <Ban size={15} />
              Cancel Subscription
            </button>
          )}
        </div>
      </div>

      {/* Usage Meter Cards */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
          Plan Feature Consumption (This Month)
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {/* Tracker 1: Payments */}
          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Payment Trackers</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{usage.payments_tracked_this_month} / {trackerLimit >= 9999 ? 'Unlimited' : trackerLimit}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${trackerPct}%`, background: trackerPct > 80 ? '#EF4444' : '#10B981', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
              {trackerLimit - usage.payments_tracked_this_month} slots remaining
            </div>
          </div>

          {/* Tracker 2: AI Generations */}
          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>AI Generations</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{usage.ai_generations_this_month} / {aiLimit}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${aiPct}%`, background: aiPct > 80 ? '#F59E0B' : '#6366F1', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
              Tone progressions & smart follow-ups
            </div>
          </div>

          {/* Tracker 3: WhatsApp Messages */}
          <div className="metric-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>WhatsApp Delivery</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>{usage.whatsapp_sent_this_month} / {waLimit}</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${waPct}%`, background: '#25D366', transition: 'width 0.3s ease' }} />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
              Verified Meta Cloud API dispatch
            </div>
          </div>
        </div>
      </div>

      {/* Billing Invoices History */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>
          DUEZY Billing History & Invoices
        </h3>

        <div className="stream-table-container">
          <table className="stream-table">
            <thead>
              <tr>
                <th>Invoice Date</th>
                <th>Plan Description</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Razorpay Reference</th>
                <th style={{ textAlign: 'right' }}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                    No subscription invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem' }}>
                        <Calendar size={14} color="var(--text-tertiary)" />
                        {new Date(inv.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700 }}>{inv.plan_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>#{inv.invoice_number}</div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 800, color: '#10B981' }}>
                        ₹{inv.amount.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td>
                      <span className="status-pill paid" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                        <CheckCircle2 size={12} />
                        {inv.status}
                      </span>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {inv.razorpay_payment_id}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn-ghost"
                        style={{ fontSize: '0.78rem' }}
                        onClick={() => onShowToast && onShowToast(`Tax Invoice #${inv.invoice_number} downloaded!`, 'info')}
                      >
                        <Download size={14} />
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
