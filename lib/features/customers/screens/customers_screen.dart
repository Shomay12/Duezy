import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/api/api_client.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../shared/models/customer_model.dart';
import 'add_customer_dialog.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  final ApiClient _api = ApiClient();
  List<CustomerModel> _customers = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  void _loadCustomers() async {
    setState(() => _isLoading = true);
    final list = await _api.getCustomers();
    if (mounted) {
      setState(() {
        _customers = list;
        _isLoading = false;
      });
    }
  }

  void _openAddCustomer() {
    showDialog(
      context: context,
      builder: (_) => AddCustomerDialog(onCreated: _loadCustomers),
    );
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: DuezyColors.brand.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.people, color: DuezyColors.brand, size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Debtor & Customer Directory',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                      ),
                      Text(
                        'Manage client accounts, contact channels, and aggregate outstanding receivables.',
                        style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary),
                      ),
                    ],
                  ),
                ],
              ),
              ElevatedButton.icon(
                onPressed: _openAddCustomer,
                icon: const Icon(Icons.person_add, size: 16),
                label: const Text('Add Customer'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Customers List Table
          Container(
            decoration: BoxDecoration(
              color: DuezyColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: DuezyColors.borderDefault),
            ),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: _customers.length,
              separatorBuilder: (_, _) => const Divider(height: 1, color: DuezyColors.borderDefault),
              itemBuilder: (context, index) {
                final c = _customers[index];
                final hasOutstanding = c.outstandingPaise > 0;

                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                  child: Row(
                    children: [
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: DuezyColors.brand.withValues(alpha: 0.15),
                        child: Text(
                          c.name.length >= 2 ? c.name.substring(0, 2).toUpperCase() : 'CU',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: DuezyColors.brand, fontSize: 13),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        flex: 3,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              c.name,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: DuezyColors.textPrimary),
                            ),
                            Text(
                              '${c.company} • ${c.phone}',
                              style: const TextStyle(fontSize: 12, color: DuezyColors.textTertiary),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        flex: 2,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Outstanding: ${CurrencyFormatter.formatPaise(c.outstandingPaise)}',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: hasOutstanding ? DuezyColors.danger : DuezyColors.success,
                              ),
                            ),
                            Text(
                              'Total Billed: ${CurrencyFormatter.formatPaise(c.totalBilledPaise)}',
                              style: const TextStyle(fontSize: 11, color: DuezyColors.textTertiary),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: hasOutstanding ? DuezyColors.dangerSubtle : DuezyColors.successSubtle,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: hasOutstanding ? DuezyColors.danger.withValues(alpha: 0.3) : DuezyColors.success.withValues(alpha: 0.3),
                          ),
                        ),
                        child: Text(
                          c.status,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: hasOutstanding ? DuezyColors.danger : DuezyColors.success,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
