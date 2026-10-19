import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/responsive/responsive_layout.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/widgets/status_pill.dart';
import '../../../shared/models/invoice_model.dart';

class PaymentsStreamTable extends StatefulWidget {
  final List<InvoiceModel> invoices;
  final Function(InvoiceModel) onOpenQR;
  final Function(InvoiceModel) onOpenAI;
  final Function(InvoiceModel) onSimulatePay;
  final Function(InvoiceModel)? onViewPortal;
  final Function(InvoiceModel)? onViewDetail;

  const PaymentsStreamTable({
    super.key,
    required this.invoices,
    required this.onOpenQR,
    required this.onOpenAI,
    required this.onSimulatePay,
    this.onViewPortal,
    this.onViewDetail,
  });

  @override
  State<PaymentsStreamTable> createState() => _PaymentsStreamTableState();
}

class _PaymentsStreamTableState extends State<PaymentsStreamTable> {
  String _searchQuery = '';
  String _statusFilter = 'ALL';

  @override
  Widget build(BuildContext context) {
    final filtered = widget.invoices.filter((p) {
      final matchesSearch = p.customerName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.customerCompany.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.invoiceNumber.toLowerCase().contains(_searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (_statusFilter == 'ALL') return true;
      return p.status == _statusFilter;
    }).toList();

    return Container(
      decoration: BoxDecoration(
        color: DuezyColors.bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: DuezyColors.borderDefault),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header with Search & Filter
          Padding(
            padding: const EdgeInsets.all(16),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 12,
              runSpacing: 12,
              children: [
                const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Active Payment Streams & Recovery Tracker',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: DuezyColors.textPrimary,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Real-time payment links with automated multi-channel follow-ups.',
                      style: TextStyle(
                        fontSize: 11,
                        color: DuezyColors.textSecondary,
                      ),
                    ),
                  ],
                ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    // Search Input
                    SizedBox(
                      width: 170,
                      height: 38,
                      child: TextField(
                        onChanged: (val) => setState(() => _searchQuery = val),
                        decoration: InputDecoration(
                          hintText: 'Search debtor...',
                          prefixIcon: const Icon(Icons.search, size: 16, color: DuezyColors.textTertiary),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(20),
                            borderSide: const BorderSide(color: DuezyColors.borderDefault),
                          ),
                        ),
                        style: const TextStyle(fontSize: 12),
                      ),
                    ),
                    // Status Filter Dropdown
                    Container(
                      height: 38,
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      decoration: BoxDecoration(
                        color: DuezyColors.bgInput,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: DuezyColors.borderDefault),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _statusFilter,
                          dropdownColor: DuezyColors.bgSurfaceRaised,
                          style: const TextStyle(fontSize: 12, color: DuezyColors.textPrimary),
                          items: const [
                            DropdownMenuItem(value: 'ALL', child: Text('All Statuses')),
                            DropdownMenuItem(value: 'OVERDUE', child: Text('Overdue')),
                            DropdownMenuItem(value: 'PARTIALLY_PAID', child: Text('Partial')),
                            DropdownMenuItem(value: 'SENT', child: Text('Sent')),
                            DropdownMenuItem(value: 'PAID', child: Text('Paid ✓')),
                          ],
                          onChanged: (val) => setState(() => _statusFilter = val ?? 'ALL'),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const Divider(height: 1, color: DuezyColors.borderDefault),

          // Invoices List
          if (filtered.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Center(
                child: Text(
                  'No invoices found matching criteria.',
                  style: TextStyle(color: DuezyColors.textTertiary, fontSize: 13),
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              separatorBuilder: (_, _) => const Divider(height: 1, color: DuezyColors.borderDefault),
              itemBuilder: (context, index) {
                final p = filtered[index];
                final isMobile = Responsive.isMobile(context);

                if (isMobile) {
                  return InkWell(
                    onTap: () => widget.onViewDetail?.call(p),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 16,
                                backgroundColor: DuezyColors.brand.withValues(alpha: 0.15),
                                child: Text(
                                  p.customerName.length >= 2 ? p.customerName.substring(0, 2).toUpperCase() : 'CU',
                                  style: const TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    color: DuezyColors.brand,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      p.customerName,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: DuezyColors.textPrimary,
                                      ),
                                    ),
                                    Text(
                                      '${p.customerCompany} • #${p.invoiceNumber}',
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: DuezyColors.textTertiary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              StatusPill(
                                status: p.status,
                                subtitle: p.isPaid ? 'Reminders Halted' : 'AI Active',
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    CurrencyFormatter.formatPaise(p.originalAmountPaise),
                                    style: TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.w800,
                                      color: p.isPaid ? DuezyColors.success : DuezyColors.textPrimary,
                                    ),
                                  ),
                                  Text(
                                    'Due ${p.dueDate}',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: DuezyColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  _ChannelBadge(icon: Icons.chat, color: DuezyColors.whatsapp, tooltip: 'WhatsApp Ready'),
                                  const SizedBox(width: 4),
                                  _ChannelBadge(icon: Icons.mail_outline, color: DuezyColors.info, tooltip: 'Email Ready'),
                                  const SizedBox(width: 4),
                                  _ChannelBadge(icon: Icons.sms_outlined, color: DuezyColors.warning, tooltip: 'SMS Ready'),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              OutlinedButton.icon(
                                onPressed: () => widget.onOpenAI(p),
                                icon: const Icon(Icons.auto_awesome, color: DuezyColors.info, size: 14),
                                label: const Text('AI Studio', style: TextStyle(fontSize: 11)),
                                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
                              ),
                              OutlinedButton.icon(
                                onPressed: () => widget.onOpenQR(p),
                                icon: const Icon(Icons.qr_code, color: DuezyColors.success, size: 14),
                                label: const Text('QR / Pay', style: TextStyle(fontSize: 11)),
                                style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
                              ),
                              if (widget.onViewPortal != null)
                                OutlinedButton.icon(
                                  onPressed: () => widget.onViewPortal!(p),
                                  icon: const Icon(Icons.open_in_new, color: DuezyColors.textSecondary, size: 14),
                                  label: const Text('Portal', style: TextStyle(fontSize: 11)),
                                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6)),
                                ),
                              if (!p.isPaid)
                                ElevatedButton(
                                  onPressed: () => widget.onSimulatePay(p),
                                  style: ElevatedButton.styleFrom(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    backgroundColor: DuezyColors.brand,
                                  ),
                                  child: const Text('Simulate Pay', style: TextStyle(fontSize: 11)),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return InkWell(
                  onTap: () => widget.onViewDetail?.call(p),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    child: Row(
                    children: [
                      // Avatar
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: DuezyColors.brand.withValues(alpha: 0.15),
                        child: Text(
                          p.customerName.length >= 2 ? p.customerName.substring(0, 2).toUpperCase() : 'CU',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: DuezyColors.brand,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),

                      // Customer & Invoice info
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              p.customerName,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: DuezyColors.textPrimary,
                              ),
                            ),
                            Text(
                              '${p.customerCompany} • #${p.invoiceNumber}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: DuezyColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Amount
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              CurrencyFormatter.formatPaise(p.originalAmountPaise),
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: p.isPaid ? DuezyColors.success : DuezyColors.textPrimary,
                              ),
                            ),
                            Text(
                              'Due ${p.dueDate}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: DuezyColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),

                      // Status Pill
                      Expanded(
                        flex: 2,
                        child: StatusPill(
                          status: p.status,
                          subtitle: p.isPaid ? 'Reminders Halted' : 'AI Active',
                        ),
                      ),

                      // Channels
                      Row(
                        children: [
                          _ChannelBadge(icon: Icons.chat, color: DuezyColors.whatsapp, tooltip: 'WhatsApp Ready'),
                          const SizedBox(width: 4),
                          _ChannelBadge(icon: Icons.mail_outline, color: DuezyColors.info, tooltip: 'Email Ready'),
                          const SizedBox(width: 4),
                          _ChannelBadge(icon: Icons.sms_outlined, color: DuezyColors.warning, tooltip: 'SMS Ready'),
                        ],
                      ),
                      const SizedBox(width: 14),

                      // Action buttons
                      IconButton(
                        onPressed: () => widget.onOpenAI(p),
                        tooltip: 'Open AI Reminder Studio',
                        icon: const Icon(Icons.auto_awesome, color: DuezyColors.info, size: 18),
                      ),
                      IconButton(
                        onPressed: () => widget.onOpenQR(p),
                        tooltip: 'Razorpay Link & Dynamic QR',
                        icon: const Icon(Icons.qr_code, color: DuezyColors.success, size: 18),
                      ),
                      if (widget.onViewPortal != null)
                        IconButton(
                          onPressed: () => widget.onViewPortal!(p),
                          tooltip: 'Open Customer Payment Portal',
                          icon: const Icon(Icons.open_in_new, color: DuezyColors.textSecondary, size: 18),
                        ),
                      if (!p.isPaid)
                        ElevatedButton(
                          onPressed: () => widget.onSimulatePay(p),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                            backgroundColor: DuezyColors.brand,
                          ),
                          child: const Text('Simulate Pay', style: TextStyle(fontSize: 11)),
                        ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

class _ChannelBadge extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String tooltip;

  const _ChannelBadge({
    required this.icon,
    required this.color,
    required this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Container(
        padding: const EdgeInsets.all(5),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.12),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, size: 12, color: color),
      ),
    );
  }
}

extension _IterableFilter<E> on Iterable<E> {
  Iterable<E> filter(bool Function(E element) test) => where(test);
}
