import { Header, PromoBar } from '@/components/layout/Header';
// import Footer from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <PromoBar />
      <main>{children}</main>
      {/* <Footer /> */}
    </>
  );
}
