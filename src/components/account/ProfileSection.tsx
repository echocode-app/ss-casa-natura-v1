// import { useTranslations } from 'next-intl';
// import EditableField from './EditableField';

// interface User {
//   id: string;
//   nome?: string;
//   cognome?: string;
//   email: string;
//   phone?: string;
//   address?: {
//     street?: string;
//     city?: string;
//   };
// }

// interface ProfileSectionProps {
//   user: User;
//   onUpdate: (updatedUser: User) => void;
// }

// export default function ProfileSection({ user, onUpdate }: ProfileSectionProps) {
//   const t = useTranslations('user.account.profile');

//   const handleSaveField = async (name: string, value: string) => {
//     const res = await fetch('/api/users/me', {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       credentials: 'include',
//       body: JSON.stringify({ [name]: value }),
//     });
//     const data = await res.json();
//     if (!res.ok) throw new Error(data.error || data.message);
//     if (onUpdate) onUpdate(data);
//   };

//   const validateEmail = (value: string) => {
//     if (!value) return t('required');
//     if (!/\S+@\S+\.\S+/.test(value)) return t('invalidEmail');
//     return '';
//   };

//   const validatePhone = (value: string) => {
//     if (value && !/^\+?[0-9\s\-\(\)]{6,20}$/.test(value.replace(/\s/g, ''))) {
//       return t('invalidPhone');
//     }
//     return '';
//   };

//   return (
//     <section
//       className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
//       aria-labelledby="profile-heading"
//     >
//       <h2 id="profile-heading" className="text-xl font-semibold text-gray-900 mb-6">
//         {t('title')}
//       </h2>

//       <div className="space-y-1">
//         <EditableField
//           label={t('firstName')}
//           value={user.nome}
//           name="nome"
//           onSave={handleSaveField}
//           required
//           placeholder={t('firstName')}
//         />

//         <EditableField
//           label={t('lastName')}
//           value={user.cognome}
//           name="cognome"
//           onSave={handleSaveField}
//           required
//           placeholder={t('lastName')}
//         />

//         <EditableField
//           label={t('email')}
//           value={user.email}
//           name="email"
//           type="email"
//           onSave={handleSaveField}
//           validate={validateEmail}
//           required
//           placeholder={t('email')}
//         />

//         <EditableField
//           label={t('phone')}
//           value={user.phone}
//           name="phone"
//           type="tel"
//           onSave={handleSaveField}
//           validate={validatePhone}
//           placeholder={t('phone')}
//         />

//         <EditableField
//           label={t('street')}
//           value={user.address?.street}
//           name="street"
//           onSave={(name, value) => handleSaveField('address.street', value)}
//           placeholder={t('street')}
//         />

//         <EditableField
//           label={t('city')}
//           value={user.address?.city}
//           name="city"
//           onSave={(name, value) => handleSaveField('address.city', value)}
//           placeholder={t('city')}
//         />
//       </div>
//     </section>
//   );
// }
