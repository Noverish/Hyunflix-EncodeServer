function dateToString(date: Date) {
  const year = date.getFullYear().toString().padStart(4, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const min = date.getMinutes().toString().padStart(2, '0');
  const sec = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

export default function (event: string, ...args: any[]) {
  console.log(`[${dateToString(new Date())}]`, `<${event}>`, ...args);
}
