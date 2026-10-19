import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  ShieldAlert,
  Languages,
  Sliders,
  CheckCheck,
  Ban
} from 'lucide-react';
import { generateAIReminder, TONE_PROFILES } from '../services/aiReminderEngine';

export default function AIReminderModal({ isOpen, onClose, payment, onShowToast }) {
  const [selectedChannel, setSelectedChannel] = useState('whatsapp'); // whatsapp, email, sms
  const [selectedTone, setSelectedTone] = useState('BALANCED');
  const [selectedLang, setSelectedLang] = useState('English');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !payment) return null;

  const isPaid = payment.status === 'PAID';

  const reminderContent = generateAIReminder({
    clientName: payment.clientName,
    amount: payment.amount,
    invoiceNumber: payment.invoiceNumber,
    dueDate: payment.dueDate || '5th Aug',
    daysOverdue: 3,
    tone: selectedTone,
    razorpayUrl: payment.razorpayUrl,
    language: selectedLang
  });

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast && onShowToast('Reminder copy copied to clipboard!', 'info');
  };

  const handleSimulateSend = () => {
    onShowToast && onShowToast(`Simulated sending ${selectedChannel.toUpperCase()} to ${payment.clientName}!`, 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={20} color="#6366F1" />
              AI Reminder Studio & Multi-Channel Preview
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Generating personalized follow-up copies for {payment.clientName} (₹{payment.amount.toLocaleString('en-IN')})
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Paid Notice Banner */}
        {isPaid && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#10B981',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <Ban size={16} />
            PAYMENT VERIFIED (₹25,000 → PAID ✓) — All automated reminder bots are currently paused for this client.
          </div>
        )}

        <div className="modal-body">
          {/* Controls Bar: Channel Tabs, Tone Selector, Language */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            {/* Tone Selector */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Sliders size={14} />
                AI Tone Escalation
              </label>
              <select 
                className="form-input" 
                value={selectedTone}
                onChange={(e) => setSelectedTone(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="GENTLE">Stage 1: Gentle & Courteous</option>
                <option value="BALANCED">Stage 2: Balanced Professional</option>
                <option value="FIRM">Stage 3: Firm & Account-Aware</option>
                <option value="ESCALATED">Stage 4: Escalated Formal Notice</option>
              </select>
            </div>

            {/* Language Selector */}
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Languages size={14} />
                Localization
              </label>
              <select 
                className="form-input" 
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
              >
                <option value="English">English (Standard)</option>
                <option value="Hinglish">Hinglish (Casual & Friendly)</option>
              </select>
            </div>

            {/* Tone Description */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Current Strategy</div>
              <div style={{ fontSize: '0.8rem', color: TONE_PROFILES[selectedTone]?.color, fontWeight: 700 }}>
                {TONE_PROFILES[selectedTone]?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: '1.2', marginTop: '0.2rem' }}>
                {TONE_PROFILES[selectedTone]?.description}
              </div>
            </div>
          </div>

          {/* Channel Switcher Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button 
              className={`btn-secondary ${selectedChannel === 'whatsapp' ? 'active' : ''}`}
              style={{
                background: selectedChannel === 'whatsapp' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                borderColor: selectedChannel === 'whatsapp' ? '#25D366' : 'var(--border-subtle)',
                color: selectedChannel === 'whatsapp' ? '#25D366' : 'var(--text-secondary)'
              }}
              onClick={() => setSelectedChannel('whatsapp')}
            >
              <Smartphone size={16} />
              WhatsApp Message
            </button>

            <button 
              className={`btn-secondary ${selectedChannel === 'email' ? 'active' : ''}`}
              style={{
                background: selectedChannel === 'email' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                borderColor: selectedChannel === 'email' ? '#6366F1' : 'var(--border-subtle)',
                color: selectedChannel === 'email' ? '#818CF8' : 'var(--text-secondary)'
              }}
              onClick={() => setSelectedChannel('email')}
            >
              <Mail size={16} />
              Email Notification
            </button>

            <button 
              className={`btn-secondary ${selectedChannel === 'sms' ? 'active' : ''}`}
              style={{
                background: selectedChannel === 'sms' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.6)',
                borderColor: selectedChannel === 'sms' ? '#F59E0B' : 'var(--border-subtle)',
                color: selectedChannel === 'sms' ? '#FBBF24' : 'var(--text-secondary)'
              }}
              onClick={() => setSelectedChannel('sms')}
            >
              <MessageSquare size={16} />
              SMS Alert
            </button>
          </div>

          {/* Channel Previews */}
          {selectedChannel === 'whatsapp' && (
            <div className="whatsapp-chat-container">
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#128C7E',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem'
                }}>
                  RS
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E9EDEF' }}>
                    {payment.clientName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#8696A0' }}>
                    {payment.clientPhone} • Online
                  </div>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="wa-message-bubble">
                <div style={{ whiteSpace: 'pre-line', marginBottom: '0.75rem' }}>
                  {reminderContent.whatsapp}
                </div>

                <div className="wa-payment-card">
                  <div style={{ fontSize: '0.75rem', color: '#8696A0' }}>Razorpay Payment Gateway</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#E9EDEF' }}>
                    Invoice #{payment.invoiceNumber} • ₹{payment.amount.toLocaleString('en-IN')}
                  </div>
                  <a 
                    href={payment.razorpayUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="wa-cta-btn"
                    onClick={(e) => e.preventDefault()}
                  >
                    Pay ₹{payment.amount.toLocaleString('en-IN')} via Razorpay
                  </a>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.3rem',
                  fontSize: '0.68rem',
                  color: '#8696A0',
                  marginTop: '0.4rem'
                }}>
                  <span>10:30 AM</span>
                  <CheckCheck size={14} color="#53BDEB" />
                </div>
              </div>
            </div>
          )}

          {selectedChannel === 'email' && (
            <div style={{
              background: '#FFFFFF',
              color: '#0F172A',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div><strong>To:</strong> {payment.clientName} &lt;{payment.clientEmail}&gt;</div>
                <div style={{ marginTop: '0.2rem' }}>
                  <strong>Subject:</strong> {reminderContent.email.subject}
                </div>
              </div>

              <div style={{
                background: '#0B0F17',
                color: '#FFFFFF',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>⚡ DUEZY</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Automated Billing Delivery</div>
              </div>

              <div style={{ whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: '1.6', color: '#334155', marginBottom: '1.5rem' }}>
                {reminderContent.email.body}
              </div>

              <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                <a 
                  href={payment.razorpayUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={(e) => e.preventDefault()}
                  style={{
                    background: '#10B981',
                    color: '#FFFFFF',
                    padding: '0.85rem 2rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Pay ₹{payment.amount.toLocaleString('en-IN')} via Razorpay
                </a>
              </div>
            </div>
          )}

          {selectedChannel === 'sms' && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                SMS Broadcast Preview • 160 Characters
              </div>
              <div style={{
                background: 'rgba(30, 41, 59, 0.8)',
                padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                borderLeft: '3px solid #F59E0B'
              }}>
                {reminderContent.sms}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            <button 
              className="btn-ghost" 
              onClick={() => handleCopy(
                selectedChannel === 'whatsapp' 
                  ? reminderContent.whatsapp 
                  : selectedChannel === 'email' 
                  ? reminderContent.email.body 
                  : reminderContent.sms
              )}
            >
              {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Template Text'}
            </button>

            <button 
              className="btn-primary" 
              onClick={handleSimulateSend}
            >
              <Send size={16} />
              Dispatch Simulated {selectedChannel.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
