// Authentication & Role-Based Access Control (RBAC) Service for DUEZY
import { getDbUsers } from '../data/dbStore';

const CURRENT_USER_KEY = 'duezy_active_session_v2';

export const getCurrentUser = () => {
  const users = getDbUsers();
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const matched = users.find(u => u.id === parsed.id);
      if (matched) return matched;
    }
  } catch {}
  // Default to Rahul Sharma (Active Freelancer / Business User)
  const defaultUser = users.find(u => u.id === 'usr_rahul_sharma') || users[0];
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(defaultUser));
  return defaultUser;
};

export const setCurrentUserSession = (userId) => {
  const users = getDbUsers();
  const found = users.find(u => u.id === userId);
  if (found) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(found));
    return found;
  }
  return getCurrentUser();
};

export const hasAdminAccess = (user = null) => {
  const activeUser = user || getCurrentUser();
  if (!activeUser) return false;
  return activeUser.role === 'ADMIN' || activeUser.role === 'SUPER_ADMIN';
};

export const isSuperAdmin = (user = null) => {
  const activeUser = user || getCurrentUser();
  if (!activeUser) return false;
  return activeUser.role === 'SUPER_ADMIN';
};
