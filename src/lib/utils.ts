import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmt(n: number | null | undefined, decimals = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export function fmtBushels(n: number) {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' bu'
}

export function fmtPrice(n: number | null | undefined) {
  if (n == null) return '—'
  return '$' + fmt(n, 4)
}

export function fmtCurrency(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
