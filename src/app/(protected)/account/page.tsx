'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountLayout from '@/components/layout/User/AccountLayout';
import ProfileSection from '@/components/account/ProfileSection';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

import { User } from '@/types/user';

export default function AccountPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const showSpinner = useSmoothLoading(isLoading || loading || !isAuthenticated, 120, 220);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    const fetchUserData = async () => {
      try {
        const resUser = await fetch('/api/users/me', { credentials: 'include' });
        if (resUser.ok) {
          const data = await resUser.json();
          setUserProfile(data);
        } else {
          setUserProfile(null);
        }
      } catch {
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUserProfile(updatedUser);
  };

  if (showSpinner) {
    return <FullscreenSpinner />;
  }

  return (
    <AccountLayout>
      <ProfileSection user={userProfile!} onUpdate={handleUserUpdate} />
      <ChangePasswordForm onLogout={handleLogout} userEmail={userProfile?.email} />
    </AccountLayout>
  );
}
