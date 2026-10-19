class InvoiceModel {
  final String id;
  final String businessId;
  final String customerId;
  final String customerName;
  final String customerCompany;
  final String customerEmail;
  final String customerPhone;
  final String invoiceNumber;
  final String description;
  final int originalAmountPaise;
  final int paidAmountPaise;
  final int outstandingAmountPaise;
  final int lateFeePaise;
  final String currency;
  final String createdDate;
  final String dueDate;
  final String status; // SENT, OVERDUE, PARTIALLY_PAID, PAID, DISPUTED
  final int gracePeriodDays;
  final int lateFeeDailyBps;
  final bool permittedPartial;
  final int minPartialPct;
  final int maxInstallments;
  final String secureToken;
  final String? paymentLinkUrl;
  final String upiVpa;
  final String reminderStrategy;
  final String? nextReminderDate;
  final bool remindersStopped;

  InvoiceModel({
    required this.id,
    required this.businessId,
    required this.customerId,
    required this.customerName,
    required this.customerCompany,
    required this.customerEmail,
    required this.customerPhone,
    required this.invoiceNumber,
    required this.description,
    required this.originalAmountPaise,
    required this.paidAmountPaise,
    required this.outstandingAmountPaise,
    required this.lateFeePaise,
    required this.currency,
    required this.createdDate,
    required this.dueDate,
    required this.status,
    required this.gracePeriodDays,
    required this.lateFeeDailyBps,
    required this.permittedPartial,
    required this.minPartialPct,
    required this.maxInstallments,
    required this.secureToken,
    this.paymentLinkUrl,
    required this.upiVpa,
    required this.reminderStrategy,
    this.nextReminderDate,
    required this.remindersStopped,
  });

  double get originalAmountRupees => originalAmountPaise / 100.0;
  double get paidAmountRupees => paidAmountPaise / 100.0;
  double get outstandingAmountRupees => outstandingAmountPaise / 100.0;
  double get lateFeeRupees => lateFeePaise / 100.0;

  bool get isPaid => status == 'PAID' || outstandingAmountPaise == 0;
  bool get isOverdue => status == 'OVERDUE';
  bool get isPartiallyPaid => status == 'PARTIALLY_PAID';
  bool get isDisputed => status == 'DISPUTED';

  factory InvoiceModel.fromJson(Map<String, dynamic> json) {
    return InvoiceModel(
      id: json['id'] ?? '',
      businessId: json['business_id'] ?? '',
      customerId: json['customer_id'] ?? '',
      customerName: json['customer_name'] ?? '',
      customerCompany: json['customer_company'] ?? '',
      customerEmail: json['customer_email'] ?? '',
      customerPhone: json['customer_phone'] ?? '',
      invoiceNumber: json['invoice_number'] ?? '',
      description: json['description'] ?? '',
      originalAmountPaise: json['original_amount_paise'] ?? 0,
      paidAmountPaise: json['paid_amount_paise'] ?? 0,
      outstandingAmountPaise: json['outstanding_amount_paise'] ?? 0,
      lateFeePaise: json['late_fee_paise'] ?? 0,
      currency: json['currency'] ?? 'INR',
      createdDate: json['created_date'] ?? '',
      dueDate: json['due_date'] ?? '',
      status: json['status'] ?? 'SENT',
      gracePeriodDays: json['grace_period_days'] ?? 3,
      lateFeeDailyBps: json['late_fee_daily_bps'] ?? 10,
      permittedPartial: json['permitted_partial'] ?? true,
      minPartialPct: json['min_partial_pct'] ?? 20,
      maxInstallments: json['max_installments'] ?? 4,
      secureToken: json['secure_token'] ?? '',
      paymentLinkUrl: json['payment_link_url'],
      upiVpa: json['upi_vpa'] ?? 'duezy.collect@icici',
      reminderStrategy: json['reminder_strategy'] ?? 'smart_adaptive',
      nextReminderDate: json['next_reminder_date'],
      remindersStopped: json['reminders_stopped'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'business_id': businessId,
      'customer_id': customerId,
      'customer_name': customerName,
      'customer_company': customerCompany,
      'customer_email': customerEmail,
      'customer_phone': customerPhone,
      'invoice_number': invoiceNumber,
      'description': description,
      'original_amount_paise': originalAmountPaise,
      'paid_amount_paise': paidAmountPaise,
      'outstanding_amount_paise': outstandingAmountPaise,
      'late_fee_paise': lateFeePaise,
      'currency': currency,
      'created_date': createdDate,
      'due_date': dueDate,
      'status': status,
      'grace_period_days': gracePeriodDays,
      'late_fee_daily_bps': lateFeeDailyBps,
      'permitted_partial': permittedPartial,
      'min_partial_pct': minPartialPct,
      'max_installments': maxInstallments,
      'secure_token': secureToken,
      'payment_link_url': paymentLinkUrl,
      'upi_vpa': upiVpa,
      'reminder_strategy': reminderStrategy,
      'next_reminder_date': nextReminderDate,
      'reminders_stopped': remindersStopped,
    };
  }
}
