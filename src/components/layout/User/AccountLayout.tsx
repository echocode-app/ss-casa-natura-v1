'use client';

import { ToastContainer } from 'react-toastify';
import AccountSidebar from './AccountSidebar';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ScrollToTop } from '@/components/ui/Scroll';
import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex max-w-6xl mx-auto p-6 gap-6">
        <AccountSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
      <ScrollToTop />
      <ToastContainer />
    </>
  );
}
