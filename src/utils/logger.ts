import { dateToString } from './';

export function log(event: string, ...args: any[]) {
  console.log(`[${dateToString(new Date())}]`, `<${event}>`, ...args);
}