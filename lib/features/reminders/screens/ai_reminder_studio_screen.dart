import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../app/theme/colors.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/models/invoice_model.dart';

class AIReminderStudioDialog extends StatefulWidget {
  final InvoiceModel invoice;

  const AIReminderStudioDialog({
    super.key,
    required this.invoice,
  });

  @override
  State<AIReminderStudioDialog> createState() => _AIReminderStudioDialogState();
}

class _AIReminderStudioDialogState extends State<AIReminderStudioDialog> {
  String _selectedTone = 'BALANCED';
  String _selectedLanguage = 'English';
  String _selectedChannel = 'whatsapp';
  bool _copied = false;

  Map<String, String> _generateCopy() {
    final clientName = widget.invoice.customerName;
    final amountFormatted = CurrencyFormatter.formatPaise(widget.invoice.originalAmountPaise);
    final invNum = widget.invoice.invoiceNumber;
    final dueDate = widget.invoice.dueDate;
    final rzpUrl = widget.invoice.paymentLinkUrl ?? 'https://rzp.io/l/duezy_demo';

    if (_selectedLanguage == 'Hinglish') {
      return {
        'whatsapp': '*DUEZY Automated Invoice Reminder*\n\nNamaste *$clientName ji* 🙏,\n\nAapka invoice *#$invNum* ($amountFormatted) *$dueDate* ko due tha.\n\nRazorpay link se aap directly *GPay / PhonePe / Card* se 1-click me pay kar sakte hain:\n🔗 *$rzpUrl*\n\nPayment complete hote hi automatic tax receipt generate ho jayegi. Shukriya!',
        'email_subject': 'Payment Reminder: Invoice #$invNum ($amountFormatted) - Instant Razorpay Settlement',
        'email_body': 'Dear $clientName,\n\nHope you are doing well.\n\nThis is a friendly reminder regarding pending invoice #$invNum of $amountFormatted, due on $dueDate.\n\nYou can settle this securely in seconds via Razorpay:\n$rzpUrl\n\nWarm regards,\nAccounts & Finance Team',
        'sms': 'DUEZY: Hi $clientName, invoice #$invNum for $amountFormatted is pending. Pay instantly via UPI/Razorpay: $rzpUrl',
      };
    }

    switch (_selectedTone) {
      case 'GENTLE':
        return {
          'whatsapp': '*Gentle Nudge from DUEZY* ✨\n\nHi *$clientName*,\n\nHope you are having a productive week! Just a friendly note that invoice *#$invNum* for *$amountFormatted* is due on *$dueDate*.\n\nWhenever you are ready, you can settle it directly using this Razorpay link:\n👉 *$rzpUrl*\n\n(Supports Google Pay, PhonePe, Paytm & Cards). Have a wonderful day!',
          'email_subject': 'Friendly Note: Invoice #$invNum ($amountFormatted) for $clientName',
          'email_body': 'Hi $clientName,\n\nWe appreciate working with you! Here is a quick reminder for your upcoming invoice #$invNum of $amountFormatted.\n\nPay securely with one tap:\n$rzpUrl\n\nBest regards,\nFinance Team',
          'sms': 'Hi $clientName, friendly reminder for invoice #$invNum ($amountFormatted). Settle anytime via: $rzpUrl',
        };
      case 'FIRM':
        return {
          'whatsapp': '*Payment Reminder: Invoice #$invNum Overdue*\n\nDear *$clientName*,\n\nOur system indicates that the payment of *$amountFormatted* for invoice *#$invNum* was due on *$dueDate* and is currently *overdue*.\n\nTo ensure uninterrupted project services, please complete the settlement today via Razorpay:\n💳 *$rzpUrl*\n\nAll automated reminders will halt immediately upon payment confirmation. Thank you.',
          'email_subject': 'OVERDUE: Invoice #$invNum ($amountFormatted) requires immediate settlement',
          'email_body': 'Dear $clientName,\n\nThis is a follow-up regarding overdue invoice #$invNum of $amountFormatted.\n\nAs our finance books are closing for this cycle, please clear the balance via the secure link below:\n$rzpUrl\n\nThank you,\nFinance Department',
          'sms': 'URGENT: $clientName, invoice #$invNum ($amountFormatted) is overdue. Pay via Razorpay: $rzpUrl',
        };
      case 'ESCALATED':
        return {
          'whatsapp': '*FINAL NOTICE — Immediate Settlement Required*\n\nAttention: *$clientName*,\n\nInvoice *#$invNum* for *$amountFormatted* is significantly overdue. Outstanding dues may affect active deliverables and support agreements.\n\nPlease clear the balance immediately via Razorpay:\n⚠️ *$rzpUrl*\n\nAll automated reminders will halt upon verified settlement.',
          'email_subject': 'FINAL NOTICE: Outstanding Balance of $amountFormatted for Invoice #$invNum',
          'email_body': 'Dear $clientName,\n\nPlease be advised that invoice #$invNum remains unpaid. Continued non-settlement may necessitate service suspension.\n\nSettle the full balance immediately via Razorpay:\n$rzpUrl\n\nAccounts & Compliance',
          'sms': 'FINAL NOTICE: $clientName, invoice #$invNum ($amountFormatted) is critical overdue. Settle now: $rzpUrl',
        };
      case 'BALANCED':
      default:
        return {
          'whatsapp': '*DUEZY Smart Reminder* ⚡\n\nHi *$clientName*,\n\nThis is a reminder regarding your invoice *#$invNum* for *$amountFormatted*, due on *$dueDate*.\n\nYou can pay securely in under 30 seconds via Razorpay (UPI, GPay, PhonePe, Cards):\n🔗 *$rzpUrl*\n\nOnce paid, your tax receipt will be generated automatically. Thank you!',
          'email_subject': 'Invoice #$invNum ($amountFormatted) from DUEZY - Secure Razorpay Link',
          'email_body': 'Hello $clientName,\n\nYour payment of $amountFormatted for invoice #$invNum is pending.\n\nPlease click the button below to settle via Razorpay:\n$rzpUrl\n\nThank you for your business!',
          'sms': 'DUEZY: Hi $clientName, invoice #$invNum for $amountFormatted is pending. Pay instantly: $rzpUrl',
        };
    }
  }

