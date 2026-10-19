import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/api/api_client.dart';
import '../../../core/responsive/responsive_layout.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../core/widgets/metric_card.dart';
import '../../../shared/models/invoice_model.dart';
import '../../../shared/models/metrics_model.dart';
import '../widgets/workflow_timeline_widget.dart';
import '../widgets/rahul_scenario_card.dart';
import '../widgets/payments_stream_table.dart';
import '../../payments/widgets/razorpay_qr_dialog.dart';
import '../../reminders/screens/ai_reminder_studio_screen.dart';
import '../../invoices/screens/invoice_detail_screen.dart';

class DashboardScreen extends StatefulWidget {
  final Function(String token)? onNavigateToPortal;

  const DashboardScreen({
    super.key,
    this.onNavigateToPortal,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final ApiClient _api = ApiClient();
  DashboardMetricsModel? _metrics;
  List<InvoiceModel> _invoices = [];
  bool _isLoading = true;
  int _activeStep = 1;

  @override
  void initState() {
    super.initState();
    _loadDashboardData();
  }

  void _loadDashboardData() async {
    setState(() => _isLoading = true);
    final metricsFuture = _api.getMetrics();
    final invoicesFuture = _api.getInvoices();

    final results = await Future.wait([metricsFuture, invoicesFuture]);

    if (mounted) {
      setState(() {
        _metrics = results[0] as DashboardMetricsModel;
        _invoices = results[1] as List<InvoiceModel>;
        _isLoading = false;

        final rahul = _invoices.cast<InvoiceModel?>().firstWhere(
              (i) => i?.id == 'inv_rahul_25k',
              orElse: () => null,
            );
        if (rahul != null && rahul.isPaid) {
          _activeStep = 12;
        }
      });
    }
  }

  InvoiceModel? get _rahulInvoice {
    return _invoices.cast<InvoiceModel?>().firstWhere(
          (i) => i?.id == 'inv_rahul_25k',
          orElse: () => _invoices.isNotEmpty ? _invoices.first : null,
        );
  }

  void _triggerRahulPayment() async {
    final rahul = _rahulInvoice;
    if (rahul == null) return;

    final success = await _api.simulatePayment(rahul.secureToken);
    if (success) {
      setState(() => _activeStep = 12);
      _loadDashboardData();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('₹25,000 captured via Razorpay Webhook! All future reminders stopped permanently.'),
            backgroundColor: DuezyColors.success,
          ),
        );
      }
    }
  }

  void _resetScenario() async {
    await _api.resetRahulScenario();
    setState(() => _activeStep = 1);
    _loadDashboardData();
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Rahul ₹25,000 scenario reset to initial unpaid state.'),
          backgroundColor: DuezyColors.info,
        ),
      );
    }
  }

  void _openQR(InvoiceModel invoice) {
    showDialog(
      context: context,
      builder: (_) => RazorpayQRDialog(
        invoice: invoice,
        onTriggerPay: () {
          _triggerRahulPayment();
        },
      ),
    );
  }

  void _openAI(InvoiceModel invoice) {
    showDialog(
      context: context,
      builder: (_) => AIReminderStudioDialog(invoice: invoice),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: DuezyColors.brand),
      );
    }

    final isMobile = Responsive.isMobile(context);
    final m = _metrics;

    return RefreshIndicator(
      onRefresh: () async => _loadDashboardData(),
      child: SingleChildScrollView(
        padding: EdgeInsets.all(isMobile ? 16 : 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Workflow Timeline
            WorkflowTimelineWidget(
              activeStep: _activeStep,
              onStepChanged: (step) => setState(() => _activeStep = step),
              onTriggerPayment: _triggerRahulPayment,
              isRahulPaid: _rahulInvoice?.isPaid ?? false,
            ),

            const SizedBox(height: 20),

            // 2. Featured Rahul Sandbox Hero Card
            RahulScenarioCard(
              invoice: _rahulInvoice,
              onOpenQR: () => _openQR(_rahulInvoice!),
              onOpenAIReminders: () => _openAI(_rahulInvoice!),
              onTriggerPay: _triggerRahulPayment,
              onReset: _resetScenario,
            ),

            const SizedBox(height: 20),

            // 3. Metrics Grid
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 900;
                return isWide
                    ? Row(
                        children: [
                          Expanded(
                            child: MetricCard(
                              title: 'Total Outstanding',
                              value: CurrencyFormatter.formatPaise(m?.totalOutstandingPaise ?? 0),
                              icon: Icons.access_time,
                              iconColor: DuezyColors.warning,
                              footerText: '${m?.unpaidInvoicesCount ?? 0} invoices awaiting settlement',
                              isPositive: false,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: MetricCard(
                              title: 'Recovered & Captured',
                              value: CurrencyFormatter.formatPaise(m?.totalRecoveredPaise ?? 0),
                              icon: Icons.check_circle,
                              iconColor: DuezyColors.success,
                              footerText: 'Settled via Razorpay Webhook',
                              isPositive: true,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: MetricCard(
                              title: 'Recovery Rate',
                              value: '${m?.recoveryRatePct ?? 0}%',
                              icon: Icons.trending_up,
                              iconColor: DuezyColors.info,
                              footerText: 'Avg recovery: 2.1 days (Industry: 14d)',
                              isPositive: true,
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: MetricCard(
                              title: 'Active AI Reminder Bots',
                              value: '${m?.activeAiRemindersCount ?? 0} Active',
                              icon: Icons.auto_awesome,
                              iconColor: DuezyColors.info,
                              footerText: 'WhatsApp, Email & SMS auto-queued',
                              isPositive: true,
                            ),
                          ),
                        ],
                      )
                    : Column(
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: MetricCard(
                                  title: 'Total Outstanding',
                                  value: CurrencyFormatter.formatPaise(m?.totalOutstandingPaise ?? 0),
                                  icon: Icons.access_time,
                                  iconColor: DuezyColors.warning,
                                  footerText: '${m?.unpaidInvoicesCount ?? 0} unpaid',
                                  isPositive: false,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: MetricCard(
                                  title: 'Recovered',
                                  value: CurrencyFormatter.formatPaise(m?.totalRecoveredPaise ?? 0),
                                  icon: Icons.check_circle,
                                  iconColor: DuezyColors.success,
                                  footerText: 'Verified Webhook',
                                  isPositive: true,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Expanded(
                                child: MetricCard(
                                  title: 'Recovery Rate',
                                  value: '${m?.recoveryRatePct ?? 0}%',
                                  icon: Icons.trending_up,
                                  iconColor: DuezyColors.info,
                                  footerText: '2.1d avg turnaround',
                                  isPositive: true,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: MetricCard(
                                  title: 'Active Bots',
                                  value: '${m?.activeAiRemindersCount ?? 0} Active',
                                  icon: Icons.auto_awesome,
                                  iconColor: DuezyColors.info,
                                  footerText: 'Multi-channel',
                                  isPositive: true,
                                ),
                              ),
                            ],
                          ),
                        ],
                      );
              },
            ),

            const SizedBox(height: 20),

            // 4. Payments Stream Table
            PaymentsStreamTable(
              invoices: _invoices,
              onOpenQR: _openQR,
              onOpenAI: _openAI,
              onSimulatePay: (inv) async {
                final messenger = ScaffoldMessenger.of(context);
                await _api.simulatePayment(inv.secureToken);
                _loadDashboardData();
                messenger.showSnackBar(
                  SnackBar(
                    content: Text('${CurrencyFormatter.formatPaise(inv.originalAmountPaise)} paid by ${inv.customerName}!'),
                    backgroundColor: DuezyColors.success,
                  ),
                );
              },
              onViewPortal: (inv) {
                if (widget.onNavigateToPortal != null) {
                  widget.onNavigateToPortal!(inv.secureToken);
                }
              },
              onViewDetail: (inv) {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => InvoiceDetailScreen(
                      invoice: inv,
                      onUpdated: _loadDashboardData,
                      onOpenPortal: widget.onNavigateToPortal,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
