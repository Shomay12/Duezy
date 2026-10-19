class CustomerModel {
  final String id;
  final String businessId;
  final String name;
  final String company;
  final String phone;
  final String email;
  final String? gst;
  final int totalBilledPaise;
  final int outstandingPaise;
  final String status;

  CustomerModel({
    required this.id,
    required this.businessId,
    required this.name,
    required this.company,
    required this.phone,
    required this.email,
    this.gst,
    required this.totalBilledPaise,
    required this.outstandingPaise,
    required this.status,
  });

  double get totalBilledRupees => totalBilledPaise / 100.0;
  double get outstandingRupees => outstandingPaise / 100.0;

  factory CustomerModel.fromJson(Map<String, dynamic> json) {
    return CustomerModel(
      id: json['id'] ?? '',
      businessId: json['business_id'] ?? '',
      name: json['name'] ?? '',
      company: json['company'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'] ?? '',
      gst: json['gst'],
      totalBilledPaise: json['total_billed_paise'] ?? 0,
      outstandingPaise: json['outstanding_paise'] ?? 0,
      status: json['status'] ?? 'ACTIVE',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'business_id': businessId,
      'name': name,
      'company': company,
      'phone': phone,
      'email': email,
      'gst': gst,
      'total_billed_paise': totalBilledPaise,
      'outstanding_paise': outstandingPaise,
      'status': status,
    };
  }
}
