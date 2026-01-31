'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return <div className="p-6 text-gray-600">Reindirizzamento alla dashboard…</div>;
}
