'use client';

import { ToastContainer } from 'react-toastify';
import AccountSidebar from './AccountSidebar';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { ScrollToTop } from '@/components/ui/Scroll';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
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
