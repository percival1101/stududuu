import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import enMessages from '../../messages/en.json';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  let requestedMessages: any = {};
  try {
    requestedMessages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    requestedMessages = enMessages;
  }

  return {
    locale,
    messages: {
      ...enMessages,
      ...requestedMessages,
      home: {
        ...(enMessages as any).home,
        ...requestedMessages?.home,
      },
      community: {
        ...(enMessages as any).community,
        ...requestedMessages?.community,
      },
    },
  };
});
