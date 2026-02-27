import type { Contract, InsertContract, Alert, MarketSnapshot } from '../../../shared/schema';

export type { Contract, Alert, MarketSnapshot };

const base = '/api';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// Contracts
export const getContracts = () => req<Contract[]>(`${base}/contracts`);
export const createContract = (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) =>
  req<Contract>(`${base}/contracts`, { method: 'POST', body: JSON.stringify(data) });
export const updateContract = (id: string, data: Partial<Contract>) =>
  req<Contract>(`${base}/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContract = (id: string) =>
  req<{ ok: boolean }>(`${base}/contracts/${id}`, { method: 'DELETE' });

// Alerts
export const getAlerts = () => req<Alert[]>(`${base}/alerts`);
export const createAlert = (data: Omit<Alert, 'id' | 'createdAt'>) =>
  req<Alert>(`${base}/alerts`, { method: 'POST', body: JSON.stringify(data) });
export const deleteAlert = (id: string) =>
  req<{ ok: boolean }>(`${base}/alerts/${id}`, { method: 'DELETE' });

// Market
export const getLatestSnapshot = () => req<MarketSnapshot | null>(`${base}/market/latest`);
export const getMarketHistory = (days = 30) => req<MarketSnapshot[]>(`${base}/market/history?days=${days}`);
export const createSnapshot = (data: Omit<MarketSnapshot, 'id'>) =>
  req<MarketSnapshot>(`${base}/market/snapshot`, { method: 'POST', body: JSON.stringify(data) });
