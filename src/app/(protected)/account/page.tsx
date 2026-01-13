'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AccountLayout from '@/components/layout/User/AccountLayout';
import ProfileSection from '@/components/account/ProfileSection';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

import { User } from '@/types/user';

export default function AccountPage() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const router = useRouter();

  const showSpinner = useSmoothLoading(isLoading || !isAuthenticated, 120, 220);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (showSpinner || !user) {
    return <FullscreenSpinner />;
  }

  // Convert user to User type for components
  const userProfile: User = {
    id: user.id,
    email: user.email,
    nome: user.name || '',
    cognome: user.surname || '',
    phone: user.phone,
    deliveryAddress: user.deliveryAddress,
    role: user.role,
  };

  return (
    <AccountLayout>
      <ProfileSection user={userProfile} onLogout={handleLogout} />
    </AccountLayout>
  );
}
