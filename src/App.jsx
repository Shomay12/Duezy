import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  QrCode, 
  Send, 
  CreditCard, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Smartphone, 
  Mail, 
  MessageSquare,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Ban,
  ShieldCheck,
  Calendar,
  Layers,
  CheckCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import WorkflowDiagram, { WORKFLOW_STEPS } from './components/WorkflowDiagram';
import RahulSandboxCard from './components/RahulSandboxCard';
import CreatePaymentModal from './components/CreatePaymentModal';
import RazorpayQRModal from './components/RazorpayQRModal';
import AIReminderModal from './components/AIReminderModal';
import WebhookDrawer from './components/WebhookDrawer';

// Subscription & Billing Components
import PricingPage from './components/billing/PricingPage';
import SubscriptionCheckoutModal from './components/billing/SubscriptionCheckoutModal';
import BillingHub from './components/billing/BillingHub';
import LimitReachedModal from './components/billing/LimitReachedModal';

// Admin CRM Components
import AdminLayout from './components/admin/AdminLayout';
import AdminOverview from './components/admin/AdminOverview';
import AdminUsers from './components/admin/AdminUsers';
import AdminSubscriptions from './components/admin/AdminSubscriptions';
import AdminCustomers from './components/admin/AdminCustomers';
import AdminPayments from './components/admin/AdminPayments';
import AdminCommunications from './components/admin/AdminCommunications';
import AdminAIUsage from './components/admin/AdminAIUsage';
import AdminPlansEditor from './components/admin/AdminPlansEditor';
import AdminFeatureFlags from './components/admin/AdminFeatureFlags';
import AdminAuditLogs from './components/admin/AdminAuditLogs';
import AdminNotifications from './components/admin/AdminNotifications';

import { generateAIReminder, TONE_PROFILES } from './services/aiReminderEngine';
import { 
  getPayments, 
  savePayments, 
  markPaymentAsPaid, 
  resetRahulScenario, 
  getWebhookLogs 
} from './services/storage';
import { EntitlementService } from './services/entitlementService';
import { incrementUsage, getUsage } from './services/usageService';
import { getCurrentUser } from './services/authService';
import { BILLING_PERIODS, getUserSubscription, getUserPlan } from './services/subscriptionService';

