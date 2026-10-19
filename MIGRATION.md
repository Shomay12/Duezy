# DUEZY Project Migration Documentation: React to Flutter + FastAPI

## 1. Summary of Original Project Architecture
* **Original Frontend**: React 19 + Vite 8 SPA styled with modular vanilla CSS.
* **Original State & Database**: Browser LocalStorage (`dbStore.js`, `storage.js`).
* **Original Backend**: None existed server-side; all logic was client-side mock fixtures.
* **Preservation**: The complete original React codebase has been preserved in `legacy_react/` for reference and verification.

---

## 2. Summary of the Flutter Migration
* **Frontend**: Single unified Flutter/Dart codebase (`lib/`) targeting **iOS**, **Android**, and **Web**.
* **Design System**: DUEZY Custom Material 3 theme (`DuezyColors`, `DuezyTheme`) featuring dark surfaces (`#0A0E16`, `#111827`, `#1A2232`), brand emerald (`#10B981`), and clear typography.
* **Layouts**: Adaptive and responsive across desktop widescreen, tablets, and phones (`ResponsiveLayout`).
* **Backend**: Production-ready Python 3 FastAPI engine (`backend/`) running authoritative financial calculations, double-entry ledger, deterministic late fees, HMAC-SHA256 Razorpay webhook verification, and natural language conversational payment assistant.

---

## 3. Project Structure
```text
DUEZY/
├── backend/                              # Authoritative Financial Backend (FastAPI)
│   ├── main.py                           # API routes, CORS, auth, portal endpoints
│   ├── models.py                         # Pydantic schemas (integer paise subunits)
│   ├── database.py                       # Thread-safe data store & initial fixtures
│   ├── ledger.py                         # Authoritative financial ledger engine
│   ├── assistant.py                      # Conversational payment assistant
│   ├── late_fee.py                       # Deterministic late-fee calculation engine
│   ├── webhooks.py                       # Razorpay HMAC-SHA256 webhook handler
│   ├── requirements.txt                  # Python dependencies
│   └── test_backend.py                   # Automated test suite (9 tests passing)
├── lib/                                  # Flutter Multi-Platform Application
│   ├── main.dart                         # Entrypoint
│   ├── app/
│   │   ├── app.dart                      # Root application shell & adaptive chrome
│   │   ├── config/constants.dart         # API Base URL & brand constants
│   │   └── theme/                        # DuezyColors & DuezyTheme (Material 3)
│   ├── core/
│   │   ├── api/api_client.dart           # HTTP client with offline-resilient fallback
│   │   ├── responsive/responsive_layout.dart # Breakpoints & layout builder
│   │   ├── utils/currency_formatter.dart # Indian numbering system (paise to INR)
│   │   └── widgets/                      # MetricCard, StatusPill, DuezyAppBar, Sidebar
│   ├── features/
│   │   ├── dashboard/                    # Dashboard, 12-Step Timeline, Rahul Card, Table
│   │   ├── customers/                    # Debtor directory & AddCustomer dialog
│   │   ├── invoices/                     # Invoice creation & terms management
│   │   ├── payments/                     # Ledger view & Webhook monitor drawer
│   │   ├── payment_portal/               # Public payment portal & AI assistant
│   │   ├── reminders/                    # AI Reminder Studio (WhatsApp/Email/SMS)
│   │   ├── subscription/                 # Pricing & Billing Hub (Free, Pro, Business)
│   │   └── admin/                        # SaaS CRM, MRR/ARR metrics & feature flags
│   └── shared/models/                    # Strongly-typed Dart data models
├── test/
│   ├── unit_test.dart                    # Unit tests for currency & data models
│   └── widget_test.dart                  # Flutter widget smoke tests
├── android/                              # Android platform configuration (Kotlin)
├── ios/                                  # iOS platform configuration (Xcode / Swift)
├── web/                                  # Web platform configuration (HTML5 / CanvasKit)
└── legacy_react/                         # Original React 19 Vite application (Preserved)
```

---

## 4. Features Migrated & Implemented
1. **Authentication & Session Management**: Role-based access (`BUSINESS_OWNER`, `TEAM_MEMBER`, `CUSTOMER`, `SUPER_ADMIN`).
2. **Business Dashboard**: Real-time metrics for Total Outstanding, Recovered Principal, Recovery Rate, Active AI Reminder Bots, and Debtor Payment Streams.
3. **Rahul ₹25,000 Live Scenario**: 12-step interactive collection timeline with 1-click simulation triggers.
4. **Customer Management**: Debtor directory, outstanding tracking, and customer creation dialog.
5. **Invoice Management**: Custom terms, due dates, grace periods, permitted partial thresholds, and max installments.
6. **Financial Ledger with Subunit Integrity**: All calculations performed in integer paise subunits (`1 INR = 100 paise`), preventing floating-point inaccuracies.
7. **Customer-Facing Payment Portal (`/pay/{token}`)**: Secure, unguessable token-based access without leaking internal business records or API secrets.
8. **Conversational Payment Assistant**: Natural language intent classifier for:
   - `REQUEST_PARTIAL_PAYMENT`
   - `REQUEST_INSTALLMENT_PLAN`
   - `REQUEST_EXTENSION`
   - `PAYMENT_COMPLETED_CLAIM` (never marks invoice paid without verification)
   - `PAYMENT_DISPUTE` (pauses collection reminders)
   - `PAYMENT_METHOD_QUERY`
   - `GENERAL_INVOICE_QUERY`
9. **Dynamic Payment Requests & QR Codes**: Customer can request custom partial amounts (e.g. ₹10,000 on ₹25,000); generates dynamic UPI QR code.
10. **Razorpay Webhook Engine**: HMAC-SHA256 signature verification and idempotency duplicate protection.
11. **Deterministic Late-Fee Engine**: Accrues late fees strictly from invoice terms past grace period without AI hallucinations.
12. **AI Reminder Studio**: Multi-channel preview (WhatsApp, Email, SMS) with tone progression (Gentle, Balanced, Firm, Escalated) and Hinglish/English support.
13. **Subscription & Pricing Hub**: Dynamic pricing for Free, Pro (₹499/mo), and Business (₹1,499/mo) with monthly/6-month/yearly discount calculations.
14. **Admin CRM**: Real SaaS MRR/ARR analytics, user management, and feature flag overrides.

---

## 5. Backend Services Retained & Built
* Retained canonical test data (Rahul Sharma ₹25,000 scenario, Priya Patel ₹42,000, Vikram Enterprises ₹1,15,000, Ananya Roy ₹18,500).
* Created production FastAPI backend with SQLite/PostgreSQL compatibility.
* Authoritative server-side ledger recalculation (`FinancialLedger.record_confirmed_payment`).

---

## 6. Required Environment Variables
Create a `.env` file in `backend/`:
```bash
# Server Configuration
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production

# Database (Default: SQLite; or PostgreSQL URI)
DATABASE_URL=sqlite:///./duezy.db

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ALGORITHM=HS256

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_example_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_hmac
```

---

## 7. Commands to Run & Test

### Run FastAPI Backend
```bash
# Start backend server
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run Automated Backend Tests
```bash
python3 -m unittest backend/test_backend.py
```

### Run Flutter Tests
```bash
flutter test
```

### Run Flutter Web Application (Development)
```bash
flutter run -d chrome
```

### Run on iOS Simulator (macOS)
```bash
flutter run -d iPhone
```

### Run on Android Emulator
```bash
flutter run -d android
```

### Build Production Artifacts
```bash
# Web
flutter build web --release

# Android APK / App Bundle
flutter build apk --release
flutter build appbundle --release

# iOS (Requires macOS + Xcode)
flutter build ipa --release
```

---

## 8. Test Results Summary
* **Backend Unit & Integration Tests**: 9/9 passed (`Ran 9 tests in 0.003s — OK`).
* **Flutter Unit & Widget Tests**: 6/6 passed (`All tests passed!`).
* **Flutter Analyzer**: 0 issues found (`No issues found!`).
* **Android Debug APK**: `✓ Built build/app/outputs/flutter-apk/app-debug.apk` (Exit code 0).
* **iOS Simulator Build**: `** BUILD SUCCEEDED **` (Exit code 0, launched on iPhone 17 Pro Simulator).
* **Web Release Compilation**: Succeeded in 19.8s (`✓ Built build/web`).

---

## 9. iOS & Android Platform Fixes & Configuration

### A. Dynamic API URL Resolution
* **Problem**: In Flutter, Android emulators access the host machine via `http://10.0.2.2:8000`, while iOS Simulators and Web access the host via `http://localhost:8000`.
* **Fix**: Implemented platform-adaptive `AppConstants.apiBaseUrl`:
  ```dart
  static String get apiBaseUrl {
    const fromEnv = String.fromEnvironment('API_URL');
    if (fromEnv.isNotEmpty) return fromEnv;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8000';
    }
    return 'http://localhost:8000';
  }
  ```

### B. Android Platform Configuration (`android/`)
* **`AndroidManifest.xml`**:
  * Set `android:label="DUEZY"`.
  * Added `android.permission.INTERNET` and `android.permission.ACCESS_NETWORK_STATE`.
  * Enabled `android:usesCleartextTraffic="true"` to permit HTTP communication with local development servers.
  * Added package queries (`<queries>`) for Indian UPI apps: Google Pay (`com.google.android.apps.nbu.paisa.user`), PhonePe (`com.phonepe.app`), Paytm (`net.one97.paytm`), and scheme `upi`.
  * Configured deep linking for `duezy://pay` payment request URLs.
* **Gradle Build Settings (`build.gradle.kts`)**:
  * Successfully compiled with Android SDK Platform 35 and Kotlin 2.2.

### C. iOS Platform Configuration (`ios/`)
* **`Info.plist`**:
  * Set `CFBundleDisplayName` to `"DUEZY"`.
  * Configured `NSAppTransportSecurity` (`NSAllowsArbitraryLoads` and `NSAllowsLocalNetworking`) for local backend communication during development.
  * Added `LSApplicationQueriesSchemes` for `upi`, `gpay`, `phonepe`, `paytm`, `whatsapp`, `sms`, `tel`, and `mailto`.
  * Added `CFBundleURLTypes` registering custom scheme `duezy://`.
* **Deployment Target Alignment**:
  * Xcode 16/27+ requires iOS deployment target `>= 15.0`.
  * Configured `platform :ios, '15.0'` in `ios/Podfile`.
  * Enforced `IPHONEOS_DEPLOYMENT_TARGET = '15.0'` in `project.pbxproj` and Podfile `post_install` hook.
* **Codesign Extended Attribute Detritus Fix**:
  * Added automatic `xattr -cr` stripping in Xcode build scripts to eliminate `resource fork, Finder information, or similar detritus not allowed` codesigning errors caused by macOS file provenance attributes.

### D. Mobile Responsive Layout Polish
* **SafeArea Integration**: Wrapped `DuezyAppBar` in `SafeArea(bottom: false, ...)` so the status bar, Dynamic Island, and top notch do not collide with app bar branding and action buttons.
* **Overflow Resolution**:
  * Replaced rigid `Row` layouts with adaptive `Wrap` and `Flexible` widgets in `workflow_timeline_widget.dart` and `rahul_scenario_card.dart`.
  * Eliminated all yellow/black pixel overflow warnings on compact mobile screens.
* **Adaptive Payment Stream Table**:
  * Lays out payment items as rich mobile cards on smartphone screens (`Responsive.isMobile(context)`), and as spacious multi-column table rows on tablets and widescreen desktop displays.
