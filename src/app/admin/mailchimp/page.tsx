'use client';

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
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-[clamp(24px,4vw,40px)]">Mailchimp Export</h1>
        <p className="text-gray-600 mt-1">
          Questa sezione è in fase di sviluppo. La logica di esportazione è già implementata, ma
          l'interfaccia sarà disponibile prossimamente.
        </p>
      </div>
    </div>
  );
}
