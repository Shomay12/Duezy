import React from 'react';
import { Zap, Plus, Terminal, Sparkles, RefreshCw, CreditCard, ShieldCheck, DollarSign, Settings } from 'lucide-react';
import { getCurrentUser, hasAdminAccess } from '../services/authService';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  onOpenCreate, 
  onOpenWebhooks, 
  onResetStory, 
  unreadWebhooks = 0 
}) {
  const currentUser = getCurrentUser();
  const isAdmin = hasAdminAccess(currentUser);

  return (
    <header className="navbar">
      {/* Brand Identity */}
      <div className="brand-section">
        <div className="logo-badge">
          <Zap size={22} fill="white" />
        </div>
        <div className="brand-info">
          <div className="brand-title">
            DUEZY
          </div>
          <div className="brand-tagline">
            Get paid. Without the chase.
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav className="nav-links">
        <button 
          id="nav-dashboard"
          className={`nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentTab('dashboard')}
        >
          Dashboard
        </button>

        <button 
          id="nav-story"
          className={`nav-item ${currentTab === 'story' ? 'active' : ''}`}
          onClick={() => setCurrentTab('story')}
        >
          <Sparkles size={14} color="#6366F1" />
          Rahul ₹25k Flow
        </button>

        <button 
          id="nav-pricing"
          className={`nav-item ${currentTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setCurrentTab('pricing')}
        >
          <DollarSign size={14} color="#10B981" />
          Pricing
        </button>

        <button 
          id="nav-billing"
          className={`nav-item ${currentTab === 'billing' ? 'active' : ''}`}
          onClick={() => setCurrentTab('billing')}
        >
          <CreditCard size={14} />
          Billing & Subscription
        </button>

        <button 
          id="nav-webhooks"
          className={`nav-item ${currentTab === 'webhooks' ? 'active' : ''}`}
          onClick={onOpenWebhooks}
        >
          <Terminal size={14} />
          Webhooks
          {unreadWebhooks > 0 && (
            <span style={{
              background: '#10B981',
              color: '#0B0F17',
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '0.1rem 0.35rem',
              borderRadius: '10px'
            }}>
              {unreadWebhooks}
            </span>
          )}
        </button>

        {/* Admin CRM Direct Button */}
        <button 
          id="nav-admin"
          className={`nav-item ${currentTab === 'admin' ? 'active' : ''}`}
          style={{
            background: currentTab === 'admin' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.1)',
            borderColor: 'rgba(99, 102, 241, 0.4)',
            color: '#818CF8'
          }}
          onClick={() => setCurrentTab('admin')}
        >
          <ShieldCheck size={14} color="#818CF8" />
          Admin CRM
        </button>
      </nav>

      {/* Actions */}
      <div className="nav-actions">
        <button 
          id="btn-reset-global"
          className="btn-ghost" 
          onClick={onResetStory}
          title="Reset Rahul ₹25k scenario"
        >
          <RefreshCw size={15} />
          Reset Demo
        </button>

        <button 
          id="btn-new-payment"
          className="btn-primary" 
          onClick={onOpenCreate}
        >
          <Plus size={16} />
          Create Payment
        </button>
      </div>
    </header>
  );
}
