import 'dart:async';
import 'package:flutter/material.dart';
import '../../../app/theme/colors.dart';

class WorkflowStep {
  final int id;
  final String title;
  final String desc;
  final String icon;
  final String group;

  const WorkflowStep({
    required this.id,
    required this.title,
    required this.desc,
    required this.icon,
    required this.group,
  });
}

class WorkflowTimelineWidget extends StatefulWidget {
  final int activeStep;
  final ValueChanged<int> onStepChanged;
  final VoidCallback onTriggerPayment;
  final bool isRahulPaid;

  const WorkflowTimelineWidget({
    super.key,
    required this.activeStep,
    required this.onStepChanged,
    required this.onTriggerPayment,
    required this.isRahulPaid,
  });

  @override
  State<WorkflowTimelineWidget> createState() => _WorkflowTimelineWidgetState();
}

class _WorkflowTimelineWidgetState extends State<WorkflowTimelineWidget> {
  bool _isPlaying = false;
  Timer? _timer;

  static const List<WorkflowStep> steps = [
    WorkflowStep(id: 1, title: 'Dashboard', desc: 'Central hub for cashflow', icon: '📊', group: 'Setup'),
    WorkflowStep(id: 2, title: 'Create Payment', desc: 'Add client & invoice details', icon: '📝', group: 'Setup'),
    WorkflowStep(id: 3, title: 'Rahul — ₹25,000', desc: 'Set amount & due date', icon: '👤', group: 'Setup'),
    WorkflowStep(id: 4, title: 'Razorpay Link & QR', desc: 'Instant UPI & gateway link', icon: '💳', group: 'Generation'),
    WorkflowStep(id: 5, title: 'Share with Rahul', desc: 'Sent via WhatsApp & Email', icon: '📤', group: 'Outreach'),
    WorkflowStep(id: 6, title: 'Remains Unpaid', desc: 'Client delayed payment', icon: '⏳', group: 'Tracking'),
    WorkflowStep(id: 7, title: 'Tracks Due Date', desc: 'Smart cron monitors timeline', icon: '📅', group: 'Tracking'),
    WorkflowStep(id: 8, title: 'AI Generates Reminders', desc: 'Context & tone progression', icon: '🤖', group: 'AI Engine'),
    WorkflowStep(id: 9, title: 'WhatsApp / Email / SMS', desc: 'Multi-channel auto dispatch', icon: '📱', group: 'AI Engine'),
    WorkflowStep(id: 10, title: 'Rahul Pays via Razorpay', desc: 'Scans QR or clicks UPI link', icon: '💰', group: 'Settlement'),
    WorkflowStep(id: 11, title: 'Razorpay Webhook', desc: 'payment.captured event verified', icon: '⚡', group: 'Verification'),
    WorkflowStep(id: 12, title: '₹25,000 → PAID ✓', desc: 'ALL FUTURE REMINDERS STOP', icon: '🎉', group: 'Complete'),
  ];

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _togglePlay() {
    if (_isPlaying) {
      _timer?.cancel();
      setState(() => _isPlaying = false);
    } else {
      setState(() => _isPlaying = true);
      _timer = Timer.periodic(const Duration(milliseconds: 1400), (timer) {
        if (widget.activeStep >= 12) {
          timer.cancel();
          setState(() => _isPlaying = false);
          return;
        }
        final next = widget.activeStep + 1;
        widget.onStepChanged(next);
        if (next == 10 && !widget.isRahulPaid) {
          widget.onTriggerPayment();
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: DuezyColors.bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: DuezyColors.borderDefault),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            runSpacing: 10,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: DuezyColors.brandSubtle,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.bolt, color: DuezyColors.brand, size: 18),
                  ),
                  const SizedBox(width: 8),
                  const Flexible(
                    child: Text(
                      '12-Step Autonomous Workflow',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: DuezyColors.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton.icon(
                    onPressed: _togglePlay,
                    icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow, size: 16),
                    label: Text(_isPlaying ? 'Pause' : 'Play Flow (Demo)'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: DuezyColors.brand,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                  ),
                  const SizedBox(width: 8),
                  OutlinedButton(
                    onPressed: () {
                      _timer?.cancel();
                      setState(() => _isPlaying = false);
                      widget.onStepChanged(1);
                    },
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    child: const Text('Reset'),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Scrollable horizontal steps
          SizedBox(
            height: 90,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: steps.length,
              separatorBuilder: (_, _) => Container(
                width: 16,
                alignment: Alignment.center,
                child: const Icon(Icons.arrow_forward_ios, size: 10, color: DuezyColors.textTertiary),
              ),
              itemBuilder: (context, index) {
                final s = steps[index];
                final isActive = widget.activeStep == s.id;
                final isCompleted = widget.activeStep > s.id;

                Color borderColor = DuezyColors.borderDefault;
                Color bgColor = DuezyColors.bgInput;
                if (isActive) {
                  borderColor = DuezyColors.brand;
                  bgColor = DuezyColors.brand.withValues(alpha: 0.15);
                } else if (isCompleted) {
                  borderColor = DuezyColors.success.withValues(alpha: 0.5);
                }

                return InkWell(
                  onTap: () => widget.onStepChanged(s.id),
                  borderRadius: BorderRadius.circular(10),
                  child: Container(
                    width: 170,
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: borderColor, width: isActive ? 1.5 : 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Row(
                          children: [
                            Text(s.icon, style: const TextStyle(fontSize: 14)),
                            const SizedBox(width: 6),
                            Text(
                              'Step ${s.id}',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: isActive ? DuezyColors.brand : DuezyColors.textTertiary,
                              ),
                            ),
                            const Spacer(),
                            if (isCompleted)
                              const Icon(Icons.check_circle, size: 12, color: DuezyColors.success)
                            else if (isActive)
                              Container(
                                width: 6,
                                height: 6,
                                decoration: const BoxDecoration(
                                  color: DuezyColors.brand,
                                  shape: BoxShape.circle,
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          s.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isActive ? DuezyColors.textPrimary : DuezyColors.textSecondary,
                          ),
                        ),
                        Text(
                          s.desc,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 10,
                            color: DuezyColors.textTertiary,
                          ),
                        ),
                      ],
                    ),
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
