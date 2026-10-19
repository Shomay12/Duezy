import React, { useState } from 'react';
import { Activity, CheckCircle2, Clock, Calendar } from 'lucide-react';
import { getPayments } from '../../services/storage';

export default function AdminPayments() {
  const payments = getPayments();

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Tracked Customer Invoices & Payments</h2>
        <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginTop: '0.2rem' }}>
          Audit view of invoices tracked by DUEZY users. Read-only verified financial integrity.
        </p>
      </div>

      <div className="stream-table-container" style={{ background: '#0D131F', borderColor: 'rgba(255, 255, 255, 0.08)' }}>
        <table className="stream-table">
          <thead>
            <tr>
              <th>Client / Debtor</th>
              <th>Invoice</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Payment Provider</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => {
              const isPaid = p.status === 'PAID';
              return (
                <tr key={p.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, color: '#F8FAFC' }}>{p.clientName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{p.clientCompany}</div>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.78rem', color: '#94A3B8' }}>#{p.invoiceNumber}</code>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: isPaid ? '#10B981' : '#F8FAFC' }}>
                      ₹{p.amount.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>{p.dueDate}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${isPaid ? 'paid' : 'overdue'}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.55rem' }}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', color: '#10B981' }}>
                      {isPaid ? 'Razorpay Webhook (Verified)' : 'Razorpay Link & Dynamic QR'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
