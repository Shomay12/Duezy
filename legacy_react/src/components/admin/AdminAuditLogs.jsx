import React from 'react';
import { getDbAuditLogs } from '../../data/dbStore';

export default function AdminAuditLogs() {
  const logs = getDbAuditLogs();
  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-header__title">Immutable Audit Logs</h2>
        <p className="admin-section-header__subtitle">Permanent record of all administrator actions, plan edits, and security overrides.</p>
      </div>
      <div className="stream-table-container">
        <table className="stream-table">
          <thead><tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Target</th><th>Metadata</th><th>IP</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={{ fontWeight: 600, color: 'var(--info)' }}>{log.actor_name}</td>
                <td><span className="provider-badge provider-badge--admin">{log.action}</span></td>
                <td style={{ fontWeight: 500 }}>{log.target_label || log.target_id}</td>
                <td><code style={{ fontSize: 'var(--text-xxs)', color: 'var(--success)', background: 'var(--bg-surface-raised)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>{JSON.stringify(log.metadata)}</code></td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{log.ip_address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
