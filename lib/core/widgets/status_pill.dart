import 'package:flutter/material.dart';
import '../../app/theme/colors.dart';

class StatusPill extends StatelessWidget {
  final String status;
  final String? subtitle;

  const StatusPill({
    super.key,
    required this.status,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    IconData icon;
    String label;

    switch (status.toUpperCase()) {
      case 'PAID':
        bg = DuezyColors.successSubtle;
        fg = DuezyColors.success;
        icon = Icons.check_circle_outline;
        label = 'PAID ✓';
        break;
      case 'OVERDUE':
        bg = DuezyColors.dangerSubtle;
        fg = DuezyColors.danger;
        icon = Icons.access_time;
        label = 'OVERDUE';
        break;
      case 'PARTIALLY_PAID':
        bg = DuezyColors.warningSubtle;
        fg = DuezyColors.warning;
        icon = Icons.hourglass_bottom;
        label = 'PARTIAL';
        break;
      case 'DISPUTED':
        bg = DuezyColors.dangerSubtle;
        fg = DuezyColors.danger;
        icon = Icons.shield_outlined;
        label = 'DISPUTED';
        break;
      case 'SENT':
      case 'PENDING':
      default:
        bg = DuezyColors.infoSubtle;
        fg = DuezyColors.info;
        icon = Icons.schedule;
        label = 'TRACKING';
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: fg.withValues(alpha: 0.3)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 12, color: fg),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  color: fg,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ),
        if (subtitle != null) ...[
          const SizedBox(height: 3),
          Text(
            subtitle!,
            style: const TextStyle(
              fontSize: 10,
              color: DuezyColors.textTertiary,
            ),
          ),
        ],
      ],
    );
  }
}
