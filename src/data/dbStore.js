// DUEZY Database Store & State Management Engine
// Houses Plans, Subscriptions, Users, Invoices, Usage, Audit Logs, Feature Flags, and Customers

const DB_KEYS = {
  PLANS: 'duezy_plans_v2',
  SUBSCRIPTIONS: 'duezy_subscriptions_v2',
  USERS: 'duezy_users_v2',
  INVOICES: 'duezy_billing_invoices_v2',
  USAGE: 'duezy_usage_v2',
  AUDIT_LOGS: 'duezy_audit_logs_v2',
  FEATURE_FLAGS: 'duezy_feature_flags_v2',
  NOTIFICATIONS: 'duezy_admin_notifications_v2',
  CUSTOMERS: 'duezy_user_customers_v2',
  AUTH_SESSION: 'duezy_auth_session_v2'
};

// 1. Initial Plans (Database-Driven, NOT hardcoded)
export const INITIAL_PLANS = [
  {
    id: "plan_free",
    name: "FREE",
    slug: "free",
    description: "For individuals and freelancers trying DUEZY payment tracking.",
    active: true,
    monthly_price: 0,
    six_month_price: 0,
    yearly_price: 0,
    currency: "INR",
    features: [
      "5 active payment trackers",
      "10 debtor customers",
      "Basic payment tracking",
      "Manual payment status",
      "Standard dashboard",
      "Limited email reminders"
    ],
    limits: {
      payment_trackers: 5,
      customers: 10,
      ai_generations_monthly: 10,
      whatsapp_monthly: 0,
      sms_monthly: 0,
      voice_monthly: 0,
      team_members: 1
    },
    highlight: false,
    badge_text: "Free Forever",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z"
  },
  {
    id: "plan_pro",
    name: "PRO",
    slug: "pro",
    description: "For professional freelancers and independent consultants.",
    active: true,
    monthly_price: 499,
    six_month_price: 2499, // ~16% discount
    yearly_price: 4499,    // ~25% discount
    currency: "INR",
    features: [
      "100 active payment trackers",
      "Unlimited customers",
      "Instant Razorpay payment links & QR",
      "Automated WhatsApp, Email & SMS",
      "AI tone progression & copywriter",
      "AI reply understanding",
      "Advanced cashflow analytics",
      "Real-time webhook sync"
    ],
    limits: {
      payment_trackers: 100,
      customers: 999999,
      ai_generations_monthly: 500,
      whatsapp_monthly: 500,
      sms_monthly: 200,
      voice_monthly: 0,
      team_members: 1
    },
    highlight: true,
    badge_text: "Most Popular",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z"
  },
  {
    id: "plan_business",
    name: "BUSINESS",
    slug: "business",
    description: "For agencies, studios, and high-volume B2B teams.",
    active: true,
    monthly_price: 1499,
    six_month_price: 7499,
    yearly_price: 13499,
    currency: "INR",
    features: [
      "Unlimited active payment trackers",
      "Unlimited customers",
      "Everything in Pro included",
      "Up to 5 Team members",
      "Automated voice call reminders",
      "Priority API & Webhook dispatch",
      "Multi-currency support",
      "Dedicated account manager",
      "Custom SLA & Audit logs"
    ],
    limits: {
      payment_trackers: 999999,
      customers: 999999,
      ai_generations_monthly: 2500,
      whatsapp_monthly: 2500,
      sms_monthly: 1000,
      voice_monthly: 100,
      team_members: 5
    },
    highlight: false,
    badge_text: "For Agencies",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z"
  }
];

