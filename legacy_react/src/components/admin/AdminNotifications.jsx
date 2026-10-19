import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { getDbAdminNotifications } from '../../data/dbStore';

export default function AdminNotifications() {
  const notifs = getDbAdminNotifications();
  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-header__title">Notification Center</h2>
        <p className="admin-section-header__subtitle">Subscription events, Razorpay webhooks, and system alerts.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {notifs.map((n) => (
          <div key={n.id} className="notification-card">
            <div className="notification-card__icon"><CheckCircle2 size={16} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="notification-card__title">{n.title}</div>
                <div className="notification-card__time">{new Date(n.timestamp).toLocaleTimeString()}</div>
              </div>
              <div className="notification-card__message">{n.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
