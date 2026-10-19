// AI Reminder Copywriting & Tone Progression Engine for DUEZY

export const TONE_PROFILES = {
  GENTLE: {
    name: 'Gentle & Courteous',
    color: '#10B981',
    description: 'High warmth and relationship preservation. Ideal for high-value clients and early nudges.'
  },
  BALANCED: {
    name: 'Balanced Professional',
    color: '#6366F1',
    description: 'Clear, polite, and direct with instant 1-click Razorpay payment link.'
  },
  FIRM: {
    name: 'Firm & Account-Aware',
    color: '#F59E0B',
    description: 'Highlights accounting month-end closing, project deliverables, and avoids further delays.'
  },
  ESCALATED: {
    name: 'Escalated Formal Notice',
    color: '#EF4444',
    description: 'Notifies client of interest/late fee clauses or service pausing if unpaid.'
  }
};

export const generateAIReminder = ({
  clientName = "Rahul",
  amount = 25000,
  invoiceNumber = "DZ-2026-942",
  dueDate = "5th Aug",
  daysOverdue = 3,
  tone = "BALANCED",
  razorpayUrl = "https://rzp.io/l/duezy_rahul_25k",
  language = "English"
}) => {
  const formattedAmount = `₹${amount.toLocaleString('en-IN')}`;

  if (language === "Hinglish") {
    return {
      whatsapp: `*DUEZY Automated Invoice Reminder*\n\nNamaste *${clientName} ji* 🙏,\n\nAapka invoice *#${invoiceNumber}* (${formattedAmount}) *${dueDate}* ko due tha.\n\nRazorpay link se aap directly *GPay / PhonePe / Card* se 1-click me pay kar sakte hain:\n🔗 *${razorpayUrl}*\n\nPayment complete hote hi automatic tax receipt & confirmation generate ho jayega. Shukriya!`,
      email: {
        subject: `Payment Reminder: Invoice #${invoiceNumber} (${formattedAmount}) - Instant Razorpay Settlement`,
        body: `Dear ${clientName},\n\nHope you are doing well.\n\nThis is a friendly reminder regarding pending invoice #${invoiceNumber} of ${formattedAmount}, due on ${dueDate}.\n\nYou can settle this securely in seconds via Razorpay:\n${razorpayUrl}\n\nWarm regards,\nAccounts & Finance Team`
      },
      sms: `DUEZY: Hi ${clientName}, invoice #${invoiceNumber} for ${formattedAmount} is pending. Pay instantly via UPI/Razorpay: ${razorpayUrl}`
    };
  }

  switch (tone) {
    case "GENTLE":
      return {
        whatsapp: `*Gentle Nudge from DUEZY* ✨\n\nHi *${clientName}*,\n\nHope you're having a productive week! Just a friendly note that invoice *#${invoiceNumber}* for *${formattedAmount}* is due on *${dueDate}*.\n\nWhenever you're ready, you can settle it directly using this Razorpay link:\n👉 *${razorpayUrl}*\n\n(Supports Google Pay, PhonePe, Paytm & Cards). Have a wonderful day!`,
        email: {
          subject: `Friendly Note: Invoice #${invoiceNumber} (${formattedAmount}) for ${clientName}`,
          body: `Hi ${clientName},\n\nWe appreciate working with you! Here is a quick reminder for your upcoming invoice #${invoiceNumber} of ${formattedAmount}.\n\nPay securely with one tap:\n${razorpayUrl}\n\nBest regards,\nFinance Team`
        },
        sms: `Hi ${clientName}, friendly reminder for invoice #${invoiceNumber} (${formattedAmount}). Settle anytime via: ${razorpayUrl}`
      };

    case "FIRM":
      return {
        whatsapp: `*Payment Reminder: Invoice #${invoiceNumber} Overdue*\n\nDear *${clientName}*,\n\nOur system indicates that the payment of *${formattedAmount}* for invoice *#${invoiceNumber}* was due on *${dueDate}* and is currently *${daysOverdue} days overdue*.\n\nTo ensure uninterrupted project services, please complete the settlement today via Razorpay:\n💳 *${razorpayUrl}*\n\nAll automated reminders will halt immediately upon payment confirmation. Thank you for your prompt attention.`,
        email: {
          subject: `OVERDUE: Invoice #${invoiceNumber} (${formattedAmount}) requires immediate settlement`,
          body: `Dear ${clientName},\n\nThis is a follow-up regarding overdue invoice #${invoiceNumber} of ${formattedAmount}.\n\nAs our finance books are closing for this cycle, please clear the balance via the secure link below:\n${razorpayUrl}\n\nThank you,\nFinance Department`
        },
        sms: `URGENT: ${clientName}, invoice #${invoiceNumber} (${formattedAmount}) is ${daysOverdue} days overdue. Pay via Razorpay: ${razorpayUrl}`
      };

    case "ESCALATED":
      return {
        whatsapp: `*FINAL NOTICE — Immediate Settlement Required*\n\nAttention: *${clientName}*,\n\nInvoice *#${invoiceNumber}* for *${formattedAmount}* is significantly overdue (${daysOverdue}+ days). Outstanding dues may affect active deliverables and support agreements.\n\nPlease clear the balance immediately via Razorpay:\n⚠️ *${razorpayUrl}*\n\nIf you have already paid in the last 15 minutes, please disregard this automated notice.`,
        email: {
          subject: `FINAL NOTICE: Outstanding Balance of ${formattedAmount} for Invoice #${invoiceNumber}`,
          body: `Dear ${clientName},\n\nPlease be advised that invoice #${invoiceNumber} remains unpaid. Continued non-settlement may necessitate service suspension.\n\nSettle the full balance immediately via Razorpay:\n${razorpayUrl}\n\nAccounts & Compliance`
        },
        sms: `FINAL NOTICE: ${clientName}, invoice #${invoiceNumber} (${formattedAmount}) is critical overdue. Settle now: ${razorpayUrl}`
      };

    case "BALANCED":
    default:
      return {
        whatsapp: `*DUEZY Smart Reminder* ⚡\n\nHi *${clientName}*,\n\nThis is a reminder regarding your invoice *#${invoiceNumber}* for *${formattedAmount}*, due on *${dueDate}*.\n\nYou can pay securely in under 30 seconds via Razorpay (UPI, GPay, PhonePe, Cards):\n🔗 *${razorpayUrl}*\n\nOnce paid, your tax invoice & receipt will be generated automatically. Thank you!`,
        email: {
          subject: `Invoice #${invoiceNumber} (${formattedAmount}) from DUEZY - Secure Razorpay Link`,
          body: `Hello ${clientName},\n\nYour payment of ${formattedAmount} for invoice #${invoiceNumber} is pending.\n\nPlease click the button below to settle via Razorpay:\n${razorpayUrl}\n\nThank you for your business!`
        },
        sms: `DUEZY: Hi ${clientName}, invoice #${invoiceNumber} for ${formattedAmount} is pending. Pay instantly: ${razorpayUrl}`
      };
  }
};
