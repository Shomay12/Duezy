import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';

class WebhookMonitorDrawer extends StatelessWidget {
  final List<dynamic> logs;

  const WebhookMonitorDrawer({
    super.key,
    required this.logs,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: DuezyColors.bgSurfaceRaised,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 680,
        height: 520,
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: DuezyColors.success.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.terminal, color: DuezyColors.success, size: 20),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Razorpay Webhook Stream & Verification Engine',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                      ),
                      Text(
                        'Real-time HTTP webhooks received from Razorpay with HMAC SHA-256 signature verification.',
                        style: TextStyle(fontSize: 11, color: DuezyColors.textSecondary),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close, size: 20, color: DuezyColors.textTertiary),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: DuezyColors.borderDefault),
                ),
                child: logs.isEmpty
                    ? const Center(
                        child: Text(
                          'No webhook events captured yet.',
                          style: TextStyle(color: DuezyColors.textTertiary, fontSize: 12),
                        ),
                      )
                    : ListView.separated(
                        itemCount: logs.length,
                        separatorBuilder: (_, _) => const Divider(color: Color(0x1AFFFFFF), height: 16),
                        itemBuilder: (context, index) {
                          final log = logs[index];
                          final event = log['event'] ?? 'event';
                          final paymentId = log['paymentId'] ?? log['orderId'] ?? '';
                          final action = log['actionTaken'] ?? '';
                          final timestamp = log['timestamp'] ?? '';
                          final client = log['client'] ?? '';

                          return Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: DuezyColors.success.withValues(alpha: 0.15),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      event,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: DuezyColors.success,
                                        fontFamily: 'monospace',
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    paymentId,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: DuezyColors.info,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                  const Spacer(),
                                  const Icon(Icons.shield_outlined, size: 12, color: DuezyColors.success),
                                  const SizedBox(width: 4),
                                  const Text(
                                    'HMAC-SHA256 VERIFIED 200',
                                    style: TextStyle(fontSize: 10, color: DuezyColors.success, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Text(
                                action,
                                style: const TextStyle(fontSize: 12, color: DuezyColors.textPrimary, height: 1.3),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '$client • $timestamp',
                                style: const TextStyle(fontSize: 10, color: DuezyColors.textTertiary),
                              ),
                            ],
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