// 2. Initial Users (with roles USER, ADMIN, SUPER_ADMIN)
export const INITIAL_USERS = [
  {
    id: "usr_rahul_sharma",
    name: "Rahul Sharma",
    email: "rahul@apexdynamics.in",
    phone: "+91 98765 43210",
    company: "Apex Dynamics Pvt Ltd",
    role: "USER",
    status: "ACTIVE",
    timezone: "Asia/Kolkata (IST)",
    currency: "INR",
    mrr: 499,
    ltv: 2994,
    tags: ["High Value", "Early Adopter"],
    support_notes: [
      { id: "sn_1", text: "Requested webhook integration for ERP system on Aug 2.", author: "Admin Sarah", created_at: "2026-08-02T10:00:00Z" }
    ],
    created_at: "2026-03-15T09:30:00Z",
    last_login: "2026-08-08T14:10:00Z"
  },
  {
    id: "usr_priya_patel",
    name: "Priya Patel",
    email: "priya@finpulselabs.com",
    phone: "+91 98220 11990",
    company: "FinPulse Labs",
    role: "USER",
    status: "ACTIVE",
    timezone: "Asia/Kolkata (IST)",
    currency: "INR",
    mrr: 1499,
    ltv: 8994,
    tags: ["VIP", "Business Plan"],
    support_notes: [
      { id: "sn_2", text: "Onboarded team of 3 designers.", author: "Admin Vikram", created_at: "2026-07-20T11:15:00Z" }
    ],
    created_at: "2026-02-10T14:20:00Z",
    last_login: "2026-08-08T11:45:00Z"
  },
  {
    id: "usr_ananya_roy",
    name: "Ananya Roy",
    email: "ananya@studioaura.design",
    phone: "+91 99300 88219",
    company: "Studio Aura Creative",
    role: "USER",
    status: "ACTIVE",
    timezone: "Asia/Kolkata (IST)",
    currency: "INR",
    mrr: 0,
    ltv: 0,
    tags: ["Beta", "Free User"],
    support_notes: [],
    created_at: "2026-08-01T12:00:00Z",
    last_login: "2026-08-07T16:30:00Z"
  },
  {
    id: "usr_vikram_admin",
    name: "Vikram Malhotra",
    email: "admin@duezy.com",
    phone: "+91 98110 99887",
    company: "DUEZY Technologies",
    role: "SUPER_ADMIN",
    status: "ACTIVE",
    timezone: "Asia/Kolkata (IST)",
    currency: "INR",
    mrr: 0,
    ltv: 0,
    tags: ["Internal Staff", "Super Admin"],
    support_notes: [],
    created_at: "2026-01-01T00:00:00Z",
    last_login: "2026-08-08T14:30:00Z"
  }
];

// 3. Initial Subscriptions
export const INITIAL_SUBSCRIPTIONS = [
  {
    id: "sub_rahul_001",
    user_id: "usr_rahul_sharma",
    plan_id: "plan_pro",
    billing_period: "MONTHLY", // MONTHLY, SIX_MONTHS, YEARLY
    status: "ACTIVE", // TRIALING, ACTIVE, PAST_DUE, CANCELLED, EXPIRED, PAUSED
    provider: "RAZORPAY", // RAZORPAY, ADMIN
    provider_customer_id: "cust_RZP_Rahul942",
    provider_subscription_id: "sub_RZP_Pro_9481023",
    started_at: "2026-04-08T10:00:00Z",
    current_period_start: "2026-08-08T10:00:00Z",
    current_period_end: "2026-09-08T10:00:00Z",
    cancel_at_period_end: false,
    cancelled_at: null,
    grace_period_ends_at: null,
    trial_started_at: null,
    trial_ends_at: null,
    granted_by: null,
    grant_reason: null,
    created_at: "2026-04-08T10:00:00Z",
    updated_at: "2026-08-08T10:00:00Z"
  },
  {
    id: "sub_priya_002",
    user_id: "usr_priya_patel",
    plan_id: "plan_business",
    billing_period: "YEARLY",
    status: "ACTIVE",
    provider: "RAZORPAY",
    provider_customer_id: "cust_RZP_Priya882",
    provider_subscription_id: "sub_RZP_Biz_8829104",
    started_at: "2026-02-15T12:00:00Z",
    current_period_start: "2026-02-15T12:00:00Z",
    current_period_end: "2027-02-15T12:00:00Z",
    cancel_at_period_end: false,
    cancelled_at: null,
    grace_period_ends_at: null,
    trial_started_at: null,
    trial_ends_at: null,
    granted_by: null,
    grant_reason: null,
    created_at: "2026-02-15T12:00:00Z",
    updated_at: "2026-02-15T12:00:00Z"
  },
  {
    id: "sub_ananya_003",
    user_id: "usr_ananya_roy",
    plan_id: "plan_free",
    billing_period: "MONTHLY",
    status: "ACTIVE",
    provider: "ADMIN",
    provider_customer_id: null,
    provider_subscription_id: null,
    started_at: "2026-08-01T12:00:00Z",
    current_period_start: "2026-08-01T12:00:00Z",
    current_period_end: "2099-12-31T23:59:59Z",
    cancel_at_period_end: false,
    cancelled_at: null,
    grace_period_ends_at: null,
    trial_started_at: null,
    trial_ends_at: null,
    granted_by: "SYSTEM_DEFAULT",
    grant_reason: "Free tier access",
    created_at: "2026-08-01T12:00:00Z",
    updated_at: "2026-08-01T12:00:00Z"
  }
];

