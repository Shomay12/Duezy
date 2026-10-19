import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:duezy/app/app.dart';

void main() {
  testWidgets('DUEZY app renders dashboard and brand identity', (WidgetTester tester) async {
    // Set large enough window to avoid overflow in tests
    tester.view.physicalSize = const Size(1280, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    await tester.pumpWidget(const DuezyApp());
    await tester.pumpAndSettle();

    // Verify brand presence
    expect(find.text('DUEZY'), findsOneWidget);
    expect(find.text('Get paid. Without the chase.'), findsOneWidget);

    // Verify workflow timeline presence
    expect(find.text('12-Step Autonomous Workflow'), findsOneWidget);

    // Verify Rahul scenario presence
    expect(find.text('Rahul Sharma'), findsWidgets);
  });
}
