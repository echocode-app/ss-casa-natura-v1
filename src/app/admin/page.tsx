'use client';

import Link from 'next/link';
import { useAuth } from '@/components/layout/AuthContext';

export default function AdminPage() {
  const { user } = useAuth();

  // 📌 Layout already checked access - render admin content
  const adminMenuItems = [
    {
      title: 'Esportazione Mailchimp',
      description: 'Esporta email di marketing in Mailchimp',
      href: '/admin/mailchimp',
      icon: '✉️',
      roles: ['developer', 'superadmin', 'admin'],
    },
    {
      title: 'Impostazioni',
      description: 'Impostazioni del pannello',
      href: '/admin/settings',
      icon: '⚙️',
      roles: ['developer', 'superadmin'],
    },
  ];

  // Filtrare il menu in base al ruolo dell'utente
  const availableMenuItems = adminMenuItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Pannello Amministrativo</h1>
              <p className="text-gray-600 mt-2">Gestione del sistema Casa Natura</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Utente: <span className="font-semibold text-gray-900">{user?.email}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Ruolo: <span className="font-semibold text-gray-700">{user?.role}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Menu</h2>

        {availableMenuItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer h-full border border-gray-200">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h2>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                  <div className="mt-4 text-blue-600 text-sm font-medium">Visita →</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-yellow-700">
              Non hai accesso a nessuna pagina del pannello di amministrazione.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-600">Pannello Amministrativo v1.0 — Casa Natura SS</p>
        </div>
      </div>
    </div>
  );
}
