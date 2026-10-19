// Centralized Entitlement & Capability Service for DUEZY
// Protects feature gating across the application without hardcoded checks

import { getUserSubscription, getUserPlan } from './subscriptionService';
import { getDbFeatureFlags } from '../data/dbStore';
import { getUsage, getLimit } from './usageService';

export const EntitlementService = {
  // Check if a global feature flag is enabled
  isFeatureFlagActive: (flagKey, planId = null) => {
    const flags = getDbFeatureFlags();
    const flag = flags.find(f => f.key === flagKey);
    if (!flag) return true;
    if (!flag.enabled_globally) return false;
    if (planId && flag.plan_overrides && flag.plan_overrides[planId] !== undefined) {
      return flag.plan_overrides[planId];
    }
    return true;
  },

  // 1. Payment Trackers
  canCreatePayment: (userId) => {
    const sub = getUserSubscription(userId);
    const plan = getUserPlan(userId);
    const usage = getUsage(userId);
    const limit = plan.limits?.payment_trackers || 5;

    // Check feature limit
    return usage.payments_tracked_this_month < limit;
  },

  // 2. AI Assistant & Tone Progression
  canUseAI: (userId) => {
    const sub = getUserSubscription(userId);
    const plan = getUserPlan(userId);
    const flagEnabled = EntitlementService.isFeatureFlagActive('ai_assistant', plan.id);
    if (!flagEnabled) return false;

    const usage = getUsage(userId);
    const limit = plan.limits?.ai_generations_monthly || 0;
    return usage.ai_generations_this_month < limit;
  },

  // 3. WhatsApp Integration
  canUseWhatsApp: (userId) => {
    const plan = getUserPlan(userId);
    const flagEnabled = EntitlementService.isFeatureFlagActive('whatsapp', plan.id);
    if (!flagEnabled) return false;

    const usage = getUsage(userId);
    const limit = plan.limits?.whatsapp_monthly || 0;
    return usage.whatsapp_sent_this_month < limit;
  },

  // 4. SMS Gateway
  canUseSMS: (userId) => {
    const plan = getUserPlan(userId);
    const flagEnabled = EntitlementService.isFeatureFlagActive('sms', plan.id);
    if (!flagEnabled) return false;

    const usage = getUsage(userId);
    const limit = plan.limits?.sms_monthly || 0;
    return usage.sms_sent_this_month < limit;
  },

  // 5. Automated Voice Calls
  canUseVoice: (userId) => {
    const plan = getUserPlan(userId);
    const flagEnabled = EntitlementService.isFeatureFlagActive('voice', plan.id);
    if (!flagEnabled) return false;

    const usage = getUsage(userId);
    const limit = plan.limits?.voice_monthly || 0;
    return usage.voice_calls_this_month < limit;
  },

  // 6. Advanced Analytics
  canUseAdvancedAnalytics: (userId) => {
    const plan = getUserPlan(userId);
    if (plan.id === 'plan_free') return false;
    return EntitlementService.isFeatureFlagActive('advanced_analytics', plan.id);
  },

  // 7. Team Members
  canAddTeamMember: (userId) => {
    const plan = getUserPlan(userId);
    const flagEnabled = EntitlementService.isFeatureFlagActive('team_members', plan.id);
    if (!flagEnabled) return false;

    const usage = getUsage(userId);
    const limit = plan.limits?.team_members || 1;
    return usage.team_members_count < limit;
  }
};
