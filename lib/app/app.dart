import 'package:flutter/material.dart';
import 'theme/theme.dart';
import 'theme/colors.dart';
import '../core/api/api_client.dart';
import '../core/responsive/responsive_layout.dart';
import '../core/widgets/duezy_app_bar.dart';
import '../core/widgets/duezy_sidebar.dart';
import '../shared/models/customer_model.dart';
import '../features/dashboard/screens/dashboard_screen.dart';
import '../features/customers/screens/customers_screen.dart';
import '../features/payments/screens/transactions_ledger_screen.dart';
import '../features/payments/screens/webhook_monitor_drawer.dart';
import '../features/subscription/screens/pricing_hub_screen.dart';
import '../features/admin/screens/admin_crm_screen.dart';
import '../features/invoices/screens/create_invoice_dialog.dart';
import '../features/payment_portal/screens/public_payment_portal_screen.dart';
import '../features/authentication/screens/login_screen.dart';

class DuezyApp extends StatefulWidget {
  const DuezyApp({super.key});

  @override
  State<DuezyApp> createState() => _DuezyAppState();
}

class _DuezyAppState extends State<DuezyApp> {
  int _selectedTabIndex = 0;
  String? _activePortalToken;
  bool _showLogin = false;
  final ApiClient _api = ApiClient();
  List<CustomerModel> _customers = [];
  List<dynamic> _webhookLogs = [];

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  void _loadInitialData() async {
    final custs = await _api.getCustomers();
    final logs = await _api.getWebhookLogs();
    if (mounted) {
      setState(() {
        _customers = custs;
        _webhookLogs = logs;
      });
    }
  }

  void _openCreateInvoice() {
    showDialog(
      context: context,
      builder: (_) => CreateInvoiceDialog(
        customers: _customers,
        onCreated: () {
          setState(() {});
        },
      ),
    );
  }

  void _openWebhooks() async {
    final logs = await _api.getWebhookLogs();
    setState(() => _webhookLogs = logs);
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (_) => WebhookMonitorDrawer(logs: _webhookLogs),
    );
  }

  void _resetScenario() async {
    await _api.resetRahulScenario();
    setState(() {});
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Rahul ₹25,000 scenario reset to initial unpaid state.'),
          backgroundColor: DuezyColors.info,
        ),
      );
    }
  }

  Widget _buildContent() {
    if (_activePortalToken != null) {
      return Stack(
        children: [
          PublicPaymentPortalScreen(token: _activePortalToken!),
          Positioned(
            top: 16,
            left: 16,
            child: ElevatedButton.icon(
              onPressed: () => setState(() => _activePortalToken = null),
              icon: const Icon(Icons.arrow_back, size: 14),
              label: const Text('Back to Dashboard'),
              style: ElevatedButton.styleFrom(
                backgroundColor: DuezyColors.bgSurfaceRaised,
                foregroundColor: DuezyColors.textPrimary,
              ),
            ),
          ),
        ],
      );
    }

    switch (_selectedTabIndex) {
      case 0:
      case 1:
        return DashboardScreen(
          onNavigateToPortal: (token) => setState(() => _activePortalToken = token),
        );
      case 2:
        return DashboardScreen(
          onNavigateToPortal: (token) => setState(() => _activePortalToken = token),
        );
      case 3:
        return const CustomersScreen();
      case 4:
        return const TransactionsLedgerScreen();
      case 5:
      case 6:
        return const PricingHubScreen();
      case 7:
        return const AdminCrmScreen();
      default:
        return DashboardScreen(
          onNavigateToPortal: (token) => setState(() => _activePortalToken = token),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = Responsive.isDesktop(context);

    if (_showLogin) {
      return MaterialApp(
        title: 'DUEZY - Get paid. Without the chase.',
        debugShowCheckedModeBanner: false,
        theme: DuezyTheme.darkTheme,
        home: LoginScreen(
          onLoginSuccess: () => setState(() => _showLogin = false),
          onOpenCustomerPortal: (token) => setState(() {
            _showLogin = false;
            _activePortalToken = token;
          }),
        ),
      );
    }

    return MaterialApp(
      title: 'DUEZY - Get paid. Without the chase.',
      debugShowCheckedModeBanner: false,
      theme: DuezyTheme.darkTheme,
      home: Scaffold(
        backgroundColor: DuezyColors.bgPage,
        appBar: _activePortalToken != null
            ? null
            : DuezyAppBar(
                onOpenCreateInvoice: _openCreateInvoice,
                onResetScenario: _resetScenario,
                onOpenWebhooks: _openWebhooks,
                onLogout: () => setState(() => _showLogin = true),
                unreadWebhooks: _webhookLogs.length,
              ),
        body: Row(
          children: [
            if (isDesktop && _activePortalToken == null)
              DuezySidebar(
                selectedIndex: _selectedTabIndex,
                onDestinationSelected: (idx) => setState(() => _selectedTabIndex = idx),
              ),
            Expanded(child: _buildContent()),
          ],
        ),
        bottomNavigationBar: (!isDesktop && _activePortalToken == null)
            ? BottomNavigationBar(
                currentIndex: _selectedTabIndex > 4 ? 0 : _selectedTabIndex,
                onTap: (idx) => setState(() => _selectedTabIndex = idx),
                backgroundColor: DuezyColors.bgSurface,
                selectedItemColor: DuezyColors.brand,
                unselectedItemColor: DuezyColors.textTertiary,
                type: BottomNavigationBarType.fixed,
                items: const [
                  BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Dashboard'),
                  BottomNavigationBarItem(icon: Icon(Icons.bolt), label: 'Rahul Flow'),
                  BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Invoices'),
                  BottomNavigationBarItem(icon: Icon(Icons.people), label: 'Customers'),
                  BottomNavigationBarItem(icon: Icon(Icons.account_balance_wallet), label: 'Ledger'),
                ],
              )
            : null,
      ),
    );
  }
}
