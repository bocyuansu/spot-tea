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

// client component 會在伺服器（Cloudflare 是 UTC）與瀏覽器各渲染一次，時區寫死兩邊才會一致
export function formatDateTimeTW(date: Date) {
  return date.toLocaleString('zh-Hant-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
