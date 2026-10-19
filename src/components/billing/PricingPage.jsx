import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  CreditCard,
  Layers,
  HelpCircle
} from 'lucide-react';
import { getActivePlans, BILLING_PERIODS, getUserSubscription } from '../../services/subscriptionService';
import { getCurrentUser } from '../../services/authService';

export default function PricingPage({ onSelectPlan, onShowToast }) {
  const [billingPeriod, setBillingPeriod] = useState(BILLING_PERIODS.MONTHLY);
  const plans = getActivePlans();
  const currentUser = getCurrentUser();
  const currentSub = getUserSubscription(currentUser.id);

  // Dynamic discount calculation based on database pricing
  const proPlan = plans.find(p => p.slug === 'pro');
  const proMonthly = proPlan?.monthly_price || 499;
  const proSixMonth = proPlan?.six_month_price || 2499;
  const proYearly = proPlan?.yearly_price || 4499;

  const sixMonthDiscount = Math.round((1 - (proSixMonth / (proMonthly * 6))) * 100);
  const yearlyDiscount = Math.round((1 - (proYearly / (proMonthly * 12))) * 100);

  const getPriceForPeriod = (plan) => {
    if (billingPeriod === BILLING_PERIODS.SIX_MONTHS) {
      return {
        amount: plan.six_month_price,
        periodLabel: '/ 6 months',
        monthlyEquiv: Math.round(plan.six_month_price / 6)
      };
    }
    if (billingPeriod === BILLING_PERIODS.YEARLY) {
      return {
        amount: plan.yearly_price,
        periodLabel: '/ year',
        monthlyEquiv: Math.round(plan.yearly_price / 12)
      };
    }
    return {
      amount: plan.monthly_price,
      periodLabel: '/ month',
      monthlyEquiv: plan.monthly_price
    };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Pricing Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.9rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10B981',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          <Sparkles size={14} />
          Predictable, ROI-Positive Pricing
        </div>

        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.6rem' }}>
          Simple pricing.
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          More money. Less chasing.
        </p>

        {/* Billing Period Selector */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          background: 'rgba(17, 24, 39, 0.9)',
          padding: '0.4rem',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-medium)',
          marginTop: '2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <button
            id="period-btn-monthly"
            className={`btn-ghost ${billingPeriod === BILLING_PERIODS.MONTHLY ? 'active-pill' : ''}`}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: billingPeriod === BILLING_PERIODS.MONTHLY ? '#FFFFFF' : 'var(--text-secondary)',
              background: billingPeriod === BILLING_PERIODS.MONTHLY ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              border: billingPeriod === BILLING_PERIODS.MONTHLY ? '1px solid #10B981' : 'none'
            }}
            onClick={() => setBillingPeriod(BILLING_PERIODS.MONTHLY)}
          >
            Monthly
          </button>

          <button
            id="period-btn-six-months"
            className={`btn-ghost ${billingPeriod === BILLING_PERIODS.SIX_MONTHS ? 'active-pill' : ''}`}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: billingPeriod === BILLING_PERIODS.SIX_MONTHS ? '#FFFFFF' : 'var(--text-secondary)',
              background: billingPeriod === BILLING_PERIODS.SIX_MONTHS ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              border: billingPeriod === BILLING_PERIODS.SIX_MONTHS ? '1px solid #10B981' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setBillingPeriod(BILLING_PERIODS.SIX_MONTHS)}
          >
            6 Months
            <span style={{ background: '#6366F1', color: '#FFFFFF', fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '10px' }}>
              Save {sixMonthDiscount > 0 ? `${sixMonthDiscount}%` : '16%'}
            </span>
          </button>

          <button
            id="period-btn-yearly"
            className={`btn-ghost ${billingPeriod === BILLING_PERIODS.YEARLY ? 'active-pill' : ''}`}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: billingPeriod === BILLING_PERIODS.YEARLY ? '#FFFFFF' : 'var(--text-secondary)',
              background: billingPeriod === BILLING_PERIODS.YEARLY ? 'rgba(16, 185, 129, 0.25)' : 'transparent',
              border: billingPeriod === BILLING_PERIODS.YEARLY ? '1px solid #10B981' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
            onClick={() => setBillingPeriod(BILLING_PERIODS.YEARLY)}
          >
            Yearly
            <span style={{ background: '#10B981', color: '#0B0F17', fontSize: '0.68rem', fontWeight: 800, padding: '0.15rem 0.45rem', borderRadius: '10px' }}>
              Save {yearlyDiscount > 0 ? `${yearlyDiscount}%` : '25%'}
            </span>
          </button>
        </div>
      </div>

      {/* 3-Column Plan Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'stretch'
      }}>
        {plans.map((plan) => {
          const isPro = plan.slug === 'pro';
          const isCurrentPlan = currentSub?.plan_id === plan.id && currentSub?.status === 'ACTIVE';
          const priceInfo = getPriceForPeriod(plan);

          return (
            <div
              key={plan.id}
              id={`plan-card-${plan.slug}`}
              style={{
                background: isPro 
                  ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)' 
                  : 'var(--bg-card)',
                border: isPro ? '2px solid #10B981' : '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '2.5rem 2rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isPro ? '0 20px 45px rgba(16, 185, 129, 0.18)' : 'var(--shadow-md)',
                transform: isPro ? 'scale(1.02)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              {/* Badge */}
              {isPro && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#FFFFFF',
                  padding: '0.3rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}>
                  RECOMMENDED FOR FREELANCERS
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{plan.name}</h3>
                  {plan.badge_text && !isPro && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', background: 'rgba(255, 255, 255, 0.06)', padding: '0.2rem 0.55rem', borderRadius: '4px' }}>
                      {plan.badge_text}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', minHeight: '44px', marginBottom: '1.5rem' }}>
                  {plan.description}
                </p>

                {/* Price Box */}
                <div style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '1.5rem',
                  marginBottom: '1.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                    <span style={{ fontSize: '2.75rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#FFFFFF' }}>
                      ₹{priceInfo.amount.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      {priceInfo.periodLabel}
                    </span>
                  </div>

                  {billingPeriod !== BILLING_PERIODS.MONTHLY && plan.monthly_price > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 600, marginTop: '0.2rem' }}>
                      ₹{priceInfo.monthlyEquiv.toLocaleString('en-IN')} / month billed {billingPeriod === BILLING_PERIODS.YEARLY ? 'annually' : 'semi-annually'}
                    </div>
                  )}
                </div>

                {/* Feature Limits & Capabilities */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                    Plan Entitlements & Limits
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.features.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: isPro ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          color: isPro ? '#10B981' : '#94A3B8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrentPlan ? (
                  <button 
                    disabled
                    className="btn-secondary" 
                    style={{ width: '100%', justifyContent: 'center', opacity: 0.7, cursor: 'default' }}
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    id={`btn-select-${plan.slug}`}
                    className={isPro ? "btn-primary" : "btn-secondary"}
                    style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
                    onClick={() => onSelectPlan && onSelectPlan(plan, billingPeriod)}
                  >
                    {plan.monthly_price === 0 ? 'Start Free' : `Upgrade to ${plan.name}`}
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div style={{
        marginTop: '3.5rem',
        textAlign: 'center',
        padding: '1.75rem',
        background: 'rgba(15, 23, 42, 0.6)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        flexWrap: 'wrap',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="#10B981" />
          <span>GST compliant tax invoices</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CreditCard size={18} color="#6366F1" />
          <span>Razorpay verified subscription security</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={18} color="#F59E0B" />
          <span>Cancel anytime with grace period retention</span>
        </div>
      </div>
    </div>
  );
}
