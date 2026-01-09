'use client';

import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AccountPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await fetch('/api/users/me', {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }

        // Fetch orders
        const ordersRes = await fetch('/api/users/me/orders', {
          credentials: 'include',
        });

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }
      } catch {
        // error fetching
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, router]);

  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
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
        setPasswordError(data.error || data.message || 'Failed to change password');
        return;
      }

      setPasswordSuccess(data.message);
      setChangePasswordData({ currentPassword: '', newPassword: '' });
      setTimeout(() => {
        handleLogout();
      }, 2000);
    } catch (err) {
      setPasswordError((err as Error).message || 'An error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Account</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Profile Section */}
      {userProfile && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">First Name</p>
              <p className="font-semibold">{userProfile.nome}</p>
            </div>
            <div>
              <p className="text-gray-600">Last Name</p>
              <p className="font-semibold">{userProfile.cognome}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-semibold">{userProfile.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-semibold">{userProfile.phone || 'Not set'}</p>
            </div>
          </div>
          {userProfile.address && (
            <div className="mt-4">
              <p className="text-gray-600">Address</p>
              <p className="font-semibold">
                {userProfile.address.street}, {userProfile.address.city}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Orders Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold mb-4">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders yet</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border p-4 rounded">
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-gray-600">Status: {order.status}</p>
                <p className="text-gray-600">Total: €{order.totalPrice}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Change Password Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Change Password</h2>

        {passwordError && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{passwordError}</div>
        )}

        {passwordSuccess && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Current Password</label>
            <input
              type="password"
              value={changePasswordData.currentPassword}
              onChange={(e) =>
                setChangePasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">New Password</label>
            <input
              type="password"
              value={changePasswordData.newPassword}
              onChange={(e) =>
                setChangePasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              required
              minLength={8}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
