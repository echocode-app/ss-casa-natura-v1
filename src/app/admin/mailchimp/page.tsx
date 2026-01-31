'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Admin Mailchimp Export Page Route
 *
 * Production-ready protected route for managing Mailchimp export.
 *
 * Features:
 * - Role-based access control (developer, superadmin, admin)
 * - Fetches statistics from /api/mailchimp/stats
 * - Integrated MailchimpExportPanel for export management
 * - Loading states and error handling
 *
 * Route: /admin/mailchimp
 *
 * Usage:
 * Navigate to http://localhost:3000/admin/mailchimp with an authenticated user
 * with role: developer, superadmin, or admin
 */
export default function MailchimpExportPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return <div className="p-6 text-gray-600">Reindirizzamento alla dashboard…</div>;
}
