import React, { useState } from 'react';
import { 
  X, Save, Sparkles, AlertTriangle
} from 'lucide-react';
import { adminUpdateUser, adminSetUserStatus, adminAddSupportNote } from '../../services/adminService';
import { grantAdminSubscription, getPlanById } from '../../services/subscriptionService';
import { getDbPlans } from '../../data/dbStore';
import { getCurrentUser } from '../../services/authService';

export default function AdminUserDetailModal({ isOpen, onClose, user, onUpdated, onShowToast }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    company: user?.company || '', timezone: user?.timezone || 'Asia/Kolkata (IST)', currency: user?.currency || 'INR'
  });
  const [trialPlan, setTrialPlan] = useState('plan_pro');
  const [trialDays, setTrialDays] = useState(14);
  const [trialReason, setTrialReason] = useState('Beta freelancer testing');
  const [newNoteText, setNewNoteText] = useState('');
  const [confirmEmailInput, setConfirmEmailInput] = useState('');
  const [confirmActionType, setConfirmActionType] = useState(null);

  if (!isOpen || !user) return null;

  const plans = getDbPlans();
  const currentActor = getCurrentUser();

  const handleSaveProfile = (e) => {
    e.preventDefault();
    adminUpdateUser({ userId: user.id, updates: editForm, adminActor: currentActor });
    setIsEditing(false);
    onShowToast && onShowToast('Changes saved successfully.', 'success');
    onUpdated && onUpdated();
  };

  const handleGrantTrial = () => {
    grantAdminSubscription({ userId: user.id, planId: trialPlan, durationDays: Number(trialDays), reason: trialReason, adminActor: currentActor });
    onShowToast && onShowToast(`Granted ${trialDays}-day trial on ${getPlanById(trialPlan).name} (ADMIN_GRANTED)`, 'success');
    onUpdated && onUpdated();
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    adminAddSupportNote({ userId: user.id, noteText: newNoteText, adminActor: currentActor });
    setNewNoteText('');
    onShowToast && onShowToast('Support note saved.', 'info');
    onUpdated && onUpdated();
  };

  const handleExecuteDangerousAction = () => {
    if (confirmEmailInput !== user.email) {
      onShowToast && onShowToast("Email does not match. Action aborted.", 'warning');
      return;
    }
    if (confirmActionType === 'SUSPEND') {
      adminSetUserStatus({ userId: user.id, status: user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED', reason: 'Administrative override', adminActor: currentActor });
      onShowToast && onShowToast(`User ${user.status === 'SUSPENDED' ? 'unsuspended' : 'suspended'}.`, 'success');
    }
    setConfirmActionType(null);
    setConfirmEmailInput('');
    onUpdated && onUpdated();
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'usage', label: 'Usage' },
    { id: 'support', label: 'Support' },
    { id: 'danger', label: '⚠ Actions' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="client-avatar">{user.name.substring(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{user.name}</h3>
                <span className={`status-pill ${user.status === 'ACTIVE' ? 'paid' : 'overdue'}`}>{user.status}</span>
                <span className="admin-topbar__role-badge">{user.role}</span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                {user.email} · ID: {user.id}
              </div>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="tab-nav">
          {tabs.map((t) => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'tab-btn--active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>Identity & Profile</h4>
                <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 'var(--text-sm)' }} onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              {isEditing ? (
                <form onSubmit={handleSaveProfile}>
                  <div className="form-row-2">
                    <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required /></div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Company</label><input className="form-input" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} /></div>
                  </div>
                  <button type="submit" className="btn-primary"><Save size={14} /> Save Changes</button>
                </form>
              ) : (
                <div className="data-grid">
                  <div><div className="data-field__label">Full Name</div><div className="data-field__value">{user.name}</div></div>
                  <div><div className="data-field__label">Email</div><div className="data-field__value">{user.email}</div></div>
                  <div><div className="data-field__label">Phone</div><div className="data-field__value">{user.phone || 'N/A'}</div></div>
                  <div><div className="data-field__label">Company</div><div className="data-field__value">{user.company || 'N/A'}</div></div>
                  <div><div className="data-field__label">Created</div><div className="data-field__value">{new Date(user.created_at).toLocaleDateString()}</div></div>
                  <div><div className="data-field__label">Last Login</div><div className="data-field__value">{user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</div></div>
                </div>
              )}
            </div>
          )}

          {/* SUBSCRIPTION TAB */}
          {activeTab === 'subscription' && (
            <div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Subscription & Provider</h4>
              <div className="data-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div><div className="data-field__label">Active Plan</div><div className="data-field__value" style={{ color: 'var(--info)' }}>{user.plan?.name || 'FREE'}</div></div>
                <div><div className="data-field__label">Provider</div><div className="data-field__value"><span className={`provider-badge ${user.subscription?.provider === 'ADMIN' ? 'provider-badge--admin' : 'provider-badge--razorpay'}`}>{user.subscription?.provider === 'ADMIN' ? 'ADMIN_GRANTED' : 'RAZORPAY'}</span></div></div>
                <div><div className="data-field__label">Billing Period</div><div className="data-field__value">{user.subscription?.billing_period || 'MONTHLY'}</div></div>
                <div><div className="data-field__label">Renewal</div><div className="data-field__value">{user.subscription?.current_period_end ? new Date(user.subscription.current_period_end).toLocaleDateString() : 'N/A'}</div></div>
              </div>

              <div className="admin-grant-box">
                <div className="admin-grant-box__title"><Sparkles size={14} /> Grant Trial / Admin Access</div>
                <p className="admin-grant-box__desc">Access source recorded as <code>ADMIN_GRANTED</code> — no fake Razorpay transactions.</p>
                <div className="form-row-2">
                  <div className="form-group"><label className="form-label">Plan</label><select className="form-input" value={trialPlan} onChange={(e) => setTrialPlan(e.target.value)}>{plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Duration (Days)</label><input type="number" className="form-input" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} /></div>
                </div>
                <div className="form-group"><label className="form-label">Reason</label><input className="form-input" value={trialReason} onChange={(e) => setTrialReason(e.target.value)} placeholder="e.g. Beta tester" /></div>
                <button className="btn-primary" onClick={handleGrantTrial}>Grant {trialDays}-Day Trial</button>
              </div>
            </div>
          )}

          {/* USAGE TAB */}
          {activeTab === 'usage' && (
            <div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Feature Consumption</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                <div className="metric-card"><div className="data-field__label">Tracked Payments</div><div className="metric-value" style={{ fontSize: 'var(--text-xl)' }}>{user.usage?.payments_tracked_this_month || 0} / {user.plan?.limits?.payment_trackers || 5}</div></div>
                <div className="metric-card"><div className="data-field__label">Customers</div><div className="metric-value" style={{ fontSize: 'var(--text-xl)' }}>{user.customers_count || 0} / {user.plan?.limits?.customers >= 9999 ? '∞' : user.plan?.limits?.customers}</div></div>
                <div className="metric-card"><div className="data-field__label">AI Generations</div><div className="metric-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--warning)' }}>{user.usage?.ai_generations_this_month || 0} / {user.plan?.limits?.ai_generations_monthly || 0}</div></div>
                <div className="metric-card"><div className="data-field__label">WhatsApp</div><div className="metric-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--whatsapp)' }}>{user.usage?.whatsapp_sent_this_month || 0} / {user.plan?.limits?.whatsapp_monthly || 0}</div></div>
              </div>
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === 'support' && (
            <div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Internal CRM Notes & Tags</h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-5)' }}>Internal-only. End users never see these.</p>
              <div className="crm-tags" style={{ marginBottom: 'var(--space-5)' }}>
                {(user.tags || ['VIP']).map((t, idx) => <span key={idx} className="crm-tag">#{t}</span>)}
              </div>
              <div style={{ background: 'var(--bg-surface-raised)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', border: '1px solid var(--border-default)', marginBottom: 'var(--space-5)', maxHeight: '180px', overflowY: 'auto' }}>
                {(user.support_notes || []).length === 0 ? (
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-4)' }}>No support notes yet.</div>
                ) : (
                  user.support_notes.map((n) => (
                    <div key={n.id} style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                      <div style={{ fontSize: 'var(--text-base)' }}>{n.text}</div>
                      <div style={{ fontSize: 'var(--text-xxs)', color: 'var(--text-tertiary)', marginTop: '2px' }}>By {n.author} · {new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddNote} style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <input className="form-input" placeholder="Type an internal note..." value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} />
                <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap' }}>Add Note</button>
              </form>
            </div>
          )}

          {/* DANGER TAB */}
          {activeTab === 'danger' && (
            <div>
              <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--danger)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Destructive Actions
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>Require email confirmation. Logged to audit trail.</p>
              {confirmActionType ? (
                <div className="danger-zone">
                  <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>Confirm: {confirmActionType} USER</div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>Type <strong>{user.email}</strong> to confirm:</p>
                  <input className="form-input" placeholder={user.email} value={confirmEmailInput} onChange={(e) => setConfirmEmailInput(e.target.value)} style={{ marginBottom: 'var(--space-3)' }} />
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn-secondary" onClick={() => setConfirmActionType(null)}>Cancel</button>
                    <button className="btn-primary" style={{ background: 'var(--danger)' }} onClick={handleExecuteDangerousAction}>Confirm {confirmActionType}</button>
                  </div>
                </div>
              ) : (
                <div className="danger-action-row">
                  <div>
                    <div className="danger-action-row__info">{user.status === 'SUSPENDED' ? 'Unsuspend Account' : 'Suspend Account'}</div>
                    <div className="danger-action-row__desc">Restricts access to payment follow-ups immediately.</div>
                  </div>
                  <button className="btn-danger" onClick={() => setConfirmActionType('SUSPEND')}>
                    {user.status === 'SUSPENDED' ? 'Unsuspend' : 'Suspend'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