  void _copyActiveContent(String text) {
    Clipboard.setData(ClipboardData(text: text));
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final copyMap = _generateCopy();
    final isPaid = widget.invoice.isPaid;

    String currentDisplay = copyMap[_selectedChannel] ?? '';
    if (_selectedChannel == 'email') {
      currentDisplay = 'Subject: ${copyMap['email_subject']}\n\n${copyMap['email_body']}';
    }

    return Dialog(
      backgroundColor: DuezyColors.bgSurfaceRaised,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 650,
        padding: const EdgeInsets.all(22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: DuezyColors.info.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.auto_awesome, color: DuezyColors.info, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'AI Reminder Studio & Multi-Channel Preview',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                      ),
                      Text(
                        'Generating personalized reminders for ${widget.invoice.customerName} (${CurrencyFormatter.formatPaise(widget.invoice.originalAmountPaise)})',
                        style: const TextStyle(fontSize: 11, color: DuezyColors.textSecondary),
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

            if (isPaid) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: DuezyColors.successSubtle,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: DuezyColors.success.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.check_circle, size: 16, color: DuezyColors.success),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'INVOICE PAID: Automated reminder bots are currently paused for this debtor.',
                        style: TextStyle(color: DuezyColors.success, fontSize: 11, fontWeight: FontWeight.w700),
                      ),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 16),

            // Controls Bar
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: DuezyColors.bgInput,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: DuezyColors.borderDefault),
              ),
              child: Wrap(
                spacing: 16,
                runSpacing: 10,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  // Tone Selector
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Tone: ', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
                      DropdownButton<String>(
                        value: _selectedTone,
                        dropdownColor: DuezyColors.bgSurfaceRaised,
                        underline: const SizedBox(),
                        style: const TextStyle(fontSize: 12, color: DuezyColors.textPrimary, fontWeight: FontWeight.bold),
                        items: const [
                          DropdownMenuItem(value: 'GENTLE', child: Text('Gentle & Courteous')),
                          DropdownMenuItem(value: 'BALANCED', child: Text('Balanced Professional')),
                          DropdownMenuItem(value: 'FIRM', child: Text('Firm & Account-Aware')),
                          DropdownMenuItem(value: 'ESCALATED', child: Text('Escalated Formal Notice')),
                        ],
                        onChanged: (val) => setState(() => _selectedTone = val ?? 'BALANCED'),
                      ),
                    ],
                  ),

                  // Language
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text('Language: ', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
                      DropdownButton<String>(
                        value: _selectedLanguage,
                        dropdownColor: DuezyColors.bgSurfaceRaised,
                        underline: const SizedBox(),
                        style: const TextStyle(fontSize: 12, color: DuezyColors.textPrimary, fontWeight: FontWeight.bold),
                        items: const [
                          DropdownMenuItem(value: 'English', child: Text('English')),
                          DropdownMenuItem(value: 'Hinglish', child: Text('Hinglish (Hindi + Eng)')),
                        ],
                        onChanged: (val) => setState(() => _selectedLanguage = val ?? 'English'),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // Channel Tabs
            Row(
              children: [
                _ChannelTab(
                  label: 'WhatsApp Message',
                  icon: Icons.chat,
                  color: DuezyColors.whatsapp,
                  selected: _selectedChannel == 'whatsapp',
                  onTap: () => setState(() => _selectedChannel = 'whatsapp'),
                ),
                const SizedBox(width: 8),
                _ChannelTab(
                  label: 'Email Invoicing',
                  icon: Icons.mail_outline,
                  color: DuezyColors.info,
                  selected: _selectedChannel == 'email',
                  onTap: () => setState(() => _selectedChannel = 'email'),
                ),
                const SizedBox(width: 8),
                _ChannelTab(
                  label: '160-char SMS',
                  icon: Icons.sms_outlined,
                  color: DuezyColors.warning,
                  selected: _selectedChannel == 'sms',
                  onTap: () => setState(() => _selectedChannel = 'sms'),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Message Preview Box
            Container(
              height: 180,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: DuezyColors.bgPage,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: DuezyColors.borderDefault),
              ),
              child: SingleChildScrollView(
                child: SelectableText(
                  currentDisplay,
                  style: const TextStyle(
                    fontSize: 13,
                    height: 1.5,
                    color: DuezyColors.textPrimary,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Footer actions
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton.icon(
                  onPressed: () => _copyActiveContent(currentDisplay),
                  icon: Icon(_copied ? Icons.check : Icons.copy, size: 14),
                  label: Text(_copied ? 'Copied!' : 'Copy Text'),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('Simulated sending ${_selectedChannel.toUpperCase()} to ${widget.invoice.customerName}!'),
                        backgroundColor: DuezyColors.success,
                      ),
                    );
                    Navigator.of(context).pop();
                  },
                  icon: const Icon(Icons.send, size: 14),
                  label: Text('Send ${_selectedChannel.toUpperCase()} Now'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _ChannelTab extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _ChannelTab({
    required this.label,
    required this.icon,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? color.withValues(alpha: 0.15) : DuezyColors.bgInput,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? color : DuezyColors.borderDefault,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: selected ? color : DuezyColors.textTertiary),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                color: selected ? color : DuezyColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
