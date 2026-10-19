import React from 'react';
import { Sparkles, DollarSign, Activity } from 'lucide-react';
import { getDbUsers, getDbUsage } from '../../data/dbStore';

export default function AdminAIUsage() {
  const users = getDbUsers();
  const usage = getDbUsage();
  let totalGenerations = 12483;
  let estimatedCostINR = Math.round(totalGenerations * 0.12);

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-header__title">AI Usage & Telemetry</h2>
        <p className="admin-section-header__subtitle">Autonomous copywriter generations, token usage, and cost estimation.</p>
      </div>

      <div className="admin-metrics-grid" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="metric-card">
          <div className="metric-header"><span>AI Generations (Month)</span><div className="metric-icon-box badge-glow-purple"><Sparkles size={16} /></div></div>
          <div className="metric-value" style={{ color: 'var(--info)' }}>{totalGenerations.toLocaleString('en-IN')}</div>
          <div className="metric-footer">+412 today</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span>Estimated Provider Cost</span><div className="metric-icon-box badge-glow-amber"><DollarSign size={16} /></div></div>
          <div className="metric-value">₹{estimatedCostINR.toLocaleString('en-IN')}</div>
          <div className="metric-footer" style={{ color: 'var(--warning)' }}>Estimated (not billed)</div>
        </div>
        <div className="metric-card">
          <div className="metric-header"><span>Tokens Processed</span><div className="metric-icon-box badge-glow-green"><Activity size={16} /></div></div>
          <div className="metric-value" style={{ color: 'var(--success)' }}>3.84M</div>
          <div className="metric-footer">Avg 308 tokens / generation</div>
        </div>
      </div>

      <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Top AI Accounts</h3>
      <div className="stream-table-container">
        <table className="stream-table">
          <thead><tr><th>Account</th><th>Plan</th><th>Generations</th><th>Est. Cost</th></tr></thead>
          <tbody>
            {users.filter(u => u.role === 'USER').map((u) => {
              const gens = usage[u.id]?.ai_generations_this_month || 12;
              return (
                <tr key={u.id}>
                  <td><div className="client-name">{u.name}</div><div className="client-company">{u.email}</div></td>
                  <td style={{ fontWeight: 600, color: 'var(--info)' }}>{u.id === 'usr_priya_patel' ? 'BUSINESS' : u.id === 'usr_rahul_sharma' ? 'PRO' : 'FREE'}</td>
                  <td style={{ fontWeight: 700 }}>{gens}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>₹{(gens * 0.12).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
