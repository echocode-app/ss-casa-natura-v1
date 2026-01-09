// 'use client';

// import { useState } from 'react';
// import { useTranslations } from 'next-intl';
// import { Icon } from '@/components/ui';

// interface EditableFieldProps {
//   label: string;
//   value: string | undefined;
//   name: string;
//   onSave: (name: string, value: string) => Promise<void>;
//   type?: string;
//   validate?: (value: string) => string;
//   required?: boolean;
//   placeholder?: string;
// }

// export default function EditableField({
//   label,
//   value,
//   name,
//   onSave,
//   type = 'text',
//   validate,
//   required = false,
//   placeholder = '',
// }: EditableFieldProps) {
//   const [editing, setEditing] = useState(false);
//   const [inputValue, setInputValue] = useState(value || '');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const t = useTranslations('user.account.profile');

//   const handleSave = async () => {
//     if (validate) {
//       const validationError = validate(inputValue);
//       if (validationError) {
//         setError(validationError);
//         return;
//       }
//     }

//     if (required && !inputValue.trim()) {
//       setError(t('required'));
//       return;
//     }

//     setLoading(true);
//     setError('');
//     try {
//       await onSave(name, inputValue);
//       setEditing(false);
//     } catch (err: unknown) {
//       setError(err instanceof Error ? err.message : t('error'));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setEditing(false);
//     setInputValue(value || '');
//     setError('');
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSave();
//     }
//     if (e.key === 'Escape') {
//       handleCancel();
//     }
//   };

//   const handleEditClick = () => {
//     setEditing(true);
//     setInputValue(value || '');
//   };

//   return (
//     <div className="mb-6">
//       <label htmlFor={`field-${name}`} className="block text-sm font-medium text-gray-700 mb-2">
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>

//       {editing ? (
//         <div className="flex items-center gap-3">
//           <input
//             id={`field-${name}`}
//             type={type}
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder={placeholder}
//             className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
//             autoFocus
//             aria-describedby={error ? `error-${name}` : undefined}
//             aria-invalid={!!error}
//           />
//           <button
//             onClick={handleSave}
//             disabled={loading}
//             className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             aria-label={t('save')}
//           >
//             {loading ? (
//               <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
//             ) : (
//               <Edit id="check" width={16} height={16} />
//             )}
//             {!loading && <span className="ml-1">{t('save')}</span>}
//           </button>
//           <button
//             onClick={handleCancel}
//             className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//             aria-label={t('cancel')}
//           >
//             <Edit id="x" width={16} height={16} />
//             <span className="ml-1">{t('cancel')}</span>
//           </button>
//         </div>
//       ) : (
//         <div
//           className="flex items-center justify-between p-3 border border-gray-300 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
//           onClick={handleEditClick}
//           role="button"
//           tabIndex={0}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter' || e.key === ' ') {
//               e.preventDefault();
//               handleEditClick();
//             }
//           }}
//           aria-label={`${t('edit')} ${label}`}
//         >
//           <span className="text-sm text-gray-900">
//             {value || <span className="text-gray-400 italic">{placeholder || '-'}</span>}
//           </span>
//           <Edit
//             id="edit"
//             width={16}
//             height={16}
//             className="text-gray-400 hover:text-gray-600 transition-colors"
//           />
//         </div>
//       )}

//       {error && (
//         <p id={`error-${name}`} className="mt-1 text-sm text-red-600" role="alert">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }
