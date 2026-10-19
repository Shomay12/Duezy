# DUEZY — AI-Powered Payment Collection & Recovery Platform

> **"Get paid. Without the chase."**  
> Complete Multi-Platform Flutter Application (Web, iOS, Android) powered by an authoritative FastAPI Financial Engine.

---

## 🚀 Quick Start

### 1. Start the Authoritative Backend API
```bash
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Run the Flutter Application
```bash
# Web (Chrome)
flutter run -d chrome

# iOS Simulator (macOS)
flutter run -d iPhone

# Android Emulator
flutter run -d android
```

### 3. Run Automated Tests
```bash
# Backend Financial Tests
python3 -m unittest backend/test_backend.py

# Flutter Unit & Widget Tests
flutter test
```

---

## 🏛 Architecture & Tech Stack

* **Frontend**: Flutter & Dart (Single codebase for Web, iOS, Android).
  * Material 3 with custom DUEZY dark theme (`#0A0E16`, `#111827`, `#10B981`).
  * Adaptive layout builder (`ResponsiveLayout`) supporting wide desktop monitors, tablets, and phones.
* **Backend**: FastAPI (Python 3.13) with strict integer paise subunits (`1 INR = 100 paise`).
* **Financial Ledger**: Double-entry event-sourced ledger tracking invoices, payment requests, transactions, late-fee assessments, and customer claims.
* **Payment Integration**: Razorpay Webhook Engine with HMAC-SHA256 signature verification & duplicate event idempotency.
* **Conversational AI**: Structured intent classifier and business rule validator for partial payments, installment schedules, extensions, and disputes.
* **Legacy Code**: The original React 19 Vite codebase has been preserved in [`legacy_react/`](./legacy_react/).

For in-depth architectural details, see [MIGRATION.md](./MIGRATION.md).
