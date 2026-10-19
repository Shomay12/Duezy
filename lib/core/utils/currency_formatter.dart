import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final NumberFormat _inrFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static final NumberFormat _inrWithDecimals = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  static String formatRupees(double amount, {bool showDecimals = false}) {
    if (showDecimals || amount % 1 != 0) {
      return _inrWithDecimals.format(amount);
    }
    return _inrFormat.format(amount);
  }

  static String formatPaise(int paise, {bool showDecimals = false}) {
    return formatRupees(paise / 100.0, showDecimals: showDecimals);
  }
}
