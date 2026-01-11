'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountLayout from '@/components/layout/User/AccountLayout';
import ProfileSection from '@/components/account/ProfileSection';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

import { User, ChangePasswordData } from '@/types/user';

export default function AccountPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [changePasswordData, setChangePasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const showSpinner = useSmoothLoading(isLoading || loading || !isAuthenticated, 120, 220);

  // Fetch user data
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

  // Logout
  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Password change
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const res = await fetch('/api/users/me/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(changePasswordData),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(
          data?.error === 'Unauthorized'
            ? 'Unauthorized. Please log in.'
            : 'Something went wrong. Please try again.',
        );
        return;
      }
      setPasswordSuccess(data.message || 'Password changed successfully.');
      setChangePasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch {
      setPasswordError('Something went wrong. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Update user profile locally
  const handleUserUpdate = (updatedUser: User) => {
    setUserProfile(updatedUser);
  };

  if (showSpinner) {
    return <FullscreenSpinner />;
  }

  return (
    <AccountLayout>
      <ProfileSection user={userProfile!} onUpdate={handleUserUpdate} />
      <ChangePasswordForm
        changePasswordData={changePasswordData}
        setChangePasswordData={setChangePasswordData}
        passwordLoading={passwordLoading}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        onSubmit={handleChangePassword}
        onLogout={handleLogout}
        userEmail={userProfile?.email}
      />
    </AccountLayout>
  );
}
