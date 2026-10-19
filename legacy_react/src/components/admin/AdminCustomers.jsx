import React from 'react';
import { getDbUserCustomers, getDbUsers } from '../../data/dbStore';
import { useState } from 'react';

export default function AdminCustomers() {
  const [selectedUserFilter, setSelectedUserFilter] = useState('ALL');
  const allCustomers = getDbUserCustomers();
  const allUsers = getDbUsers();
  const filtered = allCustomers.filter(c => selectedUserFilter === 'ALL' || c.user_id === selectedUserFilter);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div className="admin-section-header" style={{ marginBottom: 0 }}>
          <h2 className="admin-section-header__title">End-Customer & Debtor Directory</h2>
          <p className="admin-section-header__subtitle">Inspect debtors tracked by DUEZY users. Read-only.</p>
        </div>
        <select className="filter-select" value={selectedUserFilter} onChange={(e) => setSelectedUserFilter(e.target.value)}>
          <option value="ALL">All Users' Debtors</option>
          {allUsers.filter(u => u.role === 'USER').map(u => <option key={u.id} value={u.id}>{u.name}'s Debtors</option>)}
        </select>
      </div>
      <div className="stream-table-container">
        <table className="stream-table">
          <thead><tr><th>Debtor</th><th>DUEZY User</th><th>Total Billed</th><th>Outstanding</th><th>Status</th></tr></thead>
          <tbody>
            {filtered.map(c => {
              const owner = allUsers.find(u => u.id === c.user_id) || { name: c.user_id };
              return (
                <tr key={c.id}>
                  <td><div><div className="client-name">{c.name}</div><div className="client-company">{c.company} · {c.email}</div></div></td>
                  <td style={{ fontWeight: 600, color: 'var(--info)' }}>{owner.name}</td>
                  <td style={{ fontWeight: 600 }}>₹{c.total_billed?.toLocaleString('en-IN')}</td>
                  <td style={{ fontWeight: 700, color: c.outstanding > 0 ? 'var(--danger)' : 'var(--success)' }}>₹{c.outstanding?.toLocaleString('en-IN')}</td>
                  <td><span className={`status-pill ${c.status === 'PAID' ? 'paid' : 'overdue'}`}>{c.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
