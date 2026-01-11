import { toast } from 'react-toastify';

const DEFAULT_OPTIONS = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
  className: 'custom-toast',
  bodyClassName: 'custom-toast-body',
  progressClassName: 'custom-toast-progress',
};

const notify = {
  success: (message, options = {}) =>
    toast.success(message, {
      ...DEFAULT_OPTIONS,
      ...options,
      icon: '✓',
      className: 'custom-toast custom-toast-success',
    }),

  error: (message, options = {}) =>
    toast.error(message, {
      ...DEFAULT_OPTIONS,
      ...options,
      autoClose: 5000,
      icon: '✕',
      className: 'custom-toast custom-toast-error',
    }),

  info: (message, options = {}) =>
    toast.info(message, {
      ...DEFAULT_OPTIONS,
      ...options,
      icon: 'ℹ',
      className: 'custom-toast custom-toast-info',
    }),

  warn: (message, options = {}) =>
    toast.warn(message, {
      ...DEFAULT_OPTIONS,
      ...options,
      icon: '⚠',
      className: 'custom-toast custom-toast-warn',
    }),

  loading: (message, options = {}) =>
    toast.loading(message, {
      ...DEFAULT_OPTIONS,
      ...options,
      autoClose: false,
      closeButton: false,
      className: 'custom-toast custom-toast-loading',
    }),

  promise: (promise, messages, options = {}) =>
    toast.promise(
      promise,
      {
        pending: {
          render: messages.pending || 'Caricamento...',
          icon: '⏳',
        },
        success: {
          render: messages.success || 'Completato!',
          icon: '✓',
        },
        error: {
          render: messages.error || 'Errore',
          icon: '✕',
        },
      },
      { ...DEFAULT_OPTIONS, ...options },
    ),

  update: (toastId, options) => toast.update(toastId, options),

  dismiss: (toastId) => toast.dismiss(toastId),

  dismissAll: () => toast.dismiss(),
};

export default notify;
