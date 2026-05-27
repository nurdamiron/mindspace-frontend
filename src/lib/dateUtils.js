// formatDate : локализацияланған күн форматтағышы
// date — ISO string немесе Date объектісі
// locale — i18n.language мәні (kk, ru, en)
// options — Intl.DateTimeFormat опциялары
export function formatDate(date, locale = 'ru', options = {}) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const intlLocale = locale === 'kk' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU';
  return new Intl.DateTimeFormat(intlLocale, options).format(d);
}
