import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  Sparkles, 
  Smartphone, 
  Sliders, 
  Flag, 
  FileText, 
  Bell, 
  ShieldCheck, 
  Search, 
  ArrowLeft,
  DollarSign,
  Activity,
  UserCheck
} from 'lucide-react';
import { getCurrentUser, setCurrentUserSession } from '../../services/authService';
import { getDbUsers } from '../../data/dbStore';

export default function AdminLayout({ 
  currentAdminSection, 
  setAdminSection, 
  onExitAdmin, 
  onShowToast, 
  children 
}) {
  const [globalSearch, setGlobalSearch] = useState('');
  const currentUser = getCurrentUser();
  const allUsers = getDbUsers();

  const handleSwitchPersona = (userId) => {
    const user = setCurrentUserSession(userId);
    onShowToast && onShowToast(`Switched active session to: ${user.name} (${user.role})`, 'info');
  };

  const navItems = [
    { id: 'overview', label: 'Overview & MRR', icon: <DollarSign size={16} /> },
    { id: 'users', label: 'Users CRM', icon: <Users size={16} /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <CreditCard size={16} /> },
    { id: 'customers', label: 'Debtors & Clients', icon: <UserCheck size={16} /> },
    { id: 'payments', label: 'Tracked Payments', icon: <Activity size={16} /> },
    { id: 'communications', label: 'Comms & WhatsApp', icon: <Smartphone size={16} /> },
    { id: 'ai_usage', label: 'AI Usage & Costs', icon: <Sparkles size={16} /> },
    { id: 'plans_editor', label: 'Plans & Pricing', icon: <Sliders size={16} /> },
    { id: 'feature_flags', label: 'Feature Flags', icon: <Flag size={16} /> },
    { id: 'audit_logs', label: 'Audit Logs', icon: <FileText size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> }
  ];

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div>
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__logo">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="admin-sidebar__title">DUEZY ADMIN</div>
              <div className="admin-sidebar__label">OPERATIONS CONTROL</div>
            </div>
          </div>

          <nav className="admin-sidebar__nav">
            {navItems.map((item) => {
              const isActive = currentAdminSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`admin-nav-${item.id}`}
                  className={`admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`}
                  onClick={() => setAdminSection(item.id)}
                >
                  <span className="admin-nav-item__icon">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__footer-label">Active Persona</div>
          <select
            className="admin-sidebar__persona-select"
            value={currentUser.id}
            onChange={(e) => handleSwitchPersona(e.target.value)}
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>

          <button className="btn-ghost" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={onExitAdmin}>
            <ArrowLeft size={14} />
            Back to Customer App
          </button>
        </div>
      </aside>

      {/* Admin Content Canvas */}
      <div className="admin-content">
        <header className="admin-topbar">
          <div className="search-bar">
            <Search size={14} color="var(--text-tertiary)" />
            <input
              type="text"
              placeholder="Search users, payments, customers..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <div className="admin-topbar__status">
              <span className="admin-topbar__status-dot" />
              Razorpay & Meta API Live
            </div>
            <div className="admin-topbar__identity">
              <span className="admin-topbar__name">{currentUser.name}</span>
              <span className="admin-topbar__role-badge">{currentUser.role}</span>
            </div>
          </div>
        </header>

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
