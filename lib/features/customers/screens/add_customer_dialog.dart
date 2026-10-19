import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';
import '../../../core/api/api_client.dart';

class AddCustomerDialog extends StatefulWidget {
  final VoidCallback onCreated;

  const AddCustomerDialog({
    super.key,
    required this.onCreated,
  });

  @override
  State<AddCustomerDialog> createState() => _AddCustomerDialogState();
}

class _AddCustomerDialogState extends State<AddCustomerDialog> {
  final ApiClient _api = ApiClient();
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _companyController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _gstController = TextEditingController();
  bool _isSubmitting = false;

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSubmitting = true);

    final payload = {
      'name': _nameController.text.trim(),
      'company': _companyController.text.trim(),
      'phone': _phoneController.text.trim(),
      'email': _emailController.text.trim(),
      'gst': _gstController.text.trim(),
    };

    final result = await _api.createCustomer(payload);
    if (mounted) {
      setState(() => _isSubmitting = false);
      if (result != null) {
        widget.onCreated();
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Customer ${result.name} added successfully!'),
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
        width: 480,
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
                    'Add New Debtor / Customer',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close, size: 20, color: DuezyColors.textTertiary),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              TextFormField(
                controller: _nameController,
                validator: (v) => v!.isEmpty ? 'Required' : null,
                decoration: const InputDecoration(labelText: 'Contact Name', hintText: 'Aman Verma'),
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _companyController,
                validator: (v) => v!.isEmpty ? 'Required' : null,
                decoration: const InputDecoration(labelText: 'Company / Business Entity', hintText: 'Verma Logistics Pvt Ltd'),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _phoneController,
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                      decoration: const InputDecoration(labelText: 'Phone (WhatsApp)', hintText: '+91 98765 11223'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: TextFormField(
                      controller: _emailController,
                      validator: (v) => v!.isEmpty ? 'Required' : null,
                      decoration: const InputDecoration(labelText: 'Email', hintText: 'aman@verma.com'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              TextFormField(
                controller: _gstController,
                decoration: const InputDecoration(labelText: 'GSTIN (Optional)', hintText: '27AADCA1234F1Z8'),
              ),
              const SizedBox(height: 18),

              ElevatedButton(
                onPressed: _isSubmitting ? null : _submit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: DuezyColors.brand,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                child: Text(
                  _isSubmitting ? 'Saving...' : 'Add Customer to DUEZY',
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
