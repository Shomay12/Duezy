import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';

class AdminCrmScreen extends StatelessWidget {
  const AdminCrmScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: DuezyColors.info.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.admin_panel_settings, color: DuezyColors.info, size: 20),
              ),
              const SizedBox(width: 10),
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'DUEZY Admin CRM & SaaS Control Center',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
                  ),
                  Text(
                    'Real-time SaaS recurring revenue, feature gating, and system audit logs.',
                    style: TextStyle(fontSize: 12, color: DuezyColors.textSecondary),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),

          // SaaS Revenue Metrics Grid
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: [
              _SaaSStatCard(
                title: 'Monthly Recurring (MRR)',
                value: '₹3,84,499',
                icon: Icons.currency_rupee,
                iconColor: DuezyColors.success,
                footer: '+14.2% MoM growth',
              ),
              _SaaSStatCard(
                title: 'Annualized Run Rate (ARR)',
                value: '₹46,13,988',
                icon: Icons.trending_up,
                iconColor: DuezyColors.info,
                footer: 'Target: ₹50,00,000',
              ),
              _SaaSStatCard(
                title: 'Active Paid Subscribers',
                value: '641',
                icon: Icons.credit_card,
                iconColor: DuezyColors.info,
                footer: 'ARPU: ₹599 / sub',
              ),
              _SaaSStatCard(
                title: 'Total Tracked Payments',
                value: '1,245',
                icon: Icons.receipt_long,
                iconColor: DuezyColors.warning,
                footer: '₹1.84 Cr volume tracked',
              ),
            ],
          ),

          const SizedBox(height: 28),

          // Feature Flags & Entitlement Controls
          const Text(
            'Global Feature Flags & Tier Capabilities',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: DuezyColors.textPrimary),
          ),
          const SizedBox(height: 12),

          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: DuezyColors.bgSurface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: DuezyColors.borderDefault),
            ),
            child: Column(
              children: const [
                _FeatureFlagRow(
                  title: 'AI Conversational Assistant & Tone Progression',
                  description: 'Enables autonomous AI reminder copywriting and negotiation chat',
                  status: 'PRO & BUSINESS ONLY',
                ),
                Divider(color: DuezyColors.borderDefault),
                _FeatureFlagRow(
                  title: 'WhatsApp Business API Delivery',
                  description: 'Direct WhatsApp message dispatch with verified green badge',
                  status: 'PRO & BUSINESS ONLY',
                ),
                Divider(color: DuezyColors.borderDefault),
                _FeatureFlagRow(
                  title: 'Dynamic BharatQR & UPI Generation',
                  description: 'Real-time scannable QR generation on customer payment portal',
                  status: 'ALL TIERS (ENABLED)',
                ),
                Divider(color: DuezyColors.borderDefault),
                _FeatureFlagRow(
                  title: 'Automated Voice Call Reminders',
                  description: 'IVR phone reminders for overdue enterprise invoices',
                  status: 'BUSINESS ONLY',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SaaSStatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color iconColor;
  final String footer;

  const _SaaSStatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.iconColor,
    required this.footer,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: DuezyColors.bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: DuezyColors.borderDefault),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(fontSize: 11, color: DuezyColors.textSecondary, fontWeight: FontWeight.w500),
                ),
              ),
              Icon(icon, size: 16, color: iconColor),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: DuezyColors.textPrimary),
          ),
          const SizedBox(height: 6),
          Text(
            footer,
            style: const TextStyle(fontSize: 10, color: DuezyColors.success, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _FeatureFlagRow extends StatelessWidget {
  final String title;
  final String description;
  final String status;

  const _FeatureFlagRow({
    required this.title,
    required this.description,
    required this.status,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: DuezyColors.textPrimary),
                ),
                Text(
                  description,
                  style: const TextStyle(fontSize: 11, color: DuezyColors.textTertiary),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: DuezyColors.infoSubtle,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: DuezyColors.info.withValues(alpha: 0.3)),
            ),
            child: Text(
              status,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: DuezyColors.info),
            ),
          ),
        ],
      ),
    );
  }
}
