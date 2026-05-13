import { AuthUser } from '@/contexts/auth.context';

export function getInvestorProfileId(user: AuthUser | null): string {
  if (user?.investorProfileId) return user.investorProfileId;
  if (user?.role === 'investor' && user.id === 'user-001') return 'inv-001';
  return user?.id ?? 'inv-001';
}
