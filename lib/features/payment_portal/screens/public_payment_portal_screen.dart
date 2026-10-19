import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/api/api_client.dart';
import '../../../core/responsive/responsive_layout.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/widgets/status_pill.dart';
import '../../../shared/models/portal_model.dart';

class PublicPaymentPortalScreen extends StatefulWidget {
  final String token;

  const PublicPaymentPortalScreen({
    super.key,
    required this.token,
  });

  @override
  State<PublicPaymentPortalScreen> createState() => _PublicPaymentPortalScreenState();
}

class _PublicPaymentPortalScreenState extends State<PublicPaymentPortalScreen> {
  final ApiClient _api = ApiClient();
  PortalInvoiceModel? _portalInvoice;
  bool _isLoading = true;

  // Conversational Assistant
  final List<AssistantChatMessage> _messages = [];
  final TextEditingController _chatController = TextEditingController();
  bool _isChatLoading = false;

  // Custom partial payment amount
  double _customAmount = 0.0;
  bool _isProcessingPay = false;

  @override
  void initState() {
    super.initState();
    _loadPortalData();
  }

  void _loadPortalData() async {
    setState(() => _isLoading = true);
    final data = await _api.getPortalInvoice(widget.token);
    if (mounted) {
      setState(() {
        _portalInvoice = data;
        _customAmount = data?.outstandingAmountRupees ?? 0.0;
        _isLoading = false;
      });

      if (_messages.isEmpty && data != null) {
        _messages.add(
          AssistantChatMessage(
            isUser: false,
            text: 'Hello ${data.customerName}! I am DUEZY, your automated payment assistant. '
                'You can settle invoice #${data.invoiceNumber} in full, or ask me for partial installments (e.g. "Can I pay half today?") or extensions.',
            timestamp: 'Just now',
          ),
        );
      }
    }
  }

  void _sendMessage() async {
    final text = _chatController.text.trim();
    if (text.isEmpty || _isChatLoading) return;

    _chatController.clear();
    setState(() {
      _messages.add(
        AssistantChatMessage(
          isUser: true,
          text: text,
          timestamp: 'Just now',
        ),
      );
      _isChatLoading = true;
    });

    final res = await _api.sendPortalChatMessage(widget.token, text);

    if (mounted) {
      final reply = res['reply'] as String? ?? 'Message processed.';
      final proposal = res['proposal'] as Map<String, dynamic>?;
      final proposedAmount = proposal?['amount_rupees'] as num?;

      if (proposedAmount != null) {
        _customAmount = proposedAmount.toDouble();
      }

      setState(() {
        _messages.add(
          AssistantChatMessage(
            isUser: false,
            text: reply,
            timestamp: 'Just now',
            intent: res['detected_intent'],
            proposedAmount: proposedAmount?.toDouble(),
            actionType: proposal?['proposed_action'],
          ),
        );
        _isChatLoading = false;
      });
    }
  }

  void _handlePay() async {
    if (_portalInvoice == null) return;
    setState(() => _isProcessingPay = true);

    final amountPaise = (_customAmount * 100).toInt();
    await _api.simulatePayment(widget.token, amountPaise: amountPaise);

    if (mounted) {
      setState(() => _isProcessingPay = false);
      _loadPortalData();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Payment of ${CurrencyFormatter.formatRupees(_customAmount)} confirmed via Razorpay Webhook!'),
          backgroundColor: DuezyColors.success,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: DuezyColors.bgPage,
        body: Center(
          child: CircularProgressIndicator(color: DuezyColors.brand),
        ),
      );
    }

