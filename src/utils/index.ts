export function sleep(ms): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function dateToString(date: Date) {
  const year  = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day   = date.getDate().toString().padStart(2, '0');
  const hour  = date.getHours().toString().padStart(2, '0');
  const min   = date.getMinutes().toString().padStart(2, '0');
  const sec   = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}