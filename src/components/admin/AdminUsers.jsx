import React, { useState } from 'react';
import { Users, Search } from 'lucide-react';
import { getAdminUsers } from '../../services/adminService';
import AdminUserDetailModal from './AdminUserDetailModal';

export default function AdminUsers({ onShowToast }) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const usersList = getAdminUsers({ search, planFilter, statusFilter });

  const handleOpenUserDetail = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div className="admin-section-header" style={{ marginBottom: 0 }}>
          <h2 className="admin-section-header__title">Users CRM Directory</h2>
          <p className="admin-section-header__subtitle">
            Registered freelancers, studios, and agency accounts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div className="search-bar">
            <Search size={14} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search user, email, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}>
            <option value="ALL">All Plans</option>
            <option value="plan_free">FREE</option>
            <option value="plan_pro">PRO</option>
            <option value="plan_business">BUSINESS</option>
          </select>
          <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
        </div>
      </div>

      <div className="stream-table-container">
        <table className="stream-table">
          <thead>
            <tr>
              <th>User / Entity</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Tracked Payments</th>
              <th>Customers</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {usersList.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-tertiary)' }}>No users matched search criteria.</td></tr>
            ) : (
              usersList.map((u) => {
                const planName = u.plan?.name || 'FREE';
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">{u.name.substring(0, 2).toUpperCase()}</div>
                        <div>
                          <div className="client-name">{u.name}</div>
                          <div className="client-company">{u.email} · {u.company || 'Independent'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontWeight: 600, color: planName === 'PRO' ? 'var(--info)' : planName === 'BUSINESS' ? 'var(--success)' : 'var(--text-secondary)' }}>{planName}</span></td>
                    <td><span className={`status-pill ${u.status === 'ACTIVE' ? 'paid' : 'overdue'}`}>{u.status}</span></td>
                    <td style={{ fontWeight: 700 }}>{u.usage?.payments_tracked_this_month || 0}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.customers_count || 0}</td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button id={`btn-manage-user-${u.id}`} className="btn-primary" style={{ padding: '5px 12px', fontSize: 'var(--text-sm)' }} onClick={() => handleOpenUserDetail(u)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AdminUserDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        user={selectedUser}
        onUpdated={() => { setSelectedUser(null); setDetailModalOpen(false); }}
        onShowToast={onShowToast}
      />
    </div>
  );
}
