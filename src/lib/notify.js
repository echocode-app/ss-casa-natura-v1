import { toast } from 'react-toastify';

const DEFAULT_OPTIONS = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'light',
};

const notify = {
  success: (message, options = {}) => toast.success(message, { ...DEFAULT_OPTIONS, ...options }),
  error: (message, options = {}) => toast.error(message, { ...DEFAULT_OPTIONS, ...options }),
  info: (message, options = {}) => toast.info(message, { ...DEFAULT_OPTIONS, ...options }),
  warn: (message, options = {}) => toast.warn(message, { ...DEFAULT_OPTIONS, ...options }),
};

export default notify;
