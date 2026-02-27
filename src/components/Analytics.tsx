import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import type { Contract, MarketSnapshot } from '../lib/api'
import { fmtCurrency, fmtBushels, fmtPrice } from '../lib/utils'

interface Props {
  contracts: Contract[]
  snapshot: { corn: MarketSnapshot | null; beans: MarketSnapshot | null }
}

const EST_CROP = { corn: 50000, soybeans: 20000 }

export default function Analytics({ contracts, snapshot }: Props) {
  const open = contracts.filter(c => c.status === 'open')

  const soldVsUnsold = useMemo(() => {
    const cornSold = open.filter(c => c.crop === 'corn').reduce((s, c) => s + c.bushels, 0)
    const beansSold = open.filter(c => c.crop === 'soybeans').reduce((s, c) => s + c.bushels, 0)
    return [
      { name: 'Corn', sold: cornSold, unsold: Math.max(0, EST_CROP.corn - cornSold) },
      { name: 'Soybeans', sold: beansSold, unsold: Math.max(0, EST_CROP.soybeans - beansSold) },
    ]
  }, [open])

  const avgPriceByType = useMemo(() => {
    const groups: Record<string, { bu: number; rev: number }> = {}
    open.forEach(c => {
      const k = `${c.crop}-${c.contractType}`
      if (!groups[k]) groups[k] = { bu: 0, rev: 0 }
      groups[k].bu += c.bushels
      groups[k].rev += c.price * c.bushels
    })
    return Object.entries(groups).map(([k, v]) => ({
      name: k,
      avgPrice: v.bu > 0 ? v.rev / v.bu : 0,
    }))
  }, [open])

  const revenue = useMemo(() => {
    const contracted = open.reduce((s, c) => s + c.price * c.bushels, 0)
    const cornMkt = snapshot.corn?.cashPrice || 0
    const beansMkt = snapshot.beans?.cashPrice || 0
    const potentialUncontracted =
      Math.max(0, EST_CROP.corn - open.filter(c => c.crop === 'corn').reduce((s, c) => s + c.bushels, 0)) * cornMkt +
      Math.max(0, EST_CROP.soybeans - open.filter(c => c.crop === 'soybeans').reduce((s, c) => s + c.bushels, 0)) * beansMkt
    return { contracted, potentialUncontracted, total: contracted + potentialUncontracted }
  }, [open, snapshot])

  // Best/worst contracts
  const sortedByPrice = [...open].sort((a, b) => b.price - a.price)
  const best = sortedByPrice.slice(0, 3)
  const worst = sortedByPrice.slice(-3).reverse()

  return (
    <div className="p-6 space-y-6">
      {/* Revenue Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-600">
          <div className="text-sm text-gray-500">Contracted Revenue</div>
          <div className="text-2xl font-bold mt-1">{fmtCurrency(revenue.contracted)}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-400">
          <div className="text-sm text-gray-500">Potential (Uncontracted)</div>
          <div className="text-2xl font-bold mt-1">{fmtCurrency(revenue.potentialUncontracted)}</div>
          <div className="text-xs text-gray-400">At current market prices</div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-500">Total Potential</div>
          <div className="text-2xl font-bold mt-1">{fmtCurrency(revenue.total)}</div>
        </div>
      </div>

      {/* Sold vs Unsold */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Sold vs Unsold Bushels</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={soldVsUnsold}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={v => (v / 1000).toFixed(0) + 'k'} />
            <Tooltip formatter={(v: number) => fmtBushels(v)} />
            <Legend />
            <Bar dataKey="sold" fill="#16a34a" name="Contracted" stackId="a" />
            <Bar dataKey="unsold" fill="#d1d5db" name="Uncontracted" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Avg Price by Type */}
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-700 mb-3">Avg Price by Crop & Contract Type</h3>
        {avgPriceByType.length === 0 ? (
          <p className="text-gray-400 text-sm">No contract data</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgPriceByType}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} tickFormatter={v => '$' + v.toFixed(2)} />
              <Tooltip formatter={(v: number) => fmtPrice(v)} />
              <Bar dataKey="avgPrice" fill="#16a34a" name="Avg Price" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Best / Worst */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-green-700 mb-2">🏆 Best Contracts</h3>
          {best.length === 0 ? <p className="text-gray-400 text-sm">No data</p> : (
            <table className="w-full text-sm">
              <tbody>
                {best.map(c => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-1">{c.crop === 'corn' ? '🌽' : '🫘'}</td>
                    <td className="py-1">{c.elevator}</td>
                    <td className="py-1 font-mono font-bold text-green-700">{fmtPrice(c.price)}</td>
                    <td className="py-1 text-gray-500">{fmtBushels(c.bushels)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold text-red-700 mb-2">📉 Worst Contracts</h3>
          {worst.length === 0 ? <p className="text-gray-400 text-sm">No data</p> : (
            <table className="w-full text-sm">
              <tbody>
                {worst.map(c => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-1">{c.crop === 'corn' ? '🌽' : '🫘'}</td>
                    <td className="py-1">{c.elevator}</td>
                    <td className="py-1 font-mono font-bold text-red-600">{fmtPrice(c.price)}</td>
                    <td className="py-1 text-gray-500">{fmtBushels(c.bushels)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
