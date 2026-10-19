class DashboardMetricsModel {
  final int totalOutstandingPaise;
  final double totalOutstandingRupees;
  final int totalRecoveredPaise;
  final double totalRecoveredRupees;
  final double totalInvoicedRupees;
  final int recoveryRatePct;
  final int unpaidInvoicesCount;
  final int partiallyPaidInvoicesCount;
  final int overdueInvoicesCount;
  final int paidInvoicesCount;
  final int activeAiRemindersCount;
  final List<dynamic> recentTransactions;
  final int pendingClaimsCount;

  DashboardMetricsModel({
    required this.totalOutstandingPaise,
    required this.totalOutstandingRupees,
    required this.totalRecoveredPaise,
    required this.totalRecoveredRupees,
    required this.totalInvoicedRupees,
    required this.recoveryRatePct,
    required this.unpaidInvoicesCount,
    required this.partiallyPaidInvoicesCount,
    required this.overdueInvoicesCount,
    required this.paidInvoicesCount,
    required this.activeAiRemindersCount,
    required this.recentTransactions,
    required this.pendingClaimsCount,
  });

  factory DashboardMetricsModel.fromJson(Map<String, dynamic> json) {
    return DashboardMetricsModel(
      totalOutstandingPaise: json['total_outstanding_paise'] ?? 0,
      totalOutstandingRupees: (json['total_outstanding_rupees'] ?? 0.0).toDouble(),
      totalRecoveredPaise: json['total_recovered_paise'] ?? 0,
      totalRecoveredRupees: (json['total_recovered_rupees'] ?? 0.0).toDouble(),
      totalInvoicedRupees: (json['total_invoiced_rupees'] ?? 0.0).toDouble(),
      recoveryRatePct: json['recovery_rate_pct'] ?? 100,
      unpaidInvoicesCount: json['unpaid_invoices_count'] ?? 0,
      partiallyPaidInvoicesCount: json['partially_paid_invoices_count'] ?? 0,
      overdueInvoicesCount: json['overdue_invoices_count'] ?? 0,
      paidInvoicesCount: json['paid_invoices_count'] ?? 0,
      activeAiRemindersCount: json['active_ai_reminders_count'] ?? 0,
      recentTransactions: json['recent_transactions'] ?? [],
      pendingClaimsCount: json['pending_claims_count'] ?? 0,
    );
  }
}
