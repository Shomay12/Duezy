import 'package:flutter/foundation.dart';

/// DUEZY Global Configuration Constants
class AppConstants {
  static const String appName = 'DUEZY';
  static const String appTagline = 'Get paid. Without the chase.';

  /// Base API URL. Can be overridden via --dart-define=API_URL=https://...
  /// Dynamically detects Android emulator (which routes to host via 10.0.2.2)
  static String get apiBaseUrl {
    const fromEnv = String.fromEnvironment('API_URL');
    if (fromEnv.isNotEmpty) return fromEnv;

    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000';
    }

    return 'http://localhost:8000';
  }

  static const String razorpayUpiVpa = 'duezy.collect@icici';
  static const String supportEmail = 'support@duezy.com';
}

