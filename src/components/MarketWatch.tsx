import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { MarketSnapshot, Alert } from '../lib/api'
import { createAlert, deleteAlert, updateAlert } from '../lib/api'
import { fmtPrice } from '../lib/utils'
import PriceUpdateModal from './PriceUpdateModal'

interface Props {
  snapshot: { corn: MarketSnapshot | null; beans: MarketSnapshot | null }
  cornHistory: MarketSnapshot[]
  beansHistory: MarketSnapshot[]
  alerts: Alert[]
  onRefresh: () => void
}

export default function MarketWatch({ snapshot, cornHistory, beansHistory, alerts, onRefresh }: Props) {
  const [priceModal, setPriceModal] = useState(false)
  const [historyDays, setHistoryDays] = useState(30)
  const [alertForm, setAlertForm] = useState({ crop: 'corn', alertType: 'price_above', targetValue: '', futuresMonth: '' })

  const chartData = (() => {
    const map = new Map<string, { date: string; corn?: number; beans?: number }>()
    cornHistory.forEach(s => {
      const d = s.snapshotAt.slice(0, 10)
      map.set(d, { ...map.get(d), date: d, corn: s.futuresPrice })
    })
    beansHistory.forEach(s => {
      const d = s.snapshotAt.slice(0, 10)
      map.set(d, { ...map.get(d), date: d, beans: s.futuresPrice })
    })
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  })()

  const handleAddAlert = async () => {
    if (!alertForm.targetValue) return
    await createAlert({
      crop: alertForm.crop,
      alertType: alertForm.alertType,
      targetValue: parseFloat(alertForm.targetValue),
      futuresMonth: alertForm.futuresMonth || null,
      active: 1,
      notified: 0,
    })
    onRefresh()
    setAlertForm(f => ({ ...f, targetValue: '', futuresMonth: '' }))
  }

  const handleDismiss = async (a: Alert) => {
    await updateAlert(a.id, { active: 0 })
    onRefresh()
  }

  const handleDeleteAlert = async (id: string) => {
    await deleteAlert(id)
    onRefresh()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Price Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <PriceCard label="ZC Futures" value={snapshot.corn?.futuresPrice} month={snapshot.corn?.futuresMonth} color="yellow" />
        <PriceCard label="Cash Corn" value={snapshot.corn?.cashPrice} month="Local" color="yellow" />
        <PriceCard label="ZS Futures" value={snapshot.beans?.futuresPrice} month={snapshot.beans?.futuresMonth} color="green" />
        <PriceCard label="Cash Beans" value={snapshot.beans?.cashPrice} month="Local" color="green" />
      </div>

      {/* Basis */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Basis</h3>
          <button onClick={() => setPriceModal(true)}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700">
            Update Prices
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-lg p-3 ${snapshot.corn?.basis != null && snapshot.corn.basis < 0 ? 'bg-red-50' : 'bg-yellow-50'}`}>
            <div className="text-sm text-yellow-800 font-medium">🌽 Corn Basis</div>
            <div className="text-2xl font-bold mt-1">
              {snapshot.corn?.basis != null ? `${snapshot.corn.basis > 0 ? '+' : ''}${snapshot.corn.basis}¢` : '—'}
            </div>
            {snapshot.corn && <div className="text-xs text-gray-500 mt-1">Updated {snapshot.corn.snapshotAt.slice(0, 10)}</div>}
          </div>
          <div className={`rounded-lg p-3 ${snapshot.beans?.basis != null && snapshot.beans.basis < 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <div className="text-sm text-green-800 font-medium">🫘 Soybean Basis</div>
            <div className="text-2xl font-bold mt-1">
              {snapshot.beans?.basis != null ? `${snapshot.beans.basis > 0 ? '+' : ''}${snapshot.beans.basis}¢` : '—'}
            </div>
            {snapshot.beans && <div className="text-xs text-gray-500 mt-1">Updated {snapshot.beans.snapshotAt.slice(0, 10)}</div>}
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-700">Futures Price History</h3>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setHistoryDays(d)}
                className={`px-3 py-1 rounded text-sm ${historyDays === d ? 'bg-green-600 text-white' : 'border text-gray-600 hover:bg-gray-50'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        {chartData.length < 2 ? (
          <div className="h-48 flex items-center justify-center text-gray-400">
            Not enough data — update prices a few times to see history
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => '$' + v.toFixed(4)} />
              <Legend />
              <Line type="monotone" dataKey="corn" stroke="#ca8a04" strokeWidth={2} dot={false} name="ZC (Corn)" />
              <Line type="monotone" dataKey="beans" stroke="#16a34a" strokeWidth={2} dot={false} name="ZS (Beans)" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Alerts */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Price Alerts</h3>
        <div className="flex gap-2 flex-wrap mb-4">
          <select className="border rounded-lg px-2 py-1.5 text-sm"
            value={alertForm.crop} onChange={e => setAlertForm(f => ({ ...f, crop: e.target.value }))}>
            <option value="corn">🌽 Corn</option>
            <option value="soybeans">🫘 Soybeans</option>
          </select>
          <select className="border rounded-lg px-2 py-1.5 text-sm"
            value={alertForm.alertType} onChange={e => setAlertForm(f => ({ ...f, alertType: e.target.value }))}>
            <option value="price_above">Price Above</option>
            <option value="price_below">Price Below</option>
            <option value="basis_above">Basis Above</option>
            <option value="basis_below">Basis Below</option>
          </select>
          <input type="number" step="0.01" placeholder="Target $" className="border rounded-lg px-2 py-1.5 text-sm w-28"
            value={alertForm.targetValue} onChange={e => setAlertForm(f => ({ ...f, targetValue: e.target.value }))} />
          <input type="text" placeholder="Futures Month" className="border rounded-lg px-2 py-1.5 text-sm w-28"
            value={alertForm.futuresMonth} onChange={e => setAlertForm(f => ({ ...f, futuresMonth: e.target.value }))} />
          <button onClick={handleAddAlert}
            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700">
            Add Alert
          </button>
        </div>

        {alerts.length === 0 ? (
          <p className="text-gray-400 text-sm">No alerts set</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-left border-b">
              <tr><th className="pb-2">Crop</th><th>Type</th><th>Target</th><th>Month</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} className="border-b last:border-0">
                  <td className="py-1">{a.crop === 'corn' ? '🌽' : '🫘'} {a.crop}</td>
                  <td className="py-1 capitalize">{a.alertType.replace('_', ' ')}</td>
                  <td className="py-1 font-mono">{fmtPrice(a.targetValue)}</td>
                  <td className="py-1">{a.futuresMonth || '—'}</td>
                  <td className="py-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${a.active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {a.active ? 'Active' : 'Dismissed'}
                    </span>
                  </td>
                  <td className="py-1">
                    <div className="flex gap-2">
                      {a.active === 1 && (
                        <button onClick={() => handleDismiss(a)} className="text-gray-500 hover:underline text-xs">Dismiss</button>
                      )}
                      <button onClick={() => handleDeleteAlert(a.id)} className="text-red-500 hover:underline text-xs">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <PriceUpdateModal open={priceModal} onClose={() => setPriceModal(false)} onSaved={onRefresh} />
    </div>
  )
}

function PriceCard({ label, value, month, color }: { label: string; value?: number | null; month?: string | null; color: 'yellow' | 'green' }) {
  return (
    <div className={`bg-white rounded-xl shadow p-4 border-l-4 ${color === 'yellow' ? 'border-yellow-500' : 'border-green-600'}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-bold mt-1">{value != null ? '$' + value.toFixed(4) : '—'}</div>
      {month && <div className="text-xs text-gray-400">{month}</div>}
    </div>
  )
}
