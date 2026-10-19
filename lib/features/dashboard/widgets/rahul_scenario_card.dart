import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/widgets/status_pill.dart';
import '../../../shared/models/invoice_model.dart';

class RahulScenarioCard extends StatelessWidget {
  final InvoiceModel? invoice;
  final VoidCallback onOpenQR;
  final VoidCallback onOpenAIReminders;
  final VoidCallback onTriggerPay;
  final VoidCallback onReset;

  const RahulScenarioCard({
    super.key,
    required this.invoice,
    required this.onOpenQR,
    required this.onOpenAIReminders,
    required this.onTriggerPay,
    required this.onReset,
  });

  @override
  Widget build(BuildContext context) {
    if (invoice == null) return const SizedBox.shrink();

    final isPaid = invoice!.isPaid;

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: DuezyColors.bgSurfaceRaised,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isPaid ? DuezyColors.success.withValues(alpha: 0.4) : DuezyColors.borderStrong,
          width: 1.5,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Badge
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 8,
            runSpacing: 8,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: DuezyColors.info.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: DuezyColors.info.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.auto_awesome, color: DuezyColors.info, size: 13),
                    SizedBox(width: 5),
                    Text(
                      'Live Scenario — Rahul Sharma ₹25,000',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: DuezyColors.info,
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                'Invoice #${invoice!.invoiceNumber}',
                style: const TextStyle(
                  color: DuezyColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),

          const SizedBox(height: 14),

          // Title & Status
          Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 12,
            runSpacing: 6,
            children: [
              Text(
                invoice!.customerName,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: DuezyColors.textPrimary,
                ),
              ),
              StatusPill(
                status: isPaid ? 'PAID' : 'OVERDUE',
                subtitle: isPaid ? '₹25,000 Settled' : 'DUEZY Tracking',
              ),
            ],
          ),

          const SizedBox(height: 4),
          Text(
            '${invoice!.customerCompany} • ${invoice!.customerPhone} • ${invoice!.customerEmail}',
            style: const TextStyle(
              fontSize: 12,
              color: DuezyColors.textTertiary,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            invoice!.description,
            style: const TextStyle(
              fontSize: 13,
              color: DuezyColors.textSecondary,
            ),
          ),

          const SizedBox(height: 16),

          // Details Grid
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: DuezyColors.bgInput,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: DuezyColors.borderDefault),
            ),
            child: Wrap(
              spacing: 24,
              runSpacing: 14,
              children: [
                _DetailBox(
                  label: 'Amount Payable',
                  value: CurrencyFormatter.formatPaise(invoice!.originalAmountPaise),
                  valueColor: isPaid ? DuezyColors.success : DuezyColors.textPrimary,
                  isBold: true,
                ),
                _DetailBox(
                  label: 'Razorpay Link & QR',
                  value: 'Live Active (UPI + Cards)',
                  valueColor: DuezyColors.info,
                ),
                _DetailBox(
                  label: 'AI Reminder Engine',
                  value: isPaid ? 'ALL REMINDERS HALTED' : 'WhatsApp + Email Active',
                  valueColor: isPaid ? DuezyColors.success : DuezyColors.warning,
                ),
                _DetailBox(
                  label: 'Settlement Mode',
                  value: isPaid ? 'Razorpay Webhook (Captured)' : 'Awaiting Checkout',
                  valueColor: DuezyColors.textSecondary,
                ),
              ],
            ),
          ),

          const SizedBox(height: 18),

          // Actions Row
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              if (!isPaid)
                ElevatedButton.icon(
                  onPressed: onTriggerPay,
                  icon: const Icon(Icons.flash_on, size: 16),
                  label: const Text('Simulate: Rahul Pays ₹25,000'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: DuezyColors.success,
                    foregroundColor: Colors.black,
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: DuezyColors.successSubtle,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: DuezyColors.success.withValues(alpha: 0.3)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.check_circle, size: 16, color: DuezyColors.success),
                      SizedBox(width: 8),
                      Text(
                        '₹25,000 Captured via Razorpay! All future reminders stopped permanently.',
                        style: TextStyle(
                          color: DuezyColors.success,
                          fontWeight: FontWeight.w700,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),

              OutlinedButton.icon(
                onPressed: onOpenAIReminders,
                icon: const Icon(Icons.auto_awesome, size: 16, color: DuezyColors.info),
                label: const Text('AI Reminder Studio'),
              ),

              OutlinedButton.icon(
                onPressed: onOpenQR,
                icon: const Icon(Icons.qr_code, size: 16, color: DuezyColors.success),
                label: const Text('Razorpay Link & QR'),
              ),

              if (isPaid)
                TextButton.icon(
                  onPressed: onReset,
                  icon: const Icon(Icons.refresh, size: 14),
                  label: const Text('Reset to Unpaid'),
                  style: TextButton.styleFrom(foregroundColor: DuezyColors.textTertiary),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _DetailBox extends StatelessWidget {
  final String label;
  final String value;
  final Color valueColor;
  final bool isBold;

  const _DetailBox({
    required this.label,
    required this.value,
    required this.valueColor,
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 11, color: DuezyColors.textTertiary),
        ),
        const SizedBox(height: 3),
        Text(
          value,
          style: TextStyle(
            fontSize: isBold ? 16 : 13,
            fontWeight: isBold ? FontWeight.w800 : FontWeight.w600,
            color: valueColor,
          ),
        ),
      ],
    );
  }
}
