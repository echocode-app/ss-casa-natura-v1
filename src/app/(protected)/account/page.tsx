'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AccountLayout from '@/components/layout/User/AccountLayout';
import ProfileSection from '@/components/account/ProfileSection';
import OrdersSection from '@/components/account/OrdersSection';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';

import { User, Order, ChangePasswordData } from '@/types/user';

export default function AccountPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [changePasswordData, setChangePasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch user data and orders
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
        const resOrders = await fetch('/api/users/me/orders', { credentials: 'include' });
        if (resOrders.ok) {
          const ordersData = await resOrders.json();
          setOrders(ordersData);
        } else {
          setOrders([]);
        }
      } catch {
        setUserProfile(null);
        setOrders([]);
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

  if (isLoading || !isAuthenticated || loading) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <AccountLayout>
      <ProfileSection user={userProfile!} onUpdate={handleUserUpdate} />
      <OrdersSection orders={orders} />
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
