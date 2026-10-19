import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Clock, 
  ArrowUpRight
} from 'lucide-react';
import { getAdminMetrics } from '../../services/adminService';
import { getDbSubscriptions, getDbPlans, getDbUsers } from '../../data/dbStore';

export default function AdminOverview({ onNavigateSection }) {
  const metrics = getAdminMetrics();
  const subs = getDbSubscriptions();
  const plans = getDbPlans();
  const users = getDbUsers();

  return (
    <div>
      <div className="admin-section-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2 className="admin-section-header__title">Financial & CRM Control Center</h2>
            <p className="admin-section-header__subtitle">
              Real-time SaaS recurring revenue, subscription lifecycle, and communication metrics.
            </p>
          </div>
          <span className="status-pill paid">Live Production Feed</span>
        </div>
      </div>

      {/* SaaS Financial Metrics */}
      <div className="admin-metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span>Monthly Recurring (MRR)</span>
            <div className="metric-icon-box badge-glow-green"><DollarSign size={16} /></div>
          </div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>
            ₹{metrics.mrr.toLocaleString('en-IN')}
          </div>
          <div className="metric-footer trend-up">+14.2% MoM growth</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Annualized Run Rate (ARR)</span>
            <div className="metric-icon-box badge-glow-purple"><TrendingUp size={16} /></div>
          </div>
          <div className="metric-value">₹{metrics.arr.toLocaleString('en-IN')}</div>
          <div className="metric-footer">Target: ₹50,00,000</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Active Paid Subscribers</span>
            <div className="metric-icon-box badge-glow-purple"><CreditCard size={16} /></div>
          </div>
          <div className="metric-value">{metrics.activeSubscribers.toLocaleString('en-IN')}</div>
          <div className="metric-footer">ARPU: ₹{metrics.arpu.toLocaleString('en-IN')} / sub</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Total Registered Users</span>
            <div className="metric-icon-box badge-glow-amber"><Users size={16} /></div>
          </div>
          <div className="metric-value">{metrics.totalUsers.toLocaleString('en-IN')}</div>
          <div className="metric-footer">{metrics.freeUsers.toLocaleString('en-IN')} on Free tier</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span>Trial & Churn Health</span>
            <div className="metric-icon-box badge-glow-red"><Clock size={16} /></div>
          </div>
          <div className="metric-value" style={{ fontSize: 'var(--text-xl)' }}>
            {metrics.trialUsers} Trials · {metrics.churned} Churn
          </div>
          <div className="metric-footer">Churn Rate: 3.2% (Industry: 5.8%)</div>
        </div>
      </div>

      {/* Daily Operating Volume */}
      <div className="admin-daily-strip">
        <div>
          <div className="admin-daily-stat__label">New Users Today</div>
          <div className="admin-daily-stat__value" style={{ color: 'var(--success)' }}>+{metrics.newUsersToday}</div>
        </div>
        <div>
          <div className="admin-daily-stat__label">New Paid Subs</div>
          <div className="admin-daily-stat__value" style={{ color: 'var(--info)' }}>+{metrics.newSubscribersToday}</div>
        </div>
        <div>
          <div className="admin-daily-stat__label">Payments Tracked</div>
          <div className="admin-daily-stat__value">{metrics.paymentsTracked.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div className="admin-daily-stat__label">AI Messages</div>
          <div className="admin-daily-stat__value" style={{ color: 'var(--warning)' }}>{metrics.aiMessagesGenerated.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div className="admin-daily-stat__label">Reminders Sent</div>
          <div className="admin-daily-stat__value" style={{ color: 'var(--whatsapp)' }}>{metrics.reminderMessagesSent.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Live Subscription Stream */}
      <div>
        <div className="stream-header">
          <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>Live Subscription Activity</h3>
          <button className="btn-ghost" onClick={() => onNavigateSection && onNavigateSection('subscriptions')}>
            View All <ArrowUpRight size={14} />
          </button>
        </div>

        <div className="stream-table-container">
          <table className="stream-table">
            <thead>
              <tr>
                <th>Subscriber</th>
                <th>Plan & Period</th>
                <th>Status</th>
                <th>Provider</th>
                <th>Renewal Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => {
                const user = users.find(u => u.id === s.user_id) || { name: s.user_id, email: '' };
                const plan = plans.find(p => p.id === s.plan_id) || { name: 'Free' };
                return (
                  <tr key={s.id}>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">{user.name.substring(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="client-name">{user.name}</div>
                          <div className="client-company">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--info)' }}>{plan.name}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: '6px' }}>
                        ({s.billing_period || 'MONTHLY'})
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${s.status === 'ACTIVE' ? 'paid' : 'overdue'}`}>
                        {s.cancel_at_period_end ? 'Cancelling' : s.status}
                      </span>
                    </td>
                    <td>
                      <span className={`provider-badge ${s.provider === 'ADMIN' ? 'provider-badge--admin' : 'provider-badge--razorpay'}`}>
                        {s.provider === 'ADMIN' ? 'ADMIN_GRANTED' : 'RAZORPAY'}
                      </span>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                      {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Lifetime'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-ghost" onClick={() => onNavigateSection && onNavigateSection('users')}>
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
