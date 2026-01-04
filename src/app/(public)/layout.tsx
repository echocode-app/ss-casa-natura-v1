'use client';

import { Header, PromoBar } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ScrollToTop } from '@/components/ui/Scroll';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <PromoBar
        isVisible
        text="BLACK FRIDAY: fino al -30% 🔥 Il prezzo più basso dell’anno – non lasciartelo scappare!"
        bgColor="#C3FF8A"
      />
      <main>{children}</main>
      <Footer />
      <ScrollToTop />
      <ToastContainer />
    </>
  );
}
