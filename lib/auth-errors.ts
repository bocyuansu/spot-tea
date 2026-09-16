import { authClient } from './auth-client';

type ErrorTypes = Partial<
  Record<
    keyof typeof authClient.$ERROR_CODES,
    {
      en: string;
      zh: string;
    }
  >
>;

const errorCodes = {
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: {
    en: 'User already exists. Use another email.',
    zh: '信箱已被註冊 !',
  },
  USER_ALREADY_EXISTS: {
    en: 'User already registered',
    zh: '使用者已經被註冊 !',
  },
  INVALID_EMAIL_OR_PASSWORD: {
    en: 'Invalid email or password',
    zh: '電子信箱或密碼錯誤 !',
  },
  BANNED_USER: {
    en: 'You Have been banned',
    zh: '使用者已被禁用 !',
  },
} satisfies ErrorTypes;

export const getErrorMessage = (code: string, lang: 'en' | 'zh') => {
  if (code in errorCodes) {
    return errorCodes[code as keyof typeof errorCodes][lang];
  }
  return '發生未知的錯誤。(未定義的錯誤訊息)';
};
