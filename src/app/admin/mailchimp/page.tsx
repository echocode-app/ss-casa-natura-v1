'use client';

import MailchimpExportAdminPage from '@/components/admin/MailchimpExportAdminPage';

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
  return <MailchimpExportAdminPage />;
}
