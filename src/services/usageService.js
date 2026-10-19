// Usage Tracking Service for DUEZY
// Tracks and increments consumption against plan limits

import { getDbUsage, saveDbUsage } from '../data/dbStore';
import { getUserPlan } from './subscriptionService';

export const getUsage = (userId) => {
  const allUsage = getDbUsage();
  if (!allUsage[userId]) {
    allUsage[userId] = {
      payments_tracked_this_month: 0,
      customers_count: 0,
      ai_generations_this_month: 0,
      whatsapp_sent_this_month: 0,
      sms_sent_this_month: 0,
      voice_calls_this_month: 0,
      team_members_count: 1,
      period_month: new Date().toISOString().substring(0, 7)
    };
    saveDbUsage(allUsage);
  }
  return allUsage[userId];
};

export const getLimit = (userId, featureKey) => {
  const plan = getUserPlan(userId);
  return plan.limits?.[featureKey] ?? 0;
};

export const canUse = (userId, featureKey) => {
  const usage = getUsage(userId);
  const limit = getLimit(userId, featureKey);
  const currentVal = usage[featureKey] || 0;
  return currentVal < limit;
};

export const incrementUsage = (userId, featureKey, count = 1) => {
  const allUsage = getDbUsage();
  const current = getUsage(userId);
  
  allUsage[userId] = {
    ...current,
    [featureKey]: (current[featureKey] || 0) + count
  };

  saveDbUsage(allUsage);
  return allUsage[userId];
};
