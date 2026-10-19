import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';

class DuezySidebar extends StatelessWidget {
  final int selectedIndex;
  final ValueChanged<int> onDestinationSelected;

  const DuezySidebar({
    super.key,
    required this.selectedIndex,
    required this.onDestinationSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 220,
      decoration: const BoxDecoration(
        color: DuezyColors.bgSurface,
        border: Border(right: BorderSide(color: DuezyColors.borderDefault)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'OPERATIONS',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: DuezyColors.textTertiary,
                letterSpacing: 1.0,
              ),
            ),
          ),
          _NavItem(
            icon: Icons.dashboard_outlined,
            activeIcon: Icons.dashboard,
            label: 'Dashboard',
            selected: selectedIndex == 0,
            onTap: () => onDestinationSelected(0),
          ),
          _NavItem(
            icon: Icons.auto_awesome_outlined,
            activeIcon: Icons.auto_awesome,
            label: 'Rahul ₹25k Flow',
            selected: selectedIndex == 1,
            badgeColor: DuezyColors.info,
            onTap: () => onDestinationSelected(1),
          ),
          _NavItem(
            icon: Icons.receipt_long_outlined,
            activeIcon: Icons.receipt_long,
            label: 'Invoices',
            selected: selectedIndex == 2,
            onTap: () => onDestinationSelected(2),
          ),
          _NavItem(
            icon: Icons.people_outline,
            activeIcon: Icons.people,
            label: 'Customers',
            selected: selectedIndex == 3,
            onTap: () => onDestinationSelected(3),
          ),
          _NavItem(
            icon: Icons.account_balance_wallet_outlined,
            activeIcon: Icons.account_balance_wallet,
            label: 'Ledger & Audit',
            selected: selectedIndex == 4,
            onTap: () => onDestinationSelected(4),
          ),

          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Text(
              'PLATFORM & SAAS',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: DuezyColors.textTertiary,
                letterSpacing: 1.0,
              ),
            ),
          ),
          _NavItem(
            icon: Icons.sell_outlined,
            activeIcon: Icons.sell,
            label: 'Pricing & Plans',
            selected: selectedIndex == 5,
            onTap: () => onDestinationSelected(5),
          ),
          _NavItem(
            icon: Icons.credit_card_outlined,
            activeIcon: Icons.credit_card,
            label: 'Subscription Hub',
            selected: selectedIndex == 6,
            onTap: () => onDestinationSelected(6),
          ),
          _NavItem(
            icon: Icons.admin_panel_settings_outlined,
            activeIcon: Icons.admin_panel_settings,
            label: 'Admin CRM',
            selected: selectedIndex == 7,
            accentColor: DuezyColors.info,
            onTap: () => onDestinationSelected(7),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  final Color? badgeColor;
  final Color? accentColor;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
    required this.selected,
    required this.onTap,
    this.badgeColor,
    this.accentColor,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = accentColor ?? DuezyColors.brand;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: selected ? activeColor.withValues(alpha: 0.12) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            border: selected ? Border.all(color: activeColor.withValues(alpha: 0.3)) : null,
          ),
          child: Row(
            children: [
              Icon(
                selected ? activeIcon : icon,
                size: 18,
                color: selected ? activeColor : DuezyColors.textSecondary,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                    color: selected ? DuezyColors.textPrimary : DuezyColors.textSecondary,
                  ),
                ),
              ),
              if (badgeColor != null)
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: badgeColor,
                    shape: BoxShape.circle,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