// 4. Initial Billing Invoices (Money paid to DUEZY)
export const INITIAL_BILLING_INVOICES = [
  {
    id: "binv_1001",
    user_id: "usr_rahul_sharma",
    subscription_id: "sub_rahul_001",
    invoice_number: "DUEZY-SUB-2026-081",
    billing_period: "MONTHLY",
    plan_name: "PRO Plan",
    amount: 499,
    currency: "INR",
    status: "PAID",
    paid_at: "2026-08-08T10:05:00Z",
    razorpay_payment_id: "pay_RZP_Sub_881239",
    invoice_pdf_url: "#",
    created_at: "2026-08-08T10:00:00Z"
  },
  {
    id: "binv_1002",
    user_id: "usr_rahul_sharma",
    subscription_id: "sub_rahul_001",
    invoice_number: "DUEZY-SUB-2026-071",
    billing_period: "MONTHLY",
    plan_name: "PRO Plan",
    amount: 499,
    currency: "INR",
    status: "PAID",
    paid_at: "2026-07-08T10:05:00Z",
    razorpay_payment_id: "pay_RZP_Sub_771234",
    invoice_pdf_url: "#",
    created_at: "2026-07-08T10:00:00Z"
  },
  {
    id: "binv_1003",
    user_id: "usr_priya_patel",
    subscription_id: "sub_priya_002",
    invoice_number: "DUEZY-SUB-2026-001",
    billing_period: "YEARLY",
    plan_name: "BUSINESS Annual Plan",
    amount: 13499,
    currency: "INR",
    status: "PAID",
    paid_at: "2026-02-15T12:05:00Z",
    razorpay_payment_id: "pay_RZP_Sub_Biz2026",
    invoice_pdf_url: "#",
    created_at: "2026-02-15T12:00:00Z"
  }
];

// 5. Initial Usage Records
export const INITIAL_USAGE = {
  usr_rahul_sharma: {
    payments_tracked_this_month: 42,
    customers_count: 31,
    ai_generations_this_month: 142,
    whatsapp_sent_this_month: 190,
    sms_sent_this_month: 82,
    voice_calls_this_month: 0,
    team_members_count: 1,
    period_month: "2026-08"
  },
  usr_priya_patel: {
    payments_tracked_this_month: 185,
    customers_count: 120,
    ai_generations_this_month: 620,
    whatsapp_sent_this_month: 890,
    sms_sent_this_month: 340,
    voice_calls_this_month: 24,
    team_members_count: 3,
    period_month: "2026-08"
  },
  usr_ananya_roy: {
    payments_tracked_this_month: 4,
    customers_count: 4,
    ai_generations_this_month: 8,
    whatsapp_sent_this_month: 0,
    sms_sent_this_month: 0,
    voice_calls_this_month: 0,
    team_members_count: 1,
    period_month: "2026-08"
  }
};

// 6. Initial User's Customers (Debtors belonging to each user)
export const INITIAL_USER_CUSTOMERS = [
  { id: "cust_deb_01", user_id: "usr_rahul_sharma", name: "Aman Verma", company: "Verma Logistics", phone: "+91 98765 11223", email: "aman@verma.com", total_billed: 45000, outstanding: 25000, status: "OVERDUE" },
  { id: "cust_deb_02", user_id: "usr_rahul_sharma", name: "Neha Gupta", company: "Gupta Media", phone: "+91 98220 33445", email: "neha@guptamedia.in", total_billed: 28500, outstanding: 0, status: "PAID" },
  { id: "cust_deb_03", user_id: "usr_rahul_sharma", name: "Karan Johar", company: "Dharma Productions", phone: "+91 99300 55667", email: "karan@dharma.in", total_billed: 12000, outstanding: 12000, status: "REMINDING" }
];

// 7. Initial Feature Flags
export const INITIAL_FEATURE_FLAGS = [
  { id: "ff_ai_assistant", key: "ai_assistant", name: "AI Assistant & Tone Progression", description: "Enables autonomous AI reminder copywriting and escalations", enabled_globally: true, plan_overrides: { plan_free: false, plan_pro: true, plan_business: true } },
  { id: "ff_whatsapp", key: "whatsapp", name: "WhatsApp Business API Delivery", description: "Direct WhatsApp message dispatch with verified badges", enabled_globally: true, plan_overrides: { plan_free: false, plan_pro: true, plan_business: true } },
  { id: "ff_sms", key: "sms", name: "SMS Gateway Integration", description: "160-character SMS fallback delivery", enabled_globally: true, plan_overrides: { plan_free: false, plan_pro: true, plan_business: true } },
  { id: "ff_voice", key: "voice", name: "AI Automated Voice Calls", description: "IVR phone reminders for overdue enterprise invoices", enabled_globally: true, plan_overrides: { plan_free: false, plan_pro: false, plan_business: true } },
  { id: "ff_qr_payments", key: "qr_payments", name: "Dynamic UPI QR Generation", description: "Scannable BharatQR/UPI on payment links", enabled_globally: true, plan_overrides: { plan_free: true, plan_pro: true, plan_business: true } },
  { id: "ff_advanced_analytics", key: "advanced_analytics", name: "Advanced Recovery Analytics", description: "Cohort recovery time and churn predictions", enabled_globally: true, plan_overrides: { plan_free: false, plan_pro: true, plan_business: true } },
  { id: "ff_team_members", key: "team_members", name: "Team Multi-seat Collaboration", description: "Allow inviting team members with role controls", enabled_globally: true, plan_overrides: { plan_free: false, plan_pro: false, plan_business: true } }
];

