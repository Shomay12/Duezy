import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/api/api_client.dart';
import '../../../shared/models/customer_model.dart';

class CreateInvoiceDialog extends StatefulWidget {
  final List<CustomerModel> customers;
  final VoidCallback onCreated;

  const CreateInvoiceDialog({
    super.key,
    required this.customers,
    required this.onCreated,
  });

  @override
  State<CreateInvoiceDialog> createState() => _CreateInvoiceDialogState();
}

class _CreateInvoiceDialogState extends State<CreateInvoiceDialog> {
  final ApiClient _api = ApiClient();
  final _formKey = GlobalKey<FormState>();

  String? _selectedCustomerId;
  final _invoiceNumController = TextEditingController();
  final _descController = TextEditingController();
  final _amountController = TextEditingController();
  final _dueDateController = TextEditingController(text: '2026-08-15');
  bool _permittedPartial = true;
  static const double _minPartialPct = 20;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    if (widget.customers.isNotEmpty) {
      _selectedCustomerId = widget.customers.first.id;
    }
    _invoiceNumController.text = 'DZ-2026-${(100 + DateTime.now().millisecond)}';
  }

  void _submit() async {
    if (!_formKey.currentState!.validate() || _selectedCustomerId == null) return;
    setState(() => _isSubmitting = true);

    final amount = double.tryParse(_amountController.text) ?? 10000;
    final payload = {
      'customer_id': _selectedCustomerId,
      'invoice_number': _invoiceNumController.text.trim(),
      'description': _descController.text.trim(),
      'amount_rupees': amount,
      'due_date': _dueDateController.text.trim(),
      'grace_period_days': 3,
      'permitted_partial': _permittedPartial,
      'min_partial_pct': _minPartialPct.toInt(),
      'max_installments': 4,
      'reminder_strategy': 'smart_adaptive',
    };

    final result = await _api.createInvoice(payload);
    if (mounted) {
      setState(() => _isSubmitting = false);
      if (result != null) {
        widget.onCreated();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Invoice ${result.invoiceNumber} created and tracking activated!'),
            backgroundColor: DuezyColors.success,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: DuezyColors.bgSurfaceRaised,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 520,
        padding: const EdgeInsets.all(22),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Create New Payment Tracker & Invoice',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, size: 20, color: DuezyColors.textTertiary),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Customer Dropdown
              const Text('Select Debtor / Client', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: _selectedCustomerId,
                dropdownColor: DuezyColors.bgSurfaceRaised,
                items: widget.customers.map((c) {
                  return DropdownMenuItem(
                    value: c.id,
                    child: Text('${c.name} (${c.company})', style: const TextStyle(fontSize: 13)),
                  );
                }).toList(),
                onChanged: (val) => setState(() => _selectedCustomerId = val),
                decoration: const InputDecoration(contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12)),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Invoice Number', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _invoiceNumController,
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                          decoration: const InputDecoration(hintText: 'DZ-2026-945'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Amount (INR)', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
                        const SizedBox(height: 6),
                        TextFormField(
                          controller: _amountController,
                          keyboardType: TextInputType.number,
                          validator: (v) => v!.isEmpty ? 'Enter amount' : null,
                          decoration: const InputDecoration(hintText: '25000', prefixText: '₹ '),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              const Text('Description / Milestones', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                validator: (v) => v!.isEmpty ? 'Required' : null,
                decoration: const InputDecoration(hintText: 'e.g. Sprint 4 Deliverables & Backend API'),
              ),
              const SizedBox(height: 12),

              const Text('Due Date (YYYY-MM-DD)', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _dueDateController,
                validator: (v) => v!.isEmpty ? 'Required' : null,
                decoration: const InputDecoration(hintText: '2026-08-20'),
              ),
              const SizedBox(height: 14),

              // Permitted Partial Option
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Permit Partial Settlements', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                subtitle: Text('Allow customer to pay in installments (min ${_minPartialPct.toInt()}%)', style: const TextStyle(fontSize: 11, color: DuezyColors.textTertiary)),
                value: _permittedPartial,
                activeThumbColor: DuezyColors.brand,
                onChanged: (val) => setState(() => _permittedPartial = val),
              ),

              const SizedBox(height: 16),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: DuezyColors.brand,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: Text(
                  _isSubmitting ? 'Generating Payment Link...' : 'Create Invoice & Activate DUEZY Cadence',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
