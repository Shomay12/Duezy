import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/models/invoice_model.dart';

class TransactionsLedgerScreen extends StatefulWidget {
  const TransactionsLedgerScreen({super.key});

  @override
  State<TransactionsLedgerScreen> createState() => _TransactionsLedgerScreenState();
}

class _TransactionsLedgerScreenState extends State<TransactionsLedgerScreen> {
  final ApiClient _api = ApiClient();
  List<InvoiceModel> _invoices = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLedger();
  }

  void _loadLedger() async {
    setState(() => _isLoading = true);
    final invs = await _api.getInvoices();
    if (mounted) {
      setState(() {
        _invoices = invs;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: DuezyColors.brand));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: DuezyColors.brand.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.account_balance_wallet, color: DuezyColors.brand, size: 20),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Immutable Financial Ledger & Audit Trail',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                  ),
                  Text(
                    'Subunit-accurate double-entry records: Invoices, Transactions, Late Fees, and Claims.',
                    style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Ledger Table
          Container(
            decoration: BoxDecoration(
              color: DuezyColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: DuezyColors.borderDefault),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _invoices.length,
              separatorBuilder: (_, _) => const Divider(height: 1, color: DuezyColors.borderDefault),
              itemBuilder: (context, index) {
                final inv = _invoices[index];
                return ExpansionTile(
                  title: Row(
                    children: [
                      Text(
                        '#${inv.invoiceNumber}',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: DuezyColors.info),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          '${inv.customerName} (${inv.customerCompany})',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                      ),
                      Text(
                        CurrencyFormatter.formatPaise(inv.originalAmountPaise),
                        style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                      ),
                    ],
                  ),
                  subtitle: Text(
                    'Paid: ${CurrencyFormatter.formatPaise(inv.paidAmountPaise)} • Outstanding: ${CurrencyFormatter.formatPaise(inv.outstandingAmountPaise)} • Status: ${inv.status}',
                    style: const TextStyle(fontSize: 11, color: DuezyColors.textSecondary),
                  ),
                  children: [
                    Container(
                      color: DuezyColors.bgInput,
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Authoritative Balance Ledger Calculation:',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: DuezyColors.textPrimary),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '• Original Principal: ${inv.originalAmountPaise} paise (${CurrencyFormatter.formatPaise(inv.originalAmountPaise)})\n'
                            '• Confirmed Payments: ${inv.paidAmountPaise} paise (${CurrencyFormatter.formatPaise(inv.paidAmountPaise)})\n'
                            '• Accrued Late Fee: ${inv.lateFeePaise} paise (${CurrencyFormatter.formatPaise(inv.lateFeePaise)})\n'
                            '• Authoritative Outstanding: ${inv.outstandingAmountPaise} paise (${CurrencyFormatter.formatPaise(inv.outstandingAmountPaise)})\n'
                            '• Grace Period: ${inv.gracePeriodDays} days • Daily Basis Points: ${inv.lateFeeDailyBps} bps/day\n'
                            '• Secure Access Token: ${inv.secureToken}',
                            style: const TextStyle(fontSize: 11, color: DuezyColors.textSecondary, height: 1.5, fontFamily: 'monospace'),
                          ),
                        ],
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