// 8. Initial Admin Audit Logs
export const INITIAL_AUDIT_LOGS = [
  {
    id: "log_001",
    actor_id: "usr_vikram_admin",
    actor_name: "Vikram Malhotra (Super Admin)",
    actor_role: "SUPER_ADMIN",
    action: "PLAN_PRICE_UPDATED",
    target_type: "PLAN",
    target_id: "plan_pro",
    target_label: "PRO Plan",
    metadata: { field: "yearly_price", old_value: 4999, new_value: 4499 },
    ip_address: "103.21.144.92",
    timestamp: "2026-08-01T09:00:00Z"
  },
  {
    id: "log_002",
    actor_id: "usr_vikram_admin",
    actor_name: "Vikram Malhotra (Super Admin)",
    actor_role: "SUPER_ADMIN",
    action: "TRIAL_GRANTED",
    target_type: "USER",
    target_id: "usr_ananya_roy",
    target_label: "Ananya Roy",
    metadata: { plan: "PRO", duration_days: 14, reason: "Beta agency tester" },
    ip_address: "103.21.144.92",
    timestamp: "2026-08-02T14:30:00Z"
  }
];

// 9. Initial Admin Notifications
export const INITIAL_ADMIN_NOTIFICATIONS = [
  { id: "notif_1", type: "SUBSCRIPTION_NEW", title: "New PRO Subscriber", message: "Rahul Sharma subscribed to PRO Monthly (₹499). Razorpay payment captured.", timestamp: "2026-08-08T10:05:00Z", read: false },
  { id: "notif_2", type: "WEBHOOK_VERIFIED", title: "Subscription Webhook Verified", message: "Event subscription.activated processed with HMAC SHA-256 validation.", timestamp: "2026-08-08T10:00:00Z", read: true }
];

// Storage Accessors
export const getDbItem = (key, defaultVal) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
};

export const setDbItem = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const getDbPlans = () => getDbItem(DB_KEYS.PLANS, INITIAL_PLANS);
export const saveDbPlans = (plans) => setDbItem(DB_KEYS.PLANS, plans);

export const getDbSubscriptions = () => getDbItem(DB_KEYS.SUBSCRIPTIONS, INITIAL_SUBSCRIPTIONS);
export const saveDbSubscriptions = (subs) => setDbItem(DB_KEYS.SUBSCRIPTIONS, subs);

export const getDbUsers = () => getDbItem(DB_KEYS.USERS, INITIAL_USERS);
export const saveDbUsers = (users) => setDbItem(DB_KEYS.USERS, users);

export const getDbBillingInvoices = () => getDbItem(DB_KEYS.INVOICES, INITIAL_BILLING_INVOICES);
export const saveDbBillingInvoices = (invs) => setDbItem(DB_KEYS.INVOICES, invs);

export const getDbUsage = () => getDbItem(DB_KEYS.USAGE, INITIAL_USAGE);
export const saveDbUsage = (usage) => setDbItem(DB_KEYS.USAGE, usage);

export const getDbUserCustomers = () => getDbItem(DB_KEYS.CUSTOMERS, INITIAL_USER_CUSTOMERS);
export const saveDbUserCustomers = (custs) => setDbItem(DB_KEYS.CUSTOMERS, custs);

export const getDbAuditLogs = () => getDbItem(DB_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
export const saveDbAuditLogs = (logs) => setDbItem(DB_KEYS.AUDIT_LOGS, logs);

export const getDbFeatureFlags = () => getDbItem(DB_KEYS.FEATURE_FLAGS, INITIAL_FEATURE_FLAGS);
export const saveDbFeatureFlags = (flags) => setDbItem(DB_KEYS.FEATURE_FLAGS, flags);

export const getDbAdminNotifications = () => getDbItem(DB_KEYS.NOTIFICATIONS, INITIAL_ADMIN_NOTIFICATIONS);
export const saveDbAdminNotifications = (notifs) => setDbItem(DB_KEYS.NOTIFICATIONS, notifs);
