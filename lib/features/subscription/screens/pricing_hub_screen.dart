import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';

class PricingHubScreen extends StatefulWidget {
  const PricingHubScreen({super.key});

  @override
  State<PricingHubScreen> createState() => _PricingHubScreenState();
}

class _PricingHubScreenState extends State<PricingHubScreen> {
  String _billingPeriod = 'MONTHLY'; // MONTHLY, SIX_MONTHS, YEARLY

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1080),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Badge
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: DuezyColors.brand.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: DuezyColors.brand.withValues(alpha: 0.3)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.auto_awesome, color: DuezyColors.brand, size: 14),
                    SizedBox(width: 6),
                    Text(
                      'Predictable, ROI-Positive Pricing',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: DuezyColors.brand),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              const Text(
                'Simple pricing. More money. Less chasing.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: DuezyColors.textPrimary),
              ),
              const SizedBox(height: 6),
              const Text(
                'Recover overdue accounts in 2.1 days instead of 14 with autonomous AI reminders.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: DuezyColors.textSecondary),
              ),

              const SizedBox(height: 24),

              // Billing Period Switcher
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: DuezyColors.bgSurfaceRaised,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: DuezyColors.borderDefault),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _PeriodPill(
                      label: 'Monthly',
                      selected: _billingPeriod == 'MONTHLY',
                      onTap: () => setState(() => _billingPeriod = 'MONTHLY'),
                    ),
                    _PeriodPill(
                      label: '6 Months (16% Off)',
                      selected: _billingPeriod == 'SIX_MONTHS',
                      onTap: () => setState(() => _billingPeriod = 'SIX_MONTHS'),
                    ),
                    _PeriodPill(
                      label: 'Yearly (25% Off)',
                      selected: _billingPeriod == 'YEARLY',
                      onTap: () => setState(() => _billingPeriod = 'YEARLY'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Plans Grid
              LayoutBuilder(
                builder: (context, constraints) {
                  final isWide = constraints.maxWidth >= 780;
                  return isWide
                      ? Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(child: _buildFreePlan()),
                            const SizedBox(width: 16),
                            Expanded(child: _buildProPlan()),
                            const SizedBox(width: 16),
                            Expanded(child: _buildBusinessPlan()),
                          ],
                        )
                      : Column(
                          children: [
                            _buildFreePlan(),
                            const SizedBox(height: 16),
                            _buildProPlan(),
                            const SizedBox(height: 16),
                            _buildBusinessPlan(),
                          ],
                        );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFreePlan() {
    return _PlanCard(
      title: 'FREE',
      badge: 'Free Forever',
      price: '₹0',
      periodLabel: 'forever',
      description: 'For individuals and freelancers trying DUEZY payment tracking.',
      features: const [
        '5 active payment trackers',
        '10 debtor customers',
        'Basic payment tracking',
        'Manual payment status',
        'Standard dashboard',
      ],
      isHighlight: false,
      ctaLabel: 'Current Plan',
      onTap: () {},
    );
  }

  Widget _buildProPlan() {
    String price = '₹499';
    String period = '/ month';
    if (_billingPeriod == 'SIX_MONTHS') {
      price = '₹2,499';
      period = '/ 6 months';
    } else if (_billingPeriod == 'YEARLY') {
      price = '₹4,499';
      period = '/ year';
    }

    return _PlanCard(
      title: 'PRO',
      badge: 'Most Popular',
      price: price,
      periodLabel: period,
      description: 'For professional freelancers and independent consultants.',
      features: const [
        '100 active payment trackers',
        'Unlimited customers',
        'Instant Razorpay payment links & QR',
        'Automated WhatsApp, Email & SMS',
        'AI tone progression & copywriter',
        'Real-time webhook sync',
      ],
      isHighlight: true,
      ctaLabel: 'Upgrade to PRO',
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Upgraded to PRO plan successfully!'), backgroundColor: DuezyColors.brand),
        );
      },
    );
  }

  Widget _buildBusinessPlan() {
    String price = '₹1,499';
    String period = '/ month';
    if (_billingPeriod == 'SIX_MONTHS') {
      price = '₹7,499';
      period = '/ 6 months';
    } else if (_billingPeriod == 'YEARLY') {
      price = '₹13,499';
      period = '/ year';
    }

    return _PlanCard(
      title: 'BUSINESS',
      badge: 'For Agencies',
      price: price,
      periodLabel: period,
      description: 'For agencies, studios, and high-volume B2B teams.',
      features: const [
        'Unlimited active payment trackers',
        'Unlimited customers',
        'Everything in Pro included',
        'Up to 5 Team members',
        'Automated voice reminders',
        'Priority API & Webhook dispatch',
      ],
      isHighlight: false,
      ctaLabel: 'Upgrade to Business',
      onTap: () {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Upgraded to Business plan successfully!'), backgroundColor: DuezyColors.brand),
        );
      },
    );
  }
}

class _PeriodPill extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _PeriodPill({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? DuezyColors.brand : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: selected ? Colors.black : DuezyColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  final String title;
  final String badge;
  final String price;
  final String periodLabel;
  final String description;
  final List<String> features;
  final bool isHighlight;
  final String ctaLabel;
  final VoidCallback onTap;

  const _PlanCard({
    required this.title,
    required this.badge,
    required this.price,
    required this.periodLabel,
    required this.description,
    required this.features,
    required this.isHighlight,
    required this.ctaLabel,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: DuezyColors.bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isHighlight ? DuezyColors.brand : DuezyColors.borderDefault,
          width: isHighlight ? 2 : 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: DuezyColors.textPrimary),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isHighlight ? DuezyColors.brand.withValues(alpha: 0.15) : DuezyColors.bgInput,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: isHighlight ? DuezyColors.brand : DuezyColors.borderDefault),
                ),
                child: Text(
                  badge,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isHighlight ? DuezyColors.brand : DuezyColors.textSecondary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                price,
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: DuezyColors.textPrimary),
              ),
              const SizedBox(width: 4),
              Text(
                periodLabel,
                style: const TextStyle(fontSize: 12, color: DuezyColors.textTertiary),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            description,
            style: const TextStyle(fontSize: 12, color: DuezyColors.textSecondary, height: 1.4),
          ),
          const SizedBox(height: 18),
          const Divider(color: DuezyColors.borderDefault),
          const SizedBox(height: 14),

          ...features.map(
            (f) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  const Icon(Icons.check, size: 14, color: DuezyColors.success),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      f,
                      style: const TextStyle(fontSize: 12, color: DuezyColors.textSecondary),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 20),

          ElevatedButton(
            onPressed: onTap,
            style: ElevatedButton.styleFrom(
              backgroundColor: isHighlight ? DuezyColors.brand : DuezyColors.bgSurfaceRaised,
              foregroundColor: isHighlight ? Colors.black : DuezyColors.textPrimary,
              padding: const EdgeInsets.symmetric(vertical: 12),
            ),
            child: Text(ctaLabel, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          ),
        ],
      ),
    );
  }
}
