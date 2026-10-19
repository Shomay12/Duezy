import 'package:flutter_test/flutter_test.dart';
import 'package:duezy/core/utils/currency_formatter.dart';
import 'package:duezy/shared/models/invoice_model.dart';
import 'package:duezy/shared/models/customer_model.dart';
import 'package:duezy/shared/models/portal_model.dart';

void main() {
  group('Currency Formatter Tests', () {
    test('formats paise into correct INR currency string', () {
      expect(CurrencyFormatter.formatPaise(2500000), '₹25,000');
      expect(CurrencyFormatter.formatPaise(11500000), '₹1,15,000');
      expect(CurrencyFormatter.formatPaise(4200000), '₹42,000');
      expect(CurrencyFormatter.formatPaise(1850000), '₹18,500');
      expect(CurrencyFormatter.formatPaise(0), '₹0');
    });

    test('formats decimal paise with exact precision without floating point drift', () {
      expect(CurrencyFormatter.formatPaise(2500050, showDecimals: true), '₹25,000.50');
    });
  });

  group('Invoice Model Subunit Tests', () {
    test('calculates rupees from integer paise', () {
      final inv = InvoiceModel(
        id: 'inv_test_1',
        businessId: 'usr_test',
        customerId: 'cust_test',
        customerName: 'Rahul Sharma',
        customerCompany: 'Apex Dynamics',
        customerEmail: 'rahul@apex.in',
        customerPhone: '+91 98765 43210',
        invoiceNumber: 'DZ-2026-942',
        description: 'Web development',
        originalAmountPaise: 2500000,
        paidAmountPaise: 1000000,
        outstandingAmountPaise: 1500000,
        lateFeePaise: 0,
        currency: 'INR',
        createdDate: '2026-08-01',
        dueDate: '2026-08-05',
        status: 'PARTIALLY_PAID',
        gracePeriodDays: 3,
        lateFeeDailyBps: 10,
        permittedPartial: true,
        minPartialPct: 20,
        maxInstallments: 4,
        secureToken: 'tok_test',
        upiVpa: 'duezy.collect@icici',
        reminderStrategy: 'smart_adaptive',
        remindersStopped: false,
      );

      expect(inv.originalAmountRupees, 25000.0);
      expect(inv.paidAmountRupees, 10000.0);
      expect(inv.outstandingAmountRupees, 15000.0);
      expect(inv.isPartiallyPaid, isTrue);
      expect(inv.isPaid, isFalse);
    });
  });

  group('Customer Model Tests', () {
    test('deserializes customer json properly', () {
      final json = {
        'id': 'cust_1',
        'business_id': 'usr_1',
        'name': 'Priya Patel',
        'company': 'FinPulse Labs',
        'phone': '+91 98220 11990',
        'email': 'priya@finpulse.com',
        'total_billed_paise': 4200000,
        'outstanding_paise': 0,
        'status': 'PAID'
      };
      final cust = CustomerModel.fromJson(json);
      expect(cust.name, 'Priya Patel');
      expect(cust.totalBilledRupees, 42000.0);
      expect(cust.outstandingRupees, 0.0);
    });
  });

  group('Portal Model Tests', () {
    test('handles portal invoice model', () {
      final json = {
        'invoice_number': 'DZ-2026-942',
        'description': 'Sprint 3',
        'business_name': 'Apex Dynamics',
        'customer_name': 'Rahul Sharma',
        'customer_company': 'Apex Dynamics Pvt Ltd',
        'original_amount_rupees': 25000.0,
        'paid_amount_rupees': 0.0,
        'outstanding_amount_rupees': 25000.0,
        'late_fee_rupees': 0.0,
        'currency': 'INR',
        'due_date': '2026-08-05',
        'status': 'OVERDUE',
        'permitted_partial': true,
        'min_partial_pct': 20,
        'min_partial_amount_rupees': 5000.0,
        'upi_vpa': 'duezy.collect@icici',
        'secure_token': 'tok_test_secure'
      };
      final portal = PortalInvoiceModel.fromJson(json);
      expect(portal.outstandingAmountRupees, 25000.0);
      expect(portal.minPartialAmountRupees, 5000.0);
      expect(portal.isPaid, isFalse);
    });
  });
}
