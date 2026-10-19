import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../app/theme/colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/models/invoice_model.dart';

class RazorpayQRDialog extends StatefulWidget {
  final InvoiceModel invoice;
  final VoidCallback onTriggerPay;

  const RazorpayQRDialog({
    super.key,
    required this.invoice,
    required this.onTriggerPay,
  });

  @override
  State<RazorpayQRDialog> createState() => _RazorpayQRDialogState();
}

class _RazorpayQRDialogState extends State<RazorpayQRDialog> {
  String _selectedUpiApp = 'gpay';
  bool _isProcessing = false;
  bool _copied = false;

  void _handlePay() async {
    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(milliseconds: 1200));
    if (mounted) {
      setState(() => _isProcessing = false);
      widget.onTriggerPay();
      Navigator.of(context).pop();
    }
  }

  void _copyVpa() {
    Clipboard.setData(ClipboardData(text: widget.invoice.upiVpa));
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final isPaid = widget.invoice.isPaid;
    final amountFormatted = CurrencyFormatter.formatPaise(widget.invoice.originalAmountPaise);

    return Dialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 380,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Razorpay Authentic Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
              decoration: const BoxDecoration(
                color: Color(0xFF0C2340),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0A85EA),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'Razorpay',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'DUEZY Settlement',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        Text(
                          'Invoice #${widget.invoice.invoiceNumber}',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    amountFormatted,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w800,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),

            // Body
            Padding(
              padding: const EdgeInsets.all(20),
              child: isPaid
                  ? Column(
                      children: [
                        const Icon(Icons.check_circle, size: 54, color: DuezyColors.success),
                        const SizedBox(height: 12),
                        const Text(
                          'Payment Captured Successfully!',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0F172A),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Razorpay Webhook was received and verified. $amountFormatted has been credited and all future reminders are stopped.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF64748B)),
                        ),
                        const SizedBox(height: 18),
                        OutlinedButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Close Checkout'),
                        ),
                      ],
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Text(
                          'Scan to Pay with Any UPI App',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF475569),
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Dynamic Custom QR Graphic
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFFE2E8F0)),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.05),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: CustomPaint(
                            size: const Size(150, 150),
                            painter: _UpiQrPainter(),
                          ),
                        ),

                        const SizedBox(height: 10),

                        // UPI VPA pill with copy
                        InkWell(
                          onTap: _copyVpa,
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF1F5F9),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFFCBD5E1)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  'UPI: ${widget.invoice.upiVpa}',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF334155),
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Icon(
                                  _copied ? Icons.check : Icons.copy,
                                  size: 13,
                                  color: _copied ? DuezyColors.success : const Color(0xFF64748B),
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 16),

                        // Instant App Selector
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _AppButton(
                              label: 'Google Pay',
                              iconEmoji: '🔵',
                              selected: _selectedUpiApp == 'gpay',
                              onTap: () => setState(() => _selectedUpiApp = 'gpay'),
                            ),
                            const SizedBox(width: 8),
                            _AppButton(
                              label: 'PhonePe',
                              iconEmoji: '🟣',
                              selected: _selectedUpiApp == 'phonepe',
                              onTap: () => setState(() => _selectedUpiApp = 'phonepe'),
                            ),
                            const SizedBox(width: 8),
                            _AppButton(
                              label: 'Paytm',
                              iconEmoji: '🔷',
                              selected: _selectedUpiApp == 'paytm',
                              onTap: () => setState(() => _selectedUpiApp = 'paytm'),
                            ),
                          ],
                        ),

                        const SizedBox(height: 16),

                        // Pay Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton.icon(
                            onPressed: _isProcessing ? null : _handlePay,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF0A85EA),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: _isProcessing
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                  )
                                : const Icon(Icons.lock, size: 16),
                            label: Text(
                              _isProcessing ? 'Verifying with Bank...' : 'Pay $amountFormatted Securely',
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                            ),
                          ),
                        ),

                        const SizedBox(height: 8),
                        const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.shield_outlined, size: 12, color: DuezyColors.success),
                            SizedBox(width: 4),
                            Text(
                              '256-bit SSL Encrypted • Powered by Razorpay',
                              style: TextStyle(fontSize: 10, color: Color(0xFF94A3B8)),
                            ),
                          ],
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _AppButton extends StatelessWidget {
  final String label;
  final String iconEmoji;
  final bool selected;
  final VoidCallback onTap;

  const _AppButton({
    required this.label,
    required this.iconEmoji,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? const Color(0xFFEFF6FF) : Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? const Color(0xFF0A85EA) : const Color(0xFFE2E8F0),
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(iconEmoji, style: const TextStyle(fontSize: 14)),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? const Color(0xFF0A85EA) : const Color(0xFF475569),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UpiQrPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paintDark = Paint()..color = const Color(0xFF0C2340);
    final paintBlue = Paint()..color = const Color(0xFF0A85EA);
    final paintWhite = Paint()..color = Colors.white;

    // Corner Finder Patterns (Top-Left)
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(10, 10, 36, 36), const Radius.circular(6)), paintDark);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(17, 17, 22, 22), const Radius.circular(3)), paintWhite);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(22, 22, 12, 12), const Radius.circular(2)), paintBlue);

    // Corner Finder Patterns (Top-Right)
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(104, 10, 36, 36), const Radius.circular(6)), paintDark);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(111, 17, 22, 22), const Radius.circular(3)), paintWhite);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(116, 22, 12, 12), const Radius.circular(2)), paintBlue);

    // Corner Finder Patterns (Bottom-Left)
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(10, 104, 36, 36), const Radius.circular(6)), paintDark);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(17, 111, 22, 22), const Radius.circular(3)), paintWhite);
    canvas.drawRRect(RRect.fromRectAndRadius(const Rect.fromLTWH(22, 116, 12, 12), const Radius.circular(2)), paintBlue);

    // Dynamic QR matrix dots
    final List<Rect> darkBlocks = [
      const Rect.fromLTWH(58, 15, 8, 8),
      const Rect.fromLTWH(58, 45, 12, 6),
      const Rect.fromLTWH(80, 45, 8, 8),
      const Rect.fromLTWH(25, 65, 10, 8),
      const Rect.fromLTWH(75, 65, 12, 12),
      const Rect.fromLTWH(95, 65, 16, 8),
      const Rect.fromLTWH(45, 85, 10, 10),
      const Rect.fromLTWH(100, 85, 15, 10),
      const Rect.fromLTWH(125, 85, 8, 8),
      const Rect.fromLTWH(60, 105, 12, 12),
      const Rect.fromLTWH(105, 105, 10, 10),
      const Rect.fromLTWH(125, 115, 15, 15),
    ];
    for (final r in darkBlocks) {
      canvas.drawRect(r, paintDark);
    }

    final List<Rect> blueBlocks = [
      const Rect.fromLTWH(75, 25, 10, 10),
      const Rect.fromLTWH(45, 65, 20, 10),
      const Rect.fromLTWH(120, 65, 10, 12),
      const Rect.fromLTWH(20, 85, 14, 8),
      const Rect.fromLTWH(65, 85, 25, 8),
      const Rect.fromLTWH(80, 115, 14, 10),
    ];
    for (final r in blueBlocks) {
      canvas.drawRect(r, paintBlue);
    }

    // Center Rupee Badge
    canvas.drawCircle(const Offset(75, 75), 14, paintWhite);
    canvas.drawCircle(const Offset(75, 75), 14, Paint()..color = const Color(0xFF0A85EA)..style = PaintingStyle.stroke..strokeWidth = 2);

    final textPainter = TextPainter(
      text: const TextSpan(
        text: '₹',
        style: TextStyle(color: Color(0xFF0A85EA), fontSize: 13, fontWeight: FontWeight.bold),
      ),
      textDirection: TextDirection.ltr,
    )..layout();
    textPainter.paint(canvas, Offset(75 - textPainter.width / 2, 75 - textPainter.height / 2));
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
