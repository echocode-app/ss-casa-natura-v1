/* eslint-disable no-console */

type LogType = 'success' | 'error' | 'server' | 'send' | 'info';

const emojiMap: Record<LogType, string> = {
  success: '✅ ',
  error: '❌ ',
  server: '🔋 ',
  send: '🚀 ',
  info: '💡 ',
};

export const log = (type: LogType, message: string, extra?: any) => {
  if (process.env.NODE_ENV === 'production') return;

  const emoji = emojiMap[type] || '';
  if (extra) {
    console.log(`${emoji} ${message}`, extra);
  } else {
    console.log(`${emoji} ${message}`);
  }
};

export const logError = (message: string, error?: unknown) => {
  if (error !== undefined) {
    console.error(message, error);
  } else {
    console.error(message);
  }
};
