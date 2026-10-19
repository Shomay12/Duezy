import React, { useState } from 'react';
import { Sliders, Save, CheckCircle2, Sparkles, Plus, Trash2 } from 'lucide-react';
import { getDbPlans } from '../../data/dbStore';
import { adminUpdatePlan } from '../../services/adminService';
import { getCurrentUser } from '../../services/authService';

export default function AdminPlansEditor({ onShowToast }) {
  const [plans, setPlans] = useState(getDbPlans());
  const [editingPlanId, setEditingPlanId] = useState(plans[1]?.id || 'plan_pro');
  const activePlan = plans.find(p => p.id === editingPlanId) || plans[0];

  const [form, setForm] = useState({
    monthly_price: activePlan.monthly_price,
    six_month_price: activePlan.six_month_price,
    yearly_price: activePlan.yearly_price,
    payment_trackers: activePlan.limits?.payment_trackers || 100,
    customers: activePlan.limits?.customers || 999999,
    ai_generations_monthly: activePlan.limits?.ai_generations_monthly || 500,
    whatsapp_monthly: activePlan.limits?.whatsapp_monthly || 500,
    sms_monthly: activePlan.limits?.sms_monthly || 200,
    voice_monthly: activePlan.limits?.voice_monthly || 0,
    team_members: activePlan.limits?.team_members || 1
  });

  const handleSelectPlan = (planId) => {
    setEditingPlanId(planId);
    const p = plans.find(item => item.id === planId);
    if (p) {
      setForm({
        monthly_price: p.monthly_price,
        six_month_price: p.six_month_price,
        yearly_price: p.yearly_price,
        payment_trackers: p.limits?.payment_trackers || 100,
        customers: p.limits?.customers || 999999,
        ai_generations_monthly: p.limits?.ai_generations_monthly || 500,
        whatsapp_monthly: p.limits?.whatsapp_monthly || 500,
        sms_monthly: p.limits?.sms_monthly || 200,
        voice_monthly: p.limits?.voice_monthly || 0,
        team_members: p.limits?.team_members || 1
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const updated = adminUpdatePlan({
      planId: editingPlanId,
      updates: {
        monthly_price: Number(form.monthly_price),
        six_month_price: Number(form.six_month_price),
        yearly_price: Number(form.yearly_price),
        limits: {
          payment_trackers: Number(form.payment_trackers),
          customers: Number(form.customers),
          ai_generations_monthly: Number(form.ai_generations_monthly),
          whatsapp_monthly: Number(form.whatsapp_monthly),
          sms_monthly: Number(form.sms_monthly),
          voice_monthly: Number(form.voice_monthly),
          team_members: Number(form.team_members)
        }
      },
      adminActor: getCurrentUser()
    });

    setPlans(getDbPlans());
    onShowToast && onShowToast(`Plan ${activePlan.name} updated! Changes are live on customer pricing page.`, 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Plans & Pricing Configuration Engine</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Database-driven plan parameters. Changing prices and quotas instantly updates the pricing page and entitlement limits.
        </p>
      </div>

      {/* Plan Selector Pills */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem' }}>
        {plans.map((p) => (
          <button
            key={p.id}
            id={`plan-editor-btn-${p.slug}`}
            className={`btn-secondary ${editingPlanId === p.id ? 'active' : ''}`}
            style={{
              padding: '0.65rem 1.25rem',
              background: editingPlanId === p.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(30, 41, 59, 0.7)',
              borderColor: editingPlanId === p.id ? '#6366F1' : 'rgba(255, 255, 255, 0.1)',
              color: editingPlanId === p.id ? '#FFFFFF' : '#94A3B8',
              fontWeight: 800
            }}
            onClick={() => handleSelectPlan(p.id)}
          >
            {p.name} Plan
          </button>
        ))}
      </div>

      {/* Form Editor */}
      <form onSubmit={handleSave} style={{
        background: '#0D131F',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem'
      }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="#6366F1" />
          Configuring {activePlan.name} Plan
        </h3>

        {/* Pricing Rows */}
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Billing Period Rates (₹ INR)
        </div>
        <div className="form-row-2" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Monthly Price (₹)</label>
            <input 
              type="number" 
              className="form-input" 
              value={form.monthly_price}
              onChange={(e) => setForm({ ...form, monthly_price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">6-Month Price (₹)</label>
            <input 
              type="number" 
              className="form-input" 
              value={form.six_month_price}
              onChange={(e) => setForm({ ...form, six_month_price: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Yearly Price (₹)</label>
            <input 
              type="number" 
              className="form-input" 
              value={form.yearly_price}
              onChange={(e) => setForm({ ...form, yearly_price: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Limits & Quotas */}
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Entitlement Quotas & Consumption Limits
        </div>
        <div className="form-row-2" style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Payment Trackers Limit</label>
            <input 
              type="number" 
              className="form-input" 
              value={form.payment_trackers}
              onChange={(e) => setForm({ ...form, payment_trackers: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">AI Message Generations (Monthly)</label>
            <input 
              type="number" 
              className="form-input" 
              value={form.ai_generations_monthly}
              onChange={(e) => setForm({ ...form, ai_generations_monthly: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">WhatsApp Delivery Quota (Monthly)</label>
            <input 
              type="number" 
              className="form-input" 
              value={form.whatsapp_monthly}
              onChange={(e) => setForm({ ...form, whatsapp_monthly: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">SMS Alerts Quota (Monthly)</label>
            <input 
              type="number" 
              className="form-input" 
              value={form.sms_monthly}
              onChange={(e) => setForm({ ...form, sms_monthly: e.target.value })}
              required
            />
          </div>
        </div>

        <button type="submit" id="btn-save-plan-config" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>
          <Save size={16} />
          Save & Publish to Pricing Page
        </button>
      </form>
    </div>
  );
}
