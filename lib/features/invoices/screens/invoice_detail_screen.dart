import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/widgets/status_pill.dart';
import '../../../shared/models/invoice_model.dart';
import '../../payments/widgets/razorpay_qr_dialog.dart';
import '../../reminders/screens/ai_reminder_studio_screen.dart';

class InvoiceDetailScreen extends StatefulWidget {
  final InvoiceModel invoice;
  final VoidCallback onUpdated;
  final Function(String token)? onOpenPortal;

  const InvoiceDetailScreen({
    super.key,
    required this.invoice,
    required this.onUpdated,
    this.onOpenPortal,
  });

  @override
  State<InvoiceDetailScreen> createState() => _InvoiceDetailScreenState();
}

class _InvoiceDetailScreenState extends State<InvoiceDetailScreen> {
  final ApiClient _api = ApiClient();
  late InvoiceModel _invoice;

  @override
  void initState() {
    super.initState();
    _invoice = widget.invoice;
  }

  void _triggerPayment() async {
    final success = await _api.simulatePayment(_invoice.secureToken);
    if (success) {
      widget.onUpdated();
      final updatedList = await _api.getInvoices();
      final updated = updatedList.firstWhere(
        (i) => i.id == _invoice.id,
        orElse: () => _invoice,
      );
      if (mounted) {
        setState(() => _invoice = updated);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Payment captured & ledger updated via Razorpay Webhook!'),
            backgroundColor: DuezyColors.success,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPaid = _invoice.isPaid;

    return Scaffold(
      backgroundColor: DuezyColors.bgPage,
      appBar: AppBar(
        title: Text('Invoice #${_invoice.invoiceNumber}'),
        actions: [
          IconButton(
            tooltip: 'Open Public Customer Portal',
            icon: const Icon(Icons.open_in_new, color: DuezyColors.brand),
            onPressed: () {
              if (widget.onOpenPortal != null) {
                widget.onOpenPortal!(_invoice.secureToken);
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 900),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Top Header Card
                Container(
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    color: DuezyColors.bgSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: DuezyColors.borderDefault),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _invoice.customerName,
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                              ),
                              Text(
                                '${_invoice.customerCompany} • ${_invoice.customerPhone} • ${_invoice.customerEmail}',
                                style: const TextStyle(fontSize: 12, color: DuezyColors.textTertiary),
                              ),
                            ],
                          ),
                          StatusPill(status: _invoice.status),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        _invoice.description,
                        style: const TextStyle(fontSize: 14, color: DuezyColors.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      const Divider(color: DuezyColors.borderDefault),
                      const SizedBox(height: 12),

                      // Metrics Row
                      Row(
                        children: [
                          Expanded(
                            child: _MetricBlock(
                              title: 'Original Principal',
                              value: CurrencyFormatter.formatPaise(_invoice.originalAmountPaise),
                              color: DuezyColors.textPrimary,
                            ),
                          ),
                          Expanded(
                            child: _MetricBlock(
                              title: 'Paid Principal',
                              value: CurrencyFormatter.formatPaise(_invoice.paidAmountPaise),
                              color: DuezyColors.success,
                            ),
                          ),
                          Expanded(
                            child: _MetricBlock(
                              title: 'Late Fee Accrued',
                              value: CurrencyFormatter.formatPaise(_invoice.lateFeePaise),
                              color: _invoice.lateFeePaise > 0 ? DuezyColors.danger : DuezyColors.textTertiary,
                            ),
                          ),
                          Expanded(
                            child: _MetricBlock(
                              title: 'Outstanding Balance',
                              value: CurrencyFormatter.formatPaise(_invoice.outstandingAmountPaise),
                              color: isPaid ? DuezyColors.success : DuezyColors.brand,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Late-Fee Terms & Policy Card
                Container(
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: DuezyColors.bgSurfaceRaised,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: DuezyColors.borderDefault),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: DuezyColors.warning.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.shield_outlined, color: DuezyColors.warning, size: 18),
                          ),
                          const SizedBox(width: 8),
                          const Text(
                            'Deterministic Late-Fee Engine Terms',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        '• Due Date: ${_invoice.dueDate} • Grace Period: ${_invoice.gracePeriodDays} days\n'
                        '• Daily Late-Fee Rate: ${_invoice.lateFeeDailyBps / 100.0}% / day (${_invoice.lateFeeDailyBps} bps)\n'
                        '• Permitted Partial Payments: ${_invoice.permittedPartial ? "YES (min ${_invoice.minPartialPct}%)" : "NO"}\n'
                        '• Maximum Installment Schedule: Up to ${_invoice.maxInstallments} parts\n'
                        '• All financial calculations are executed in integer paise without IEEE-754 floating-point drift.',
                        style: const TextStyle(fontSize: 11, color: DuezyColors.textSecondary, height: 1.5, fontFamily: 'monospace'),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Actions Bar
                Wrap(
                  spacing: 12,
                  runSpacing: 10,
                  children: [
                    if (!isPaid)
                      ElevatedButton.icon(
                        onPressed: _triggerPayment,
                        icon: const Icon(Icons.flash_on, size: 16),
                        label: const Text('Simulate Webhook Settlement'),
                        style: ElevatedButton.styleFrom(backgroundColor: DuezyColors.brand),
                      ),
                    OutlinedButton.icon(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (_) => AIReminderStudioDialog(invoice: _invoice),
                        );
                      },
                      icon: const Icon(Icons.auto_awesome, size: 16, color: DuezyColors.info),
                      label: const Text('AI Reminder Studio'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () {
                        showDialog(
                          context: context,
                          builder: (_) => RazorpayQRDialog(
                            invoice: _invoice,
                            onTriggerPay: _triggerPayment,
                          ),
                        );
                      },
                      icon: const Icon(Icons.qr_code, size: 16, color: DuezyColors.success),
                      label: const Text('Razorpay Dynamic QR'),
                    ),
                    OutlinedButton.icon(
                      onPressed: () {
                        if (widget.onOpenPortal != null) {
                          widget.onOpenPortal!(_invoice.secureToken);
                        }
                      },
                      icon: const Icon(Icons.open_in_new, size: 16),
                      label: const Text('View Customer Payment Portal'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MetricBlock extends StatelessWidget {
  final String title;
  final String value;
  final Color color;

  const _MetricBlock({
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 11, color: DuezyColors.textTertiary)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: color)),
      ],
    );
  }
}
