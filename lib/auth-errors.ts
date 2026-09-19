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
  USER_NOT_FOUND: {
    en: 'User does not exist',
    zh: '使用者不存在 !',
  },
  BANNED_USER: {
    en: 'You Have been banned',
    zh: '使用者已被禁用 !',
  },
  INVALID_PASSWORD: {
    en: 'Invalid password',
    zh: '目前的密碼錯誤 !',
  },
  PASSWORD_TOO_SHORT: {
    en: 'Password too short',
    zh: '密碼長度太短 !',
  },
  PASSWORD_TOO_LONG: {
    en: 'Password too long',
    zh: '密碼長度太長 !',
  },
  CREDENTIAL_ACCOUNT_NOT_FOUND: {
    en: 'Credential account not found',
    zh: '此帳號沒有設定密碼 !',
  },
  FAILED_TO_UPDATE_USER: {
    en: 'Failed to update user',
    zh: '更新會員資料失敗 !',
  },
  SESSION_EXPIRED: {
    en: 'Session expired. Re-authenticate to perform this action.',
    zh: '登入已過期，請重新登入 !',
  },
} satisfies ErrorTypes;

export const getErrorMessage = (code: string, lang: 'en' | 'zh') => {
  if (code in errorCodes) {
    return errorCodes[code as keyof typeof errorCodes][lang];
  }
  return '發生未知的錯誤。(未定義的錯誤訊息)';
};
