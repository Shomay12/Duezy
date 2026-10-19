// Initial Data Fixtures & Rahul ₹25k Scenario for DUEZY

export const INITIAL_PAYMENTS = [
  {
    id: "pay_rahul_25k",
    clientName: "Rahul Sharma",
    clientCompany: "Apex Dynamics Pvt Ltd",
    clientPhone: "+91 98765 43210",
    clientEmail: "rahul@apexdynamics.in",
    clientGst: "27AADCA1234F1Z8",
    amount: 25000,
    currency: "INR",
    invoiceNumber: "DZ-2026-942",
    description: "Full Stack Web Application & SEO Milestones - Sprint 3",
    createdDate: "2026-08-01",
    dueDate: "2026-08-05",
    status: "OVERDUE_REMINDING", // PENDING, OVERDUE_REMINDING, PAID
    razorpayLinkId: "plink_OQx92KnDslk",
    razorpayUrl: "https://rzp.io/l/duezy_rahul_25k",
    upiVpa: "duezy.collect@icici",
    reminderStrategy: "smart_adaptive", // gentle, balanced, firm, smart_adaptive
    remindersSent: [
      {
        id: "rem_1",
        stage: "Day -2 Gentle Nudge",
        channel: "WhatsApp",
        sentAt: "2026-08-03T10:30:00Z",
        status: "DELIVERED",
        read: true,
        preview: "Hi Rahul! Gentle reminder for invoice #DZ-2026-942 (₹25,000) due on 5th Aug. Here is your quick UPI link: rzp.io/l/duezy_rahul_25k"
      },
      {
        id: "rem_2",
        stage: "Day 0 Due Date Reminder",
        channel: "Email",
        sentAt: "2026-08-05T09:00:00Z",
        status: "OPENED",
        read: true,
        preview: "Subject: Payment Due Today — ₹25,000 for Apex Dynamics. Click to pay instantly via Razorpay / UPI."
      }
    ],
    nextReminder: {
      scheduledFor: "2026-08-08T16:00:00Z",
      stage: "Day +3 Firm Follow-up",
      channels: ["WhatsApp", "SMS"],
      tone: "Firm & Professional",
      aiSummary: "Detected 3 days overdue. Upgrading tone with accounting closing notice."
    },
    paidAt: null,
    paymentMeta: null
  },
  {
    id: "pay_priya_42k",
    clientName: "Priya Patel",
    clientCompany: "FinPulse Labs",
    clientPhone: "+91 98220 11990",
    clientEmail: "priya@finpulselabs.com",
    clientGst: "24AABCF5678G1Z2",
    amount: 42000,
    currency: "INR",
    invoiceNumber: "DZ-2026-940",
    description: "Mobile App UI/UX Sprint 2 & React Native Prototyping",
    createdDate: "2026-07-28",
    dueDate: "2026-08-02",
    status: "PAID",
    razorpayLinkId: "plink_PP8829KjL",
    razorpayUrl: "https://rzp.io/l/duezy_priya_42k",
    upiVpa: "duezy.collect@icici",
    reminderStrategy: "balanced",
    remindersSent: [
      {
        id: "rem_priya_1",
        stage: "Day -1 WhatsApp Nudge",
        channel: "WhatsApp",
        sentAt: "2026-08-01T11:00:00Z",
        status: "DELIVERED",
        read: true,
        preview: "Hello Priya, quick link for ₹42,000 invoice: rzp.io/l/duezy_priya_42k"
      }
    ],
    nextReminder: null,
    paidAt: "2026-08-02T14:22:15Z",
    paymentMeta: {
      method: "UPI (Google Pay)",
      razorpayPaymentId: "pay_N8912739102",
      captured: true
    }
  },
  {
    id: "pay_vikram_115k",
    clientName: "Vikram Enterprises",
    clientCompany: "Vikram Logistics Global",
    clientPhone: "+91 97110 44882",
    clientEmail: "accounts@vikramglobal.com",
    clientGst: "07AAACV9012E1Z5",
    amount: 115000,
    currency: "INR",
    invoiceNumber: "DZ-2026-938",
    description: "Enterprise Cloud Infrastructure Migration & DevOps Setup",
    createdDate: "2026-08-02",
    dueDate: "2026-08-07",
    status: "OVERDUE_REMINDING",
    razorpayLinkId: "plink_VK9912048",
    razorpayUrl: "https://rzp.io/l/duezy_vikram_115k",
    upiVpa: "duezy.collect@icici",
    reminderStrategy: "firm",
    remindersSent: [
      {
        id: "rem_vik_1",
        stage: "Day 0 Email Invoice",
        channel: "Email",
        sentAt: "2026-08-07T08:30:00Z",
        status: "OPENED",
        read: true,
        preview: "Invoice DZ-2026-938 for ₹1,15,000 is ready for settlement."
      }
    ],
    nextReminder: {
      scheduledFor: "2026-08-09T10:00:00Z",
      stage: "Day +2 WhatsApp Escalation",
      channels: ["WhatsApp"],
      tone: "Strict B2B"
    },
    paidAt: null,
    paymentMeta: null
  },
  {
    id: "pay_ananya_18k",
    clientName: "Ananya Roy",
    clientCompany: "Studio Aura Creative",
    clientPhone: "+91 99300 88219",
    clientEmail: "ananya@studioaura.design",
    clientGst: "19AADCR3344P1Z1",
    amount: 18500,
    currency: "INR",
    invoiceNumber: "DZ-2026-943",
    description: "Brand Identity, Typography Guidelines & Pitch Deck Design",
    createdDate: "2026-08-06",
    dueDate: "2026-08-11",
    status: "PENDING",
    razorpayLinkId: "plink_AN7712399",
    razorpayUrl: "https://rzp.io/l/duezy_ananya_18k",
    upiVpa: "duezy.collect@icici",
    reminderStrategy: "gentle",
    remindersSent: [],
    nextReminder: {
      scheduledFor: "2026-08-09T09:30:00Z",
      stage: "Day -2 Gentle WhatsApp",
      channels: ["WhatsApp"],
      tone: "Warm Freelancer"
    },
    paidAt: null,
    paymentMeta: null
  }
];

export const INITIAL_WEBHOOK_LOGS = [
  {
    id: "wh_log_001",
    timestamp: "2026-08-02T14:22:15Z",
    event: "payment.captured",
    status: "VERIFIED_200",
    entity: "payment",
    paymentId: "pay_N8912739102",
    orderId: "order_PR881230",
    amount: 42000,
    currency: "INR",
    client: "Priya Patel",
    actionTaken: "Payment status set to PAID. 2 Queued Reminders Stopped."
  },
  {
    id: "wh_log_002",
    timestamp: "2026-08-01T10:00:00Z",
    event: "payment_link.created",
    status: "PROCESSED_200",
    entity: "payment_link",
    paymentId: "plink_OQx92KnDslk",
    orderId: "order_RH942001",
    amount: 25000,
    currency: "INR",
    client: "Rahul Sharma",
    actionTaken: "Dynamic UPI QR generated and WhatsApp cadence activated."
  }
];
