export function formatPriceTWD(amount: number) {
  return `NT$${amount.toLocaleString('zh-Hant-TW')}`;
}

export function formatDateTW(date: Date) {
  return date.toLocaleDateString('zh-Hant-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
