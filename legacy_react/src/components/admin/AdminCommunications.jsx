import React, { useState } from 'react';

export default function AdminCommunications() {
  const [channelFilter, setChannelFilter] = useState('ALL');
  const commLogs = [
    { id: "comm_01", user: "Rahul Sharma", client: "Sprint 3 Debtor", channel: "WhatsApp", tone: "Firm & Professional", status: "DELIVERED", deliveryTime: "240ms", failureReason: null },
    { id: "comm_02", user: "Rahul Sharma", client: "Aman Verma", channel: "WhatsApp", tone: "Gentle & Courteous", status: "DELIVERED", deliveryTime: "310ms", failureReason: null },
    { id: "comm_03", user: "Priya Patel", client: "Client #882", channel: "Email", tone: "Balanced", status: "DELIVERED", deliveryTime: "180ms", failureReason: null },
    { id: "comm_04", user: "Ananya Roy", client: "Debtor Demo", channel: "SMS", tone: "Gentle", status: "FAILED", deliveryTime: "N/A", failureReason: "DLT template ID not whitelisted" }
  ];
  const filtered = commLogs.filter(c => channelFilter === 'ALL' || c.channel === channelFilter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div className="admin-section-header" style={{ marginBottom: 0 }}>
          <h2 className="admin-section-header__title">Communication Logs</h2>
          <p className="admin-section-header__subtitle">WhatsApp, SMS, Email delivery logs with status and errors.</p>
        </div>
        <select className="filter-select" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
          <option value="ALL">All Channels</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Email">Email</option>
          <option value="SMS">SMS</option>
        </select>
      </div>
      <div className="stream-table-container">
        <table className="stream-table">
          <thead><tr><th>User</th><th>Recipient</th><th>Channel</th><th>Tone</th><th>Status</th><th>Info</th></tr></thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.user}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{c.client}</td>
                <td style={{ fontWeight: 600, color: c.channel === 'WhatsApp' ? 'var(--whatsapp)' : c.channel === 'Email' ? 'var(--info)' : 'var(--warning)' }}>{c.channel}</td>
                <td>{c.tone}</td>
                <td><span className={`status-pill ${c.status === 'DELIVERED' ? 'paid' : 'danger'}`}>{c.status}</span></td>
                <td>{c.failureReason ? <span style={{ color: 'var(--danger)', fontSize: 'var(--text-xs)' }}>⚠ {c.failureReason}</span> : <span style={{ color: 'var(--success)', fontSize: 'var(--text-xs)' }}>Latency: {c.deliveryTime}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
