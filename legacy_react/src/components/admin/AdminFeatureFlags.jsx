import React, { useState } from 'react';
import { getDbFeatureFlags } from '../../data/dbStore';
import { adminToggleFeatureFlag } from '../../services/adminService';
import { getCurrentUser } from '../../services/authService';

export default function AdminFeatureFlags({ onShowToast }) {
  const [flags, setFlags] = useState(getDbFeatureFlags());

  const handleToggleGlobal = (flagId, currentVal) => {
    adminToggleFeatureFlag({ flagId, enabledGlobally: !currentVal, adminActor: getCurrentUser() });
    setFlags(getDbFeatureFlags());
    onShowToast && onShowToast('Feature flag updated.', 'info');
  };

  return (
    <div>
      <div className="admin-section-header">
        <h2 className="admin-section-header__title">Feature Flags & Capability Gates</h2>
        <p className="admin-section-header__subtitle">Enable or disable capabilities globally or per subscription tier.</p>
      </div>
      <div className="stream-table-container">
        <table className="stream-table">
          <thead><tr><th>Feature</th><th>Key</th><th>Global</th><th>Free</th><th>Pro</th><th>Business</th></tr></thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.id}>
                <td><div className="client-name">{f.name}</div><div className="client-company">{f.description}</div></td>
                <td><code style={{ fontSize: 'var(--text-xs)', color: 'var(--info)' }}>{f.key}</code></td>
                <td>
                  <button className={`flag-toggle ${f.enabled_globally ? 'flag-toggle--enabled' : 'flag-toggle--disabled'}`} onClick={() => handleToggleGlobal(f.id, f.enabled_globally)}>
                    {f.enabled_globally ? 'ENABLED' : 'DISABLED'}
                  </button>
                </td>
                <td style={{ fontWeight: 600, color: f.plan_overrides?.plan_free ? 'var(--success)' : 'var(--text-tertiary)' }}>{f.plan_overrides?.plan_free ? 'Active' : 'Locked'}</td>
                <td style={{ fontWeight: 600, color: f.plan_overrides?.plan_pro ? 'var(--success)' : 'var(--text-tertiary)' }}>{f.plan_overrides?.plan_pro ? 'Active' : 'Locked'}</td>
                <td style={{ fontWeight: 600, color: f.plan_overrides?.plan_business ? 'var(--success)' : 'var(--text-tertiary)' }}>{f.plan_overrides?.plan_business ? 'Active' : 'Locked'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
