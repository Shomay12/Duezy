import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onLoginSuccess;
  final Function(String token)? onOpenCustomerPortal;

  const LoginScreen({
    super.key,
    required this.onLoginSuccess,
    this.onOpenCustomerPortal,
  });

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController(text: 'rahul@apexdynamics.in');
  final _passwordController = TextEditingController(text: '••••••••••••');
  String _selectedRole = 'BUSINESS_OWNER';
  bool _isLoading = false;

  void _handleLogin() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 600));
    if (mounted) {
      setState(() => _isLoading = false);
      widget.onLoginSuccess();
    }
  }

  void _quickLogin(String email, String role) {
    _emailController.text = email;
    setState(() => _selectedRole = role);
    _handleLogin();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: DuezyColors.bgPage,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 440),
            child: Container(
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: DuezyColors.bgSurface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: DuezyColors.borderDefault),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.3),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: DuezyColors.brand,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.bolt, color: Colors.black, size: 24),
                      ),
                      const SizedBox(width: 10),
                      const Text(
                        'DUEZY',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -0.5,
                          color: DuezyColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Get paid. Without the chase.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 12, color: DuezyColors.textTertiary, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 28),

                  // Role Selector
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: DuezyColors.bgInput,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: DuezyColors.borderDefault),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: _RoleTab(
                            label: 'Business',
                            selected: _selectedRole == 'BUSINESS_OWNER',
                            onTap: () => setState(() => _selectedRole = 'BUSINESS_OWNER'),
                          ),
                        ),
                        Expanded(
                          child: _RoleTab(
                            label: 'Team Member',
                            selected: _selectedRole == 'TEAM_MEMBER',
                            onTap: () => setState(() => _selectedRole = 'TEAM_MEMBER'),
                          ),
                        ),
                        Expanded(
                          child: _RoleTab(
                            label: 'Admin',
                            selected: _selectedRole == 'SUPER_ADMIN',
                            onTap: () => setState(() => _selectedRole = 'SUPER_ADMIN'),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Form Fields
                  const Text('Email Address', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.mail_outline, size: 18, color: DuezyColors.textTertiary),
                      hintText: 'name@company.com',
                    ),
                    style: const TextStyle(fontSize: 13),
                  ),

                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Password', style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary)),
                      TextButton(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Password reset instructions sent to your email.')),
                          );
                        },
                        style: TextButton.styleFrom(padding: EdgeInsets.zero),
                        child: const Text('Forgot?', style: TextStyle(fontSize: 11, color: DuezyColors.brand)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  TextField(
                    controller: _passwordController,
                    obscureText: true,
                    decoration: const InputDecoration(
                      prefixIcon: Icon(Icons.lock_outline, size: 18, color: DuezyColors.textTertiary),
                    ),
                    style: const TextStyle(fontSize: 13),
                  ),

                  const SizedBox(height: 24),

                  ElevatedButton(
                    onPressed: _isLoading ? null : _handleLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DuezyColors.brand,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: _isLoading
                        ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                        : const Text('Sign In to DUEZY', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                  ),

                  const SizedBox(height: 20),
                  const Divider(color: DuezyColors.borderDefault),
                  const SizedBox(height: 14),

                  const Text(
                    'QUICK DEMO ROLES',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: DuezyColors.textTertiary, letterSpacing: 0.8),
                  ),
                  const SizedBox(height: 10),

                  // Quick Demo Logins
                  OutlinedButton.icon(
                    onPressed: () => _quickLogin('rahul@apexdynamics.in', 'BUSINESS_OWNER'),
                    icon: const Icon(Icons.business, size: 14),
                    label: const Text('Rahul Sharma (Business Dashboard)', style: TextStyle(fontSize: 12)),
                  ),
                  const SizedBox(height: 8),

                  OutlinedButton.icon(
                    onPressed: () => _quickLogin('admin@duezy.com', 'SUPER_ADMIN'),
                    icon: const Icon(Icons.admin_panel_settings, size: 14, color: DuezyColors.info),
                    label: const Text('Super Admin (CRM & Flags)', style: TextStyle(fontSize: 12, color: DuezyColors.info)),
                  ),
                  const SizedBox(height: 8),

                  if (widget.onOpenCustomerPortal != null)
                    TextButton.icon(
                      onPressed: () => widget.onOpenCustomerPortal!('tok_rahul_942_secure_abc123'),
                      icon: const Icon(Icons.open_in_new, size: 14, color: DuezyColors.brand),
                      label: const Text('Open Customer Payment Portal directly', style: TextStyle(fontSize: 11, color: DuezyColors.brand)),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _RoleTab extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _RoleTab({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: selected ? DuezyColors.bgSurfaceRaised : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: selected ? FontWeight.bold : FontWeight.w500,
            color: selected ? DuezyColors.textPrimary : DuezyColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
