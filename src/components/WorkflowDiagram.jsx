import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Smartphone, 
  QrCode, 
  BellRing, 
  Zap, 
  ShieldCheck,
  CreditCard,
  Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WORKFLOW_STEPS = [
  { id: 1, title: 'Dashboard', desc: 'Central hub for cashflow', icon: '📊', group: 'Setup' },
  { id: 2, title: 'Create Payment', desc: 'Add client & invoice details', icon: '📝', group: 'Setup' },
  { id: 3, title: 'Rahul — ₹25,000', desc: 'Set amount & due date', icon: '👤', group: 'Setup' },
  { id: 4, title: 'Razorpay Link & QR', desc: 'Instant UPI & gateway link', icon: '💳', group: 'Generation' },
  { id: 5, title: 'Share with Rahul', desc: 'Sent via WhatsApp & Email', icon: '📤', group: 'Outreach' },
  { id: 6, title: 'Remains Unpaid', desc: 'Client delayed payment', icon: '⏳', group: 'Tracking' },
  { id: 7, title: 'Tracks Due Date', desc: 'Smart cron monitors timeline', icon: '📅', group: 'Tracking' },
  { id: 8, title: 'AI Generates Reminders', desc: 'Context & tone progression', icon: '🤖', group: 'AI Engine' },
  { id: 9, title: 'WhatsApp / Email / SMS', desc: 'Multi-channel auto dispatch', icon: '📱', group: 'AI Engine' },
  { id: 10, title: 'Rahul Pays via Razorpay', desc: 'Scans QR or clicks UPI link', icon: '💰', group: 'Settlement' },
  { id: 11, title: 'Razorpay Webhook', desc: 'payment.captured event verified', icon: '⚡', group: 'Verification' },
  { id: 12, title: '₹25,000 → PAID ✓', desc: 'ALL FUTURE REMINDERS STOP', icon: '🎉', group: 'Complete' }
];

export default function WorkflowDiagram({ activeStep, setActiveStep, onTriggerPayment, isRahulPaid }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => {
          if (prev >= 12) {
            setIsPlaying(false);
            return 12;
          }
          const next = prev + 1;
          if (next === 10 && !isRahulPaid) {
            // Trigger Rahul payment simulation on reaching step 10-12
            onTriggerPayment && onTriggerPayment();
          }
          if (next === 12) {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 },
              colors: ['#10B981', '#34D399', '#6366F1', '#F59E0B']
            });
          }
          return next;
        });
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRahulPaid, onTriggerPayment, setActiveStep]);

  const handlePlayFlow = () => {
    setActiveStep(1);
    setIsPlaying(true);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStep(1);
  };

  return (
    <div className="workflow-section">
      <div className="workflow-header">
        <div className="workflow-title-box">
          <h2>
            <Zap size={22} className="trend-up" />
            DUEZY Automated Payment Lifecycle
          </h2>
          <p className="workflow-subtitle">
            The complete 12-step autonomous recovery engine: from Razorpay generation to AI reminder halting.
          </p>
        </div>

        <div className="workflow-controls">
          <button 
            id="btn-run-workflow"
            className="btn-primary" 
            onClick={handlePlayFlow}
            title="Automatically run the entire story step by step"
          >
            <Play size={16} />
            {isPlaying ? 'Playing Simulation...' : 'Play Live Story (Step 1 → 12)'}
          </button>

          <button 
            id="btn-reset-workflow"
            className="btn-secondary" 
            onClick={handleReset}
          >
            <RotateCcw size={16} />
            Reset Flow
          </button>
        </div>
      </div>

      {/* Active step banner */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{
            fontSize: '1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '0.3rem 0.6rem',
            borderRadius: '6px'
          }}>
            {WORKFLOW_STEPS[activeStep - 1]?.icon}
          </span>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Step {activeStep} of 12: {WORKFLOW_STEPS[activeStep - 1]?.title}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              {WORKFLOW_STEPS[activeStep - 1]?.desc}
            </div>
          </div>
        </div>

        {activeStep === 12 && (
          <div className="badge-glow-green" style={{ padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} />
            ALL REMINDERS HALTED PERMANENTLY
          </div>
        )}
      </div>

      {/* Visual node grid */}
      <div className="interactive-stepper">
        {WORKFLOW_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;

          return (
            <div
              key={step.id}
              id={`step-node-${step.id}`}
              className={`step-node ${isActive ? 'active-node' : ''} ${isCompleted ? 'completed-node' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="step-icon">
                {isCompleted ? <CheckCircle2 size={14} /> : step.id}
              </div>
              <div className="step-label">{step.title}</div>
              <div className="step-desc">{step.desc}</div>
              {step.id === 12 && (
                <div style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  color: '#10B981',
                  marginTop: '0.2rem'
                }}>
                  ZERO CHASE ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
