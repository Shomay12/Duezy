// Local Storage & State Management Engine for DUEZY
import { INITIAL_PAYMENTS, INITIAL_WEBHOOK_LOGS } from '../data/initialData';

const STORAGE_KEYS = {
  PAYMENTS: 'duezy_payments_v1',
  WEBHOOKS: 'duezy_webhooks_v1',
  ACTIVE_STEP: 'duezy_active_step_v1',
  SETTINGS: 'duezy_settings_v1'
};

export const getPayments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
      return INITIAL_PAYMENTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENTS;
  }
};

export const savePayments = (payments) => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const getPaymentById = (id) => {
  const list = getPayments();
  return list.find(p => p.id === id) || null;
};

export const addPayment = (paymentData) => {
  const list = getPayments();
  const id = `pay_${Date.now()}`;
  const rzpLinkId = `plink_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  const newPayment = {
    id,
    ...paymentData,
    createdDate: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    razorpayLinkId: rzpLinkId,
    razorpayUrl: `https://rzp.io/l/${id}`,
    upiVpa: 'duezy.collect@icici',
    remindersSent: [],
    nextReminder: {
      scheduledFor: new Date(Date.now() + 86400000 * 2).toISOString(),
      stage: 'Day -2 Friendly Nudge',
      channels: ['WhatsApp', 'Email'],
      tone: 'Courteous & Warm'
    },
    paidAt: null,
    paymentMeta: null
  };

  const updated = [newPayment, ...list];
  savePayments(updated);

  // Add webhook log for creation
  addWebhookLog({
    event: 'payment_link.created',
    status: 'PROCESSED_200',
    entity: 'payment_link',
    paymentId: rzpLinkId,
    orderId: `order_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    amount: paymentData.amount,
    currency: 'INR',
    client: paymentData.clientName,
    actionTaken: 'Payment link & dynamic UPI QR code generated.'
  });

  return newPayment;
};

export const markPaymentAsPaid = (paymentId, meta = {}) => {
  const list = getPayments();
  let paidPayment = null;
  const updated = list.map(p => {
    if (p.id === paymentId) {
      paidPayment = {
        ...p,
        status: 'PAID',
        paidAt: new Date().toISOString(),
        nextReminder: null, // ALL FUTURE REMINDERS STOPPED
        paymentMeta: {
          method: meta.method || 'Razorpay UPI (Google Pay / Instant Pay)',
          razorpayPaymentId: meta.razorpayPaymentId || `pay_${Math.random().toString(36).substring(2, 12)}`,
          captured: true,
          fee: Math.round(p.amount * 0.02),
          tax: Math.round(p.amount * 0.02 * 0.18)
        }
      };
      return paidPayment;
    }
    return p;
  });

  savePayments(updated);

  if (paidPayment) {
    // Add real-time webhook event
    addWebhookLog({
      event: 'payment.captured',
      status: 'VERIFIED_200',
      entity: 'payment',
      paymentId: paidPayment.paymentMeta.razorpayPaymentId,
      orderId: `order_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      amount: paidPayment.amount,
      currency: 'INR',
      client: paidPayment.clientName,
      actionTaken: `₹${paidPayment.amount.toLocaleString('en-IN')} marked as PAID. All future reminders CANCELLED.`
    });
  }

  return paidPayment;
};

export const resetRahulScenario = () => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(STORAGE_KEYS.WEBHOOKS, JSON.stringify(INITIAL_WEBHOOK_LOGS));
  return INITIAL_PAYMENTS;
};

export const getWebhookLogs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEBHOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WEBHOOKS, JSON.stringify(INITIAL_WEBHOOK_LOGS));
      return INITIAL_WEBHOOK_LOGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_WEBHOOK_LOGS;
  }
};

export const addWebhookLog = (logData) => {
  const logs = getWebhookLogs();
  const newLog = {
    id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...logData
  };
  const updated = [newLog, ...logs];
  localStorage.setItem(STORAGE_KEYS.WEBHOOKS, JSON.stringify(updated.slice(0, 50)));
  return newLog;
};