    if (_portalInvoice == null) {
      return Scaffold(
        backgroundColor: DuezyColors.bgPage,
        body: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, size: 48, color: DuezyColors.danger),
              const SizedBox(height: 12),
              const Text(
                'Payment Link Not Found or Expired',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Return to Home'),
              ),
            ],
          ),
        ),
      );
    }

    final p = _portalInvoice!;
    final isMobile = Responsive.isMobile(context);

    return Scaffold(
      backgroundColor: DuezyColors.bgPage,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: DuezyColors.brand,
                borderRadius: BorderRadius.circular(6),
              ),
              child: const Icon(Icons.bolt, color: Colors.black, size: 16),
            ),
            const SizedBox(width: 8),
            Text(
              'DUEZY Secure Payment Portal',
              style: TextStyle(fontSize: isMobile ? 14 : 16, fontWeight: FontWeight.w800),
            ),
            const Spacer(),
            const Row(
              children: [
                Icon(Icons.lock, size: 12, color: DuezyColors.success),
                SizedBox(width: 4),
                Text('256-bit Encrypted', style: TextStyle(fontSize: 11, color: DuezyColors.textSecondary)),
              ],
            ),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(
          horizontal: isMobile ? 16 : 32,
          vertical: 24,
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1080),
            child: isMobile
                ? Column(
                    children: [
                      _buildInvoiceOverviewCard(p),
                      const SizedBox(height: 20),
                      _buildPaymentActionCard(p),
                      const SizedBox(height: 20),
                      _buildChatAssistantCard(),
                    ],
                  )
                : Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Left: Invoice details & payment checkout
                      Expanded(
                        flex: 6,
                        child: Column(
                          children: [
                            _buildInvoiceOverviewCard(p),
                            const SizedBox(height: 20),
                            _buildPaymentActionCard(p),
                          ],
                        ),
                      ),
                      const SizedBox(width: 24),
                      // Right: AI conversational assistant
                      Expanded(
                        flex: 5,
                        child: _buildChatAssistantCard(),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  Widget _buildInvoiceOverviewCard(PortalInvoiceModel p) {
    return Container(
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
              Text(
                'Billed by ${p.businessName}',
                style: const TextStyle(fontSize: 13, color: DuezyColors.textSecondary, fontWeight: FontWeight.w600),
              ),
              StatusPill(status: p.status),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            p.description,
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
          ),
          const SizedBox(height: 4),
          Text(
            'Invoice #${p.invoiceNumber} • Due on ${p.dueDate}',
            style: const TextStyle(fontSize: 12, color: DuezyColors.textTertiary),
          ),
          const SizedBox(height: 18),
          const Divider(color: DuezyColors.borderDefault),
          const SizedBox(height: 14),

          // Financial Breakdown
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Original Amount:', style: TextStyle(fontSize: 13, color: DuezyColors.textSecondary)),
              Text(
                CurrencyFormatter.formatRupees(p.originalAmountRupees),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: DuezyColors.textPrimary),
              ),
            ],
          ),
          if (p.paidAmountRupees > 0) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Confirmed Paid:', style: TextStyle(fontSize: 13, color: DuezyColors.success)),
                Text(
                  '-${CurrencyFormatter.formatRupees(p.paidAmountRupees)}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: DuezyColors.success),
                ),
              ],
            ),
          ],
          if (p.lateFeeRupees > 0) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Accrued Late Fee:', style: TextStyle(fontSize: 13, color: DuezyColors.danger)),
                Text(
                  '+${CurrencyFormatter.formatRupees(p.lateFeeRupees)}',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: DuezyColors.danger),
                ),
              ],
            ),
          ],
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: DuezyColors.bgInput,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Outstanding Principal:',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: DuezyColors.textPrimary),
                ),
                Text(
                  CurrencyFormatter.formatRupees(p.outstandingAmountRupees),
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                    color: p.isPaid ? DuezyColors.success : DuezyColors.brand,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentActionCard(PortalInvoiceModel p) {
    if (p.isPaid) {
      return Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: DuezyColors.successSubtle,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: DuezyColors.success.withValues(alpha: 0.4)),
        ),
        child: const Column(
          children: [
            Icon(Icons.check_circle, size: 48, color: DuezyColors.success),
            SizedBox(height: 10),
            Text(
              'This invoice has been settled in full!',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: DuezyColors.success),
            ),
            SizedBox(height: 4),
            Text(
              'Thank you for your business. A tax receipt has been generated automatically.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: DuezyColors.bgSurfaceRaised,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DuezyColors.borderDefault),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Instant Settlement via Razorpay / UPI',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
          ),
          const SizedBox(height: 14),

          // Permitted partial payment slider / button options
          if (p.permittedPartial && p.outstandingAmountRupees > p.minPartialAmountRupees) ...[
            Text(
              'Choose Payment Amount (Minimum allowed: ${CurrencyFormatter.formatRupees(p.minPartialAmountRupees)})',
              style: const TextStyle(fontSize: 12, color: DuezyColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(
                  label: const Text('Pay Full'),
                  backgroundColor: _customAmount == p.outstandingAmountRupees ? DuezyColors.brand : DuezyColors.bgInput,
                  labelStyle: TextStyle(
                    color: _customAmount == p.outstandingAmountRupees ? Colors.black : DuezyColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                  onPressed: () => setState(() => _customAmount = p.outstandingAmountRupees),
                ),
                ActionChip(
                  label: const Text('Pay 50%'),
                  backgroundColor: _customAmount == p.outstandingAmountRupees * 0.5 ? DuezyColors.brand : DuezyColors.bgInput,
                  labelStyle: TextStyle(
                    color: _customAmount == p.outstandingAmountRupees * 0.5 ? Colors.black : DuezyColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                  onPressed: () => setState(() => _customAmount = roundTwo(p.outstandingAmountRupees * 0.5)),
                ),
                ActionChip(
                  label: Text('Min (${p.minPartialPct}%)'),
                  backgroundColor: _customAmount == p.minPartialAmountRupees ? DuezyColors.brand : DuezyColors.bgInput,
                  labelStyle: TextStyle(
                    color: _customAmount == p.minPartialAmountRupees ? Colors.black : DuezyColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                  onPressed: () => setState(() => _customAmount = p.minPartialAmountRupees),
                ),
              ],
            ),
            const SizedBox(height: 14),
          ],

          // Dynamic QR & Pay Button
          ElevatedButton.icon(
            onPressed: _isProcessingPay ? null : _handlePay,
            icon: _isProcessingPay
                ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                : const Icon(Icons.flash_on, size: 18),
            label: Text(
              _isProcessingPay
                  ? 'Verifying Bank Transaction...'
                  : 'Pay ${CurrencyFormatter.formatRupees(_customAmount)} via Razorpay UPI',
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: DuezyColors.brand,
              foregroundColor: Colors.black,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
          const SizedBox(height: 10),
          Center(
            child: Text(
              'Supports Google Pay, PhonePe, Paytm, CRED & Cards • VPA: ${p.upiVpa}',
              style: const TextStyle(fontSize: 11, color: DuezyColors.textTertiary),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatAssistantCard() {
    return Container(
      height: 480,
      decoration: BoxDecoration(
        color: DuezyColors.bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: DuezyColors.borderDefault),
      ),
      child: Column(
        children: [
          // Chat Header
          Container(
            padding: const EdgeInsets.all(14),
            decoration: const BoxDecoration(
              color: DuezyColors.bgSurfaceRaised,
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
              border: Border(bottom: BorderSide(color: DuezyColors.borderDefault)),
            ),
            child: const Row(
              children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: DuezyColors.info,
                  child: Icon(Icons.smart_toy, size: 16, color: Colors.white),
                ),
                SizedBox(width: 10),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'DUEZY Payment Assistant',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: DuezyColors.textPrimary),
                    ),
                    Text(
                      'Ask for partial installments, extensions, or report payments',
                      style: TextStyle(fontSize: 10, color: DuezyColors.textTertiary),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Messages List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(14),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final m = _messages[index];
                return Align(
                  alignment: m.isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    constraints: const BoxConstraints(maxWidth: 320),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: m.isUser ? DuezyColors.brand : DuezyColors.bgInput,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          m.text,
                          style: TextStyle(
                            fontSize: 12,
                            height: 1.4,
                            color: m.isUser ? Colors.black : DuezyColors.textPrimary,
                            fontWeight: m.isUser ? FontWeight.w600 : FontWeight.w400,
                          ),
                        ),
                        if (m.actionType == 'GENERATE_PAYMENT_REQUEST' && m.proposedAmount != null) ...[
                          const SizedBox(height: 8),
                          ElevatedButton(
                            onPressed: () {
                              setState(() => _customAmount = m.proposedAmount!);
                              _handlePay();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: DuezyColors.brand,
                              foregroundColor: Colors.black,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            ),
                            child: Text(
                              'Pay ${CurrencyFormatter.formatRupees(m.proposedAmount!)} Now',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Chat Input
          Container(
            padding: const EdgeInsets.all(10),
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: DuezyColors.borderDefault)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _chatController,
                    onSubmitted: (_) => _sendMessage(),
                    decoration: const InputDecoration(
                      hintText: 'e.g. "I can pay half today" or "Can I pay ₹10k?"',
                      hintStyle: TextStyle(fontSize: 11, color: DuezyColors.textTertiary),
                      contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _sendMessage,
                  icon: const Icon(Icons.send, size: 18, color: DuezyColors.brand),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  double roundTwo(double val) => (val * 100).round() / 100.0;
}
