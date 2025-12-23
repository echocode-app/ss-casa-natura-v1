'use client';

import { Header, PromoBar } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <PromoBar />
      <main>{children}</main>
      <Footer />
      <ToastContainer />
    </>
  );
}
