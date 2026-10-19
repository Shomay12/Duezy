import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';
import '../responsive/responsive_layout.dart';

class DuezyAppBar extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback onOpenCreateInvoice;
  final VoidCallback onResetScenario;
  final VoidCallback onOpenWebhooks;
  final VoidCallback? onLogout;
  final int unreadWebhooks;

  const DuezyAppBar({
    super.key,
    required this.onOpenCreateInvoice,
    required this.onResetScenario,
    required this.onOpenWebhooks,
    this.onLogout,
    this.unreadWebhooks = 2,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context) {
    final isMobile = Responsive.isMobile(context);

    return SafeArea(
      bottom: false,
      child: Container(
        height: 64,
        padding: EdgeInsets.symmetric(horizontal: isMobile ? 12 : 24),
        decoration: const BoxDecoration(
          color: DuezyColors.bgSurface,
          border: Border(bottom: BorderSide(color: DuezyColors.borderDefault)),
        ),
        child: Row(
        children: [
          // Brand Logo
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: DuezyColors.brand,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.bolt, color: Color(0xFF0A0E16), size: 20),
          ),
          const SizedBox(width: 10),
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'DUEZY',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: DuezyColors.textPrimary,
                  letterSpacing: -0.5,
                ),
              ),
              if (!isMobile)
                const Text(
                  'Get paid. Without the chase.',
                  style: TextStyle(
                    fontSize: 11,
                    color: DuezyColors.textTertiary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
            ],
          ),
          const Spacer(),

          // Actions
          if (!isMobile) ...[
            OutlinedButton.icon(
              onPressed: onResetScenario,
              icon: const Icon(Icons.refresh, size: 14),
              label: const Text('Reset Demo', style: TextStyle(fontSize: 12)),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
            ),
            const SizedBox(width: 10),
          ],

          IconButton(
            onPressed: onOpenWebhooks,
            tooltip: 'Razorpay Webhook Stream',
            icon: Stack(
              clipBehavior: Clip.none,
              children: [
                const Icon(Icons.terminal, color: DuezyColors.textSecondary, size: 20),
                if (unreadWebhooks > 0)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: DuezyColors.brand,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '$unreadWebhooks',
                        style: const TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF0A0E16),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          ElevatedButton.icon(
            onPressed: onOpenCreateInvoice,
            icon: const Icon(Icons.add, size: 16),
            label: Text(isMobile ? 'New' : 'Create Invoice'),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.symmetric(
                horizontal: isMobile ? 12 : 16,
                vertical: 10,
              ),
            ),
          ),

          const SizedBox(width: 12),

          // User Avatar (Interactive)
          Tooltip(
            message: 'Signed in as Rahul Sharma (Tap to switch account or sign out)',
            child: InkWell(
              onTap: onLogout,
              borderRadius: BorderRadius.circular(16),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: DuezyColors.brand.withValues(alpha: 0.2),
                child: const Text(
                  'RS',
                  style: TextStyle(
                    color: DuezyColors.brand,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
}
