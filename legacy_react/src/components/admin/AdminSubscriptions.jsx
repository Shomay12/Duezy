import React from 'react';
import { getDbSubscriptions, getDbPlans, getDbUsers } from '../../data/dbStore';

export default function AdminSubscriptions() {
  const subs = getDbSubscriptions();
  const plans = getDbPlans();
  const users = getDbUsers();

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-header__title">Subscriptions Management</h2>
        <p className="admin-section-header__subtitle">All user subscriptions, renewal dates, and payment providers.</p>
      </div>
      <div className="stream-table-container">
        <table className="stream-table">
          <thead><tr><th>Subscriber</th><th>Plan</th><th>Period</th><th>Status</th><th>Provider</th><th>Sub ID</th><th>Period End</th></tr></thead>
          <tbody>
            {subs.map((s) => {
              const u = users.find(user => user.id === s.user_id) || { name: s.user_id, email: '' };
              const p = plans.find(plan => plan.id === s.plan_id) || { name: 'Free' };
              return (
                <tr key={s.id}>
                  <td><div className="client-cell"><div className="client-avatar">{u.name.substring(0, 2).toUpperCase()}</div><div><div className="client-name">{u.name}</div><div className="client-company">{u.email}</div></div></div></td>
                  <td style={{ fontWeight: 600, color: 'var(--info)' }}>{p.name}</td>
                  <td>{s.billing_period || 'MONTHLY'}</td>
                  <td><span className={`status-pill ${s.status === 'ACTIVE' ? 'paid' : 'overdue'}`}>{s.cancel_at_period_end ? 'Cancelling' : s.status}</span></td>
                  <td><span className={`provider-badge ${s.provider === 'ADMIN' ? 'provider-badge--admin' : 'provider-badge--razorpay'}`}>{s.provider}</span></td>
                  <td><code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{s.provider_subscription_id || 'N/A'}</code></td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : 'N/A'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
