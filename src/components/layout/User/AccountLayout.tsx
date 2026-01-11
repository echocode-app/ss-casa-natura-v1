'use client';

import { ToastContainer } from 'react-toastify';
import AccountSidebar from './AccountSidebar';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ScrollToTop } from '@/components/ui/Scroll';
import { useAuth } from '@/components/layout/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';

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
    return <FullscreenSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex mx-auto gap-6">
        <AccountSidebar />
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
      <ScrollToTop />
      <ToastContainer />
    </>
  );
}
