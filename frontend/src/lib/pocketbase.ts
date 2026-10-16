import PocketBase from 'pocketbase';

export const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL || 'http://127.0.0.1:8090');

export const isAdmin = () => {
  if (pb.authStore.isValid && pb.authStore.record?.role === 'admin') return true;
  if (typeof window !== 'undefined' && (localStorage.getItem('admin_auth') === 'true' || localStorage.getItem('demo_role') === 'admin')) return true;
  return false;
};

export const isEmployer = () => {
  if (pb.authStore.isValid && pb.authStore.record?.role === 'employer') return true;
  if (typeof window !== 'undefined' && localStorage.getItem('demo_role') === 'employer') return true;
  return false;
};

export const isCandidate = () => {
  if (pb.authStore.isValid && pb.authStore.record?.role === 'candidate') return true;
  if (typeof window !== 'undefined' && localStorage.getItem('demo_role') === 'candidate') return true;
  return false;
};

export const getUserRole = (): string | null => {
  if (pb.authStore.isValid && pb.authStore.record) return pb.authStore.record.role || null;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('demo_role') || (localStorage.getItem('admin_auth') === 'true' ? 'admin' : null);
  }
  return null;
};
