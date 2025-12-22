type LogType = 'success' | 'error' | 'server' | 'send' | 'info';

const emojiMap: Record<LogType, string> = {
  success: '✅ ',
  error: '❌ ',
  server: '🔋 ',
  send: '🚀 ',
  info: '💡 ',
};

/* eslint-disable no-console */
export const log = (type: LogType, message: string, extra?: any) => {
  if (process.env.NODE_ENV === 'production') return;

  const emoji = emojiMap[type] || '';
  if (extra) {
    console.log(`${emoji} ${message}`, extra);
  } else {
    console.log(`${emoji} ${message}`);
  }
};
/* eslint-enable no-console */
