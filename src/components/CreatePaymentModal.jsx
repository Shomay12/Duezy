import React, { useState } from 'react';
import { X, Plus, Sparkles, QrCode, CreditCard, ShieldCheck, User, Building, Phone, Mail, FileText } from 'lucide-react';
import { addPayment } from '../services/storage';

export default function CreatePaymentModal({ isOpen, onClose, onCreated, onShowToast }) {
  const [formData, setFormData] = useState({
    clientName: 'Rahul Sharma',
    clientCompany: 'Apex Dynamics Pvt Ltd',
    clientPhone: '+91 98765 43210',
    clientEmail: 'rahul@apexdynamics.in',
    clientGst: '27AADCA1234F1Z8',
    amount: 25000,
    invoiceNumber: `DZ-${Math.floor(1000 + Math.random() * 9000)}`,
    description: 'Full Stack Web Application & SEO Milestones',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    reminderStrategy: 'smart_adaptive'
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.clientName || !formData.amount) {
      onShowToast && onShowToast('Please fill in client name and amount', 'warning');
      return;
    }

    const created = addPayment({
      ...formData,
      amount: Number(formData.amount)
    });

    onShowToast && onShowToast(`Payment created for ${formData.clientName} (₹${Number(formData.amount).toLocaleString('en-IN')})!`, 'success');
    onCreated && onCreated(created);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={20} color="#10B981" />
              Create Payment Request
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Generates an instant Razorpay link, dynamic UPI QR code, and triggers smart AI follow-ups.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Client / Debtor Name</label>
              <input 
                className="form-input" 
                value={formData.clientName} 
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Entity</label>
              <input 
                className="form-input" 
                value={formData.clientCompany} 
                onChange={(e) => setFormData({ ...formData, clientCompany: e.target.value })}
                placeholder="e.g. Apex Dynamics Pvt Ltd"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">WhatsApp / Mobile Number</label>
              <input 
                className="form-input" 
                value={formData.clientPhone} 
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email"
                className="form-input" 
                value={formData.clientEmail} 
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                placeholder="rahul@example.com"
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Amount (₹ INR)</label>
              <input 
                type="number"
                className="form-input" 
                value={formData.amount} 
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="25000"
                style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Due Date</label>
              <input 
                type="date"
                className="form-input" 
                value={formData.dueDate} 
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Description / Purpose</label>
            <input 
              className="form-input" 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Full Stack Web Application & SEO Milestones - Sprint 3"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={14} color="#6366F1" />
              AI Reminder Strategy Profile
            </label>
            <select 
              className="form-input"
              value={formData.reminderStrategy}
              onChange={(e) => setFormData({ ...formData, reminderStrategy: e.target.value })}
            >
              <option value="smart_adaptive">🌟 Smart Adaptive AI (Escalates tone automatically on delay)</option>
              <option value="gentle">🌱 Gentle & Courteous (Warm nudges for VIP clients)</option>
              <option value="balanced">⚡ Balanced Professional (Standard B2B agency cadence)</option>
              <option value="firm">🔥 Firm & Account-Aware (Strict terms with audit reminders)</option>
            </select>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button id="btn-submit-payment" type="submit" className="btn-primary">
              <Sparkles size={16} />
              Generate Razorpay Link & Activate DUEZY
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