export default function App() {
  const [payments, setPayments] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [currentTab, setCurrentTab] = useState('dashboard'); // dashboard, story, pricing, billing, admin
  const [adminSection, setAdminSection] = useState('overview'); // overview, users, subscriptions, customers, payments, communications, ai_usage, plans_editor, feature_flags, audit_logs, notifications
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Subscription Checkout Modals
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [checkoutPeriod, setCheckoutPeriod] = useState(BILLING_PERIODS.MONTHLY);
  const [limitModalOpen, setLimitModalOpen] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [webhookDrawerOpen, setWebhookDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  // Toasts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const p = getPayments();
    const w = getWebhookLogs();
    setPayments(p);
    setWebhooks(w);

    const rahul = p.find(item => item.id === 'pay_rahul_25k');
    if (rahul) {
      setSelectedPayment(rahul);
      if (rahul.status === 'PAID') {
        setActiveStep(12);
      }
    }
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const currentUser = getCurrentUser();
  const rahulPayment = payments.find(p => p.id === 'pay_rahul_25k') || payments[0];

  const handleTriggerRahulPayment = () => {
    if (!rahulPayment) return;
    markPaymentAsPaid('pay_rahul_25k', {
      method: 'Razorpay UPI (Google Pay)',
      razorpayPaymentId: `pay_RZP_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    });

    loadData();
    setActiveStep(12);
    showToast('₹25,000 captured via Razorpay Webhook! All future reminders stopped.', 'success');
  };

  const handleResetStory = () => {
    resetRahulScenario();
    loadData();
    setActiveStep(1);
    showToast('Rahul ₹25,000 scenario reset to initial unpaid state.', 'info');
  };

  const handleOpenQRForPayment = (payment) => {
    setSelectedPayment(payment);
    setQrModalOpen(true);
  };

  const handleOpenAIForPayment = (payment) => {
    const canUse = EntitlementService.canUseAI(currentUser.id);
    if (!canUse && getUserPlan(currentUser.id).id === 'plan_free') {
      setLimitModalOpen(true);
      return;
    }
    incrementUsage(currentUser.id, 'ai_generations_this_month', 1);
    setSelectedPayment(payment);
    setAiModalOpen(true);
  };

  const handleSelectPlanToUpgrade = (plan, period) => {
    setSelectedPlanForCheckout(plan);
    setCheckoutPeriod(period);
    setCheckoutModalOpen(true);
  };

  // Metrics
  const totalOutstanding = payments
    .filter(p => p.status !== 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRecovered = payments
    .filter(p => p.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalInvoiced = totalOutstanding + totalRecovered;
  const recoveryRate = totalInvoiced > 0 ? Math.round((totalRecovered / totalInvoiced) * 100) : 100;

  const activeRemindersCount = payments.filter(p => p.status !== 'PAID').length;

  // Filtered Payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.clientCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    return p.status === statusFilter;
  });

  // Render Admin CRM view when currentTab is 'admin'
  if (currentTab === 'admin') {
    return (
      <AdminLayout
        currentAdminSection={adminSection}
        setAdminSection={setAdminSection}
        onExitAdmin={() => setCurrentTab('dashboard')}
        onShowToast={showToast}
      >
        {adminSection === 'overview' && (
          <AdminOverview onNavigateSection={(sec) => setAdminSection(sec)} />
        )}
        {adminSection === 'users' && (
          <AdminUsers onShowToast={showToast} />
        )}
        {adminSection === 'subscriptions' && (
          <AdminSubscriptions />
        )}
        {adminSection === 'customers' && (
          <AdminCustomers />
        )}
        {adminSection === 'payments' && (
          <AdminPayments />
        )}
        {adminSection === 'communications' && (
          <AdminCommunications />
        )}
        {adminSection === 'ai_usage' && (
          <AdminAIUsage />
        )}
        {adminSection === 'plans_editor' && (
          <AdminPlansEditor onShowToast={showToast} />
        )}
        {adminSection === 'feature_flags' && (
          <AdminFeatureFlags onShowToast={showToast} />
        )}
        {adminSection === 'audit_logs' && (
          <AdminAuditLogs />
        )}
        {adminSection === 'notifications' && (
          <AdminNotifications />
        )}

        {/* Toast Notification Stack */}
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.type === 'success' && <CheckCircle2 size={16} color="#10B981" />}
              {t.type === 'warning' && <AlertCircle size={16} color="#F59E0B" />}
              {t.type === 'info' && <Sparkles size={16} color="#6366F1" />}
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCreate={() => setCreateModalOpen(true)}
        onOpenWebhooks={() => setWebhookDrawerOpen(true)}
        onResetStory={handleResetStory}
        unreadWebhooks={webhooks.length}
      />

      {/* Main Layout Area */}
      <main className="main-wrapper">
        {/* VIEW 1: PRICING PAGE */}
        {currentTab === 'pricing' && (
          <PricingPage
            onSelectPlan={handleSelectPlanToUpgrade}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 2: BILLING & SUBSCRIPTION HUB */}
        {currentTab === 'billing' && (
          <BillingHub
            onOpenPricing={() => setCurrentTab('pricing')}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 3: STORY DEEP DIVE */}
        {currentTab === 'story' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>
                <Sparkles size={22} color="#6366F1" style={{ display: 'inline', marginRight: '8px' }} />
                Rahul — ₹25,000 Payment & Recovery Story
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Follow every step of the scenario: Creation → Razorpay Link & Dynamic QR → AI Reminders → Customer Payment → Instant Reminders Halting.
              </p>
            </div>

            <WorkflowDiagram
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              onTriggerPayment={handleTriggerRahulPayment}
              isRahulPaid={rahulPayment?.status === 'PAID'}
            />

            <RahulSandboxCard
              payment={rahulPayment}
              onOpenQR={() => handleOpenQRForPayment(rahulPayment)}
              onOpenAIReminders={() => handleOpenAIForPayment(rahulPayment)}
              onTriggerPay={handleTriggerRahulPayment}
              onReset={handleResetStory}
            />
          </div>
        )}

        {/* VIEW 4: MAIN DASHBOARD */}
        {currentTab === 'dashboard' && (
          <>
            {/* Interactive 12-Step Workflow Diagram */}
            <WorkflowDiagram
              activeStep={activeStep}
              setActiveStep={setActiveStep}
              onTriggerPayment={handleTriggerRahulPayment}
              isRahulPaid={rahulPayment?.status === 'PAID'}
            />

            {/* The Featured Rahul Scenario Hero Card */}
            <RahulSandboxCard
              payment={rahulPayment}
              onOpenQR={() => handleOpenQRForPayment(rahulPayment)}
              onOpenAIReminders={() => handleOpenAIForPayment(rahulPayment)}
              onTriggerPay={handleTriggerRahulPayment}
              onReset={handleResetStory}
            />

            {/* Metrics Grid */}
            <div className="metrics-grid">
              {/* Metric 1 */}
              <div className="metric-card">
                <div className="metric-header">
                  <span>Total Outstanding</span>
                  <div className="metric-icon-box badge-glow-amber">
                    <Clock size={18} />
                  </div>
                </div>
                <div className="metric-value">
                  ₹{totalOutstanding.toLocaleString('en-IN')}
                </div>
                <div className="metric-footer trend-down">
                  <span>{payments.filter(p => p.status !== 'PAID').length} invoices awaiting settlement</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="metric-card">
                <div className="metric-header">
                  <span>Recovered & Captured</span>
                  <div className="metric-icon-box badge-glow-green">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="metric-value" style={{ color: '#10B981' }}>
                  ₹{totalRecovered.toLocaleString('en-IN')}
                </div>
                <div className="metric-footer trend-up">
                  <span>₹25k settled via Razorpay Webhook</span>
                </div>
              </div>

              {/* Metric 3 */}
              <div className="metric-card">
                <div className="metric-header">
                  <span>Recovery Rate</span>
                  <div className="metric-icon-box badge-glow-purple">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="metric-value">
                  {recoveryRate}%
                </div>
                <div className="metric-footer trend-up">
                  <span>Avg recovery: 2.1 days (Industry: 14d)</span>
                </div>
              </div>

              {/* Metric 4 */}
              <div className="metric-card">
                <div className="metric-header">
                  <span>Active AI Reminder Bots</span>
                  <div className="metric-icon-box badge-glow-purple">
                    <Sparkles size={18} />
                  </div>
                </div>
                <div className="metric-value">
                  {activeRemindersCount} Active
                </div>
                <div className="metric-footer" style={{ color: 'var(--text-secondary)' }}>
                  <span>WhatsApp, Email & SMS auto-queued</span>
                </div>
              </div>
            </div>

            {/* Payments Stream Table */}
            <div className="stream-header">
              <div className="stream-title-box">
                <h3>Active Payment Streams & Recovery Tracker</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Real-time payment links with automated multi-channel follow-ups.
                </p>
              </div>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem',
                  gap: '0.4rem'
                }}>
                  <Search size={14} color="var(--text-tertiary)" />
                  <input 
                    type="text"
                    placeholder="Search debtor, invoice, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.82rem',
                      color: 'var(--text-primary)',
                      width: '180px'
                    }}
                  />
                </div>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OVERDUE_REMINDING">Reminding / Overdue</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid ✓</option>
                </select>
              </div>
            </div>

            {/* Table Container */}
            <div className="stream-table-container">
              <table className="stream-table">
                <thead>
                  <tr>
                    <th>Debtor / Client</th>
                    <th>Invoice</th>
                    <th>Amount</th>
                    <th>Due Date</th>
                    <th>Status & Reminders</th>
                    <th>Channels</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => {
                    const isPaid = p.status === 'PAID';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="client-cell">
                            <div className="client-avatar">
                              {p.clientName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="client-name">{p.clientName}</div>
                              <div className="client-company">{p.clientCompany}</div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94A3B8' }}>
                            #{p.invoiceNumber}
                          </span>
                        </td>

                        <td>
                          <div className="amount-cell" style={{ color: isPaid ? '#10B981' : '#F8FAFC' }}>
                            ₹{p.amount.toLocaleString('en-IN')}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={13} />
                            {p.dueDate}
                          </div>
                        </td>

                        <td>
                          {isPaid ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span className="status-pill paid" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                                <CheckCircle2 size={12} />
                                PAID ✓
                              </span>
                              <span style={{ fontSize: '0.68rem', color: '#10B981' }}>
                                Reminders Stopped
                              </span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                              <span className="status-pill overdue" style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                                <Clock size={12} />
                                {p.status === 'OVERDUE_REMINDING' ? 'Reminding Active' : 'Scheduled'}
                              </span>
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>
                                {p.nextReminder?.stage || 'AI Cadence Running'}
                              </span>
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="channel-icons-cell">
                            <div className="channel-badge wa" title="WhatsApp Reminder Ready">
                              <Smartphone size={13} />
                            </div>
                            <div className="channel-badge email" title="Email Invoicing Ready">
                              <Mail size={13} />
                            </div>
                            <div className="channel-badge sms" title="SMS Delivery Ready">
                              <MessageSquare size={13} />
                            </div>
                          </div>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button 
                              className="btn-ghost"
                              title="Open AI Reminder Studio"
                              onClick={() => handleOpenAIForPayment(p)}
                            >
                              <Sparkles size={15} color="#6366F1" />
                            </button>

                            <button 
                              className="btn-ghost"
                              title="Razorpay Payment Link & Dynamic QR"
                              onClick={() => handleOpenQRForPayment(p)}
                            >
                              <QrCode size={15} color="#10B981" />
                            </button>

                            {!isPaid && (
                              <button 
                                className="btn-primary"
                                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                title="Simulate client paying via Razorpay"
                                onClick={() => {
                                  markPaymentAsPaid(p.id, {
                                    method: 'Razorpay UPI (Fast Pay)',
                                    razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 9)}`
                                  });
                                  loadData();
                                  showToast(`₹${p.amount.toLocaleString('en-IN')} paid by ${p.clientName}! Reminders cancelled.`, 'success');
                                  confetti({ particleCount: 70, spread: 60 });
                                }}
                              >
                                Simulate Pay
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      {/* Subscription Checkout Modal */}
      <SubscriptionCheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        selectedPlan={selectedPlanForCheckout}
        initialPeriod={checkoutPeriod}
        onSuccess={() => {
          loadData();
          showToast('Account upgraded successfully!', 'success');
        }}
        onShowToast={showToast}
      />

      {/* Contextual Limit Reached Modal */}
      <LimitReachedModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        featureName="payment trackers & AI copywriter"
        currentUsage={5}
        limit={5}
        targetPlan="PRO"
        onUpgrade={() => {
          setSelectedPlanForCheckout(getUserPlan(currentUser.id).id === 'plan_pro' ? getUserPlan(currentUser.id) : { id: 'plan_pro', name: 'PRO', monthly_price: 499, six_month_price: 2499, yearly_price: 4499 });
          setCheckoutModalOpen(true);
        }}
      />

      {/* Modals & Drawers */}
      <CreatePaymentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => {
          loadData();
          setActiveStep(3);
        }}
        onShowToast={showToast}
      />

      <RazorpayQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        payment={selectedPayment || rahulPayment}
        onTriggerPay={() => {
          const target = selectedPayment || rahulPayment;
          if (target) {
            markPaymentAsPaid(target.id);
            loadData();
            setActiveStep(12);
            showToast(`₹${target.amount.toLocaleString('en-IN')} captured via Razorpay! Reminders halted.`, 'success');
          }
        }}
        onShowToast={showToast}
      />

      <AIReminderModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        payment={selectedPayment || rahulPayment}
        onShowToast={showToast}
      />

      <WebhookDrawer
        isOpen={webhookDrawerOpen}
        onClose={() => setWebhookDrawerOpen(false)}
        logs={webhooks}
      />

      {/* Toast Notification Stack */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={16} color="#10B981" />}
            {t.type === 'warning' && <AlertCircle size={16} color="#F59E0B" />}
            {t.type === 'info' && <Sparkles size={16} color="#6366F1" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
