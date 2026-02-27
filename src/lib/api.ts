const BASE = '/api'

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

// Contracts
export const getContracts = () => request<Contract[]>('/contracts')
export const createContract = (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) =>
  request<Contract>('/contracts', { method: 'POST', body: JSON.stringify(data) })
export const updateContract = (id: string, data: Partial<Contract>) =>
  request<Contract>(`/contracts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteContract = (id: string) =>
  request<{ ok: boolean }>(`/contracts/${id}`, { method: 'DELETE' })

// Alerts
export const getAlerts = () => request<Alert[]>('/alerts')
export const createAlert = (data: Omit<Alert, 'id' | 'createdAt'>) =>
  request<Alert>('/alerts', { method: 'POST', body: JSON.stringify(data) })
export const updateAlert = (id: string, data: Partial<Alert>) =>
  request<Alert>(`/alerts/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteAlert = (id: string) =>
  request<{ ok: boolean }>(`/alerts/${id}`, { method: 'DELETE' })

// Market
export const getLatestSnapshot = () =>
  request<{ corn: MarketSnapshot | null; beans: MarketSnapshot | null }>('/market/snapshot')
export const saveSnapshots = (entries: SnapshotEntry[]) =>
  request<MarketSnapshot[]>('/market/snapshot', { method: 'POST', body: JSON.stringify(entries) })
export const getMarketHistory = (crop: string, days: number) =>
  request<MarketSnapshot[]>(`/market/history?crop=${crop}&days=${days}`)

// Types
export interface Contract {
  id: string
  companyId?: string
  crop: string
  contractType: string
  bushels: number
  price: number
  basis?: number | null
  futuresMonth?: string | null
  elevator: string
  deliveryStart?: string | null
  deliveryEnd?: string | null
  status: string
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface Alert {
  id: string
  crop: string
  alertType: string
  targetValue: number
  futuresMonth?: string | null
  active: number
  notified: number
  createdAt: string
}

export interface MarketSnapshot {
  id: string
  crop: string
  futuresMonth: string
  futuresPrice: number
  cashPrice: number
  basis: number
  impliedVol?: number | null
  snapshotAt: string
}

export interface SnapshotEntry {
  crop: string
  futuresMonth: string
  futuresPrice: number
  cashPrice: number
  basis: number
  impliedVol?: number
}
