import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../app/config/constants.dart';
import '../../shared/models/invoice_model.dart';
import '../../shared/models/customer_model.dart';
import '../../shared/models/metrics_model.dart';
import '../../shared/models/portal_model.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  ApiClient._internal();

  String get _baseUrl => AppConstants.apiBaseUrl;

  Future<DashboardMetricsModel> getMetrics() async {
    try {
      final response = await http
          .get(Uri.parse('$_baseUrl/api/dashboard/metrics'))
          .timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return DashboardMetricsModel.fromJson(data);
      }
    } catch (_) {}

    // Offline mock fallback
    return DashboardMetricsModel(
      totalOutstandingPaise: 15850000,
      totalOutstandingRupees: 158500.0,
      totalRecoveredPaise: 4200000,
      totalRecoveredRupees: 42000.0,
      totalInvoicedRupees: 200500.0,
      recoveryRatePct: 21,
      unpaidInvoicesCount: 3,
      partiallyPaidInvoicesCount: 0,
      overdueInvoicesCount: 2,
      paidInvoicesCount: 1,
      activeAiRemindersCount: 3,
      recentTransactions: [],
      pendingClaimsCount: 0,
    );
  }

  Future<List<InvoiceModel>> getInvoices({String? search, String? statusFilter}) async {
    try {
      final queryParams = <String, String>{};
      if (search != null && search.isNotEmpty) queryParams['search'] = search;
      if (statusFilter != null && statusFilter != 'ALL') queryParams['status_filter'] = statusFilter;

      final uri = Uri.parse('$_baseUrl/api/invoices').replace(queryParameters: queryParams.isEmpty ? null : queryParams);
      final response = await http.get(uri).timeout(const Duration(seconds: 4));

      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body);
        return list.map((item) => InvoiceModel.fromJson(item)).toList();
      }
    } catch (_) {}

    // Offline mock fallback
    return _mockInvoices;
  }

  Future<InvoiceModel?> createInvoice(Map<String, dynamic> payload) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/invoices'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        return InvoiceModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}
    return null;
  }

  Future<List<CustomerModel>> getCustomers() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/customers')).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final List<dynamic> list = jsonDecode(response.body);
        return list.map((item) => CustomerModel.fromJson(item)).toList();
      }
    } catch (_) {}

    return _mockCustomers;
  }

  Future<CustomerModel?> createCustomer(Map<String, dynamic> payload) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/customers'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      );
      if (response.statusCode == 201 || response.statusCode == 200) {
        return CustomerModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}
    return null;
  }

  Future<PortalInvoiceModel?> getPortalInvoice(String token) async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/portal/invoice/$token')).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return PortalInvoiceModel.fromJson(jsonDecode(response.body));
      }
    } catch (_) {}

    // Fallback for Rahul token
    return PortalInvoiceModel(
      invoiceNumber: 'DZ-2026-942',
      description: 'Full Stack Web Application & SEO Milestones - Sprint 3',
      businessName: 'Apex Dynamics / DUEZY Client',
      customerName: 'Rahul Sharma',
      customerCompany: 'Apex Dynamics Pvt Ltd',
      originalAmountRupees: 25000.0,
      paidAmountRupees: 0.0,
      outstandingAmountRupees: 25000.0,
      lateFeeRupees: 0.0,
      currency: 'INR',
      dueDate: '2026-08-05',
      status: 'OVERDUE',
      permittedPartial: true,
      minPartialPct: 20,
      minPartialAmountRupees: 5000.0,
      upiVpa: 'duezy.collect@icici',
      razorpayUrl: 'https://rzp.io/l/duezy_rahul_25k',
      secureToken: token,
    );
  }

  Future<Map<String, dynamic>> sendPortalChatMessage(String token, String message) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/portal/chat/$token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'message': message, 'history': []}),
      ).timeout(const Duration(seconds: 5));

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}

    // Smart local fallback
    final msg = message.toLowerCase();
    if (msg.contains('half') || msg.contains('10000') || msg.contains('10,000') || msg.contains('pay')) {
      return {
        'reply': 'We have generated a custom payment request for ₹10,000.00. You can pay instantly using the dynamic QR code on screen.',
        'detected_intent': 'REQUEST_PARTIAL_PAYMENT',
        'proposal': {
          'can_fulfill': true,
          'proposed_action': 'GENERATE_PAYMENT_REQUEST',
          'amount_rupees': 10000.0,
          'explanation': 'Permitted partial payment of ₹10,000.00 generated.'
        },
        'updated_outstanding_rupees': 25000.0
      };
    }
    return {
      'reply': 'Your invoice #DZ-2026-942 has an outstanding balance of ₹25,000.00 due on 2026-08-05. You can pay in full or request a partial payment or extension.',
      'detected_intent': 'GENERAL_INVOICE_QUERY',
      'proposal': {'can_fulfill': true, 'explanation': 'Invoice details.'},
      'updated_outstanding_rupees': 25000.0
    };
  }

  Future<bool> simulatePayment(String token, {int? amountPaise}) async {
    try {
      final response = await http.post(
        Uri.parse('$_baseUrl/api/portal/simulate-payment/$token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(amountPaise != null ? {'amount_paise': amountPaise} : {}),
      );
      return response.statusCode == 200;
    } catch (_) {
      return true;
    }
  }

  Future<bool> resetRahulScenario() async {
    try {
      final response = await http.post(Uri.parse('$_baseUrl/api/scenario/reset-rahul'));
      return response.statusCode == 200;
    } catch (_) {
      return true;
    }
  }

  Future<List<dynamic>> getWebhookLogs() async {
    try {
      final response = await http.get(Uri.parse('$_baseUrl/api/webhooks/logs')).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      }
    } catch (_) {}
    return [];
  }

  // Initial mock data fallback
  static final List<InvoiceModel> _mockInvoices = [
    InvoiceModel(
      id: 'inv_rahul_25k',
      businessId: 'usr_rahul_sharma',
      customerId: 'cust_rahul_apex',
      customerName: 'Rahul Sharma',
      customerCompany: 'Apex Dynamics Pvt Ltd',
      customerEmail: 'rahul@apexdynamics.in',
      customerPhone: '+91 98765 43210',
      invoiceNumber: 'DZ-2026-942',
      description: 'Full Stack Web Application & SEO Milestones - Sprint 3',
      originalAmountPaise: 2500000,
      paidAmountPaise: 0,
      outstandingAmountPaise: 2500000,
      lateFeePaise: 0,
      currency: 'INR',
      createdDate: '2026-08-01',
      dueDate: '2026-08-05',
      status: 'OVERDUE',
      gracePeriodDays: 3,
      lateFeeDailyBps: 10,
      permittedPartial: true,
      minPartialPct: 20,
      maxInstallments: 4,
      secureToken: 'tok_rahul_942_secure_abc123',
      paymentLinkUrl: 'https://rzp.io/l/duezy_rahul_25k',
      upiVpa: 'duezy.collect@icici',
      reminderStrategy: 'smart_adaptive',
      nextReminderDate: '2026-08-09T10:00:00Z',
      remindersStopped: false,
    ),
    InvoiceModel(
      id: 'inv_priya_42k',
      businessId: 'usr_rahul_sharma',
      customerId: 'cust_priya_finpulse',
      customerName: 'Priya Patel',
      customerCompany: 'FinPulse Labs',
      customerEmail: 'priya@finpulselabs.com',
      customerPhone: '+91 98220 11990',
      invoiceNumber: 'DZ-2026-940',
      description: 'Mobile App UI/UX Sprint 2 & React Native Prototyping',
      originalAmountPaise: 4200000,
      paidAmountPaise: 4200000,
      outstandingAmountPaise: 0,
      lateFeePaise: 0,
      currency: 'INR',
      createdDate: '2026-07-28',
      dueDate: '2026-08-02',
      status: 'PAID',
      gracePeriodDays: 3,
      lateFeeDailyBps: 10,
      permittedPartial: true,
      minPartialPct: 20,
      maxInstallments: 3,
      secureToken: 'tok_priya_940_secure_def456',
      paymentLinkUrl: 'https://rzp.io/l/duezy_priya_42k',
      upiVpa: 'duezy.collect@icici',
      reminderStrategy: 'balanced',
      remindersStopped: true,
    ),
  ];

  static final List<CustomerModel> _mockCustomers = [
    CustomerModel(
      id: 'cust_rahul_apex',
      businessId: 'usr_rahul_sharma',
      name: 'Rahul Sharma',
      company: 'Apex Dynamics Pvt Ltd',
      phone: '+91 98765 43210',
      email: 'rahul@apexdynamics.in',
      gst: '27AADCA1234F1Z8',
      totalBilledPaise: 2500000,
      outstandingPaise: 2500000,
      status: 'OVERDUE',
    ),
    CustomerModel(
      id: 'cust_priya_finpulse',
      businessId: 'usr_rahul_sharma',
      name: 'Priya Patel',
      company: 'FinPulse Labs',
      phone: '+91 98220 11990',
      email: 'priya@finpulselabs.com',
      gst: '24AABCF5678G1Z2',
      totalBilledPaise: 4200000,
      outstandingPaise: 0,
      status: 'PAID',
    ),
  ];
}
