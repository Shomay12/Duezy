class PortalInvoiceModel {
  final String invoiceNumber;
  final String description;
  final String businessName;
  final String customerName;
  final String customerCompany;
  final double originalAmountRupees;
  final double paidAmountRupees;
  final double outstandingAmountRupees;
  final double lateFeeRupees;
  final String currency;
  final String dueDate;
  final String status;
  final bool permittedPartial;
  final int minPartialPct;
  final double minPartialAmountRupees;
  final String upiVpa;
  final String? razorpayUrl;
  final Map<String, dynamic>? latestPaymentRequest;
  final Map<String, dynamic>? lateFeeAssessment;
  final String secureToken;

  PortalInvoiceModel({
    required this.invoiceNumber,
    required this.description,
    required this.businessName,
    required this.customerName,
    required this.customerCompany,
    required this.originalAmountRupees,
    required this.paidAmountRupees,
    required this.outstandingAmountRupees,
    required this.lateFeeRupees,
    required this.currency,
    required this.dueDate,
    required this.status,
    required this.permittedPartial,
    required this.minPartialPct,
    required this.minPartialAmountRupees,
    required this.upiVpa,
    this.razorpayUrl,
    this.latestPaymentRequest,
    this.lateFeeAssessment,
    required this.secureToken,
  });

  bool get isPaid => status == 'PAID' || outstandingAmountRupees <= 0;

  factory PortalInvoiceModel.fromJson(Map<String, dynamic> json) {
    return PortalInvoiceModel(
      invoiceNumber: json['invoice_number'] ?? '',
      description: json['description'] ?? '',
      businessName: json['business_name'] ?? 'Apex Dynamics',
      customerName: json['customer_name'] ?? '',
      customerCompany: json['customer_company'] ?? '',
      originalAmountRupees: (json['original_amount_rupees'] ?? 0.0).toDouble(),
      paidAmountRupees: (json['paid_amount_rupees'] ?? 0.0).toDouble(),
      outstandingAmountRupees: (json['outstanding_amount_rupees'] ?? 0.0).toDouble(),
      lateFeeRupees: (json['late_fee_rupees'] ?? 0.0).toDouble(),
      currency: json['currency'] ?? 'INR',
      dueDate: json['due_date'] ?? '',
      status: json['status'] ?? 'SENT',
      permittedPartial: json['permitted_partial'] ?? true,
      minPartialPct: json['min_partial_pct'] ?? 20,
      minPartialAmountRupees: (json['min_partial_amount_rupees'] ?? 0.0).toDouble(),
      upiVpa: json['upi_vpa'] ?? 'duezy.collect@icici',
      razorpayUrl: json['razorpay_url'],
      latestPaymentRequest: json['latest_payment_request'],
      lateFeeAssessment: json['late_fee_assessment'],
      secureToken: json['secure_token'] ?? '',
    );
  }
}

class AssistantChatMessage {
  final bool isUser;
  final String text;
  final String timestamp;
  final String? intent;
  final double? proposedAmount;
  final String? actionType;

  AssistantChatMessage({
    required this.isUser,
    required this.text,
    required this.timestamp,
    this.intent,
    this.proposedAmount,
    this.actionType,
  });
}
