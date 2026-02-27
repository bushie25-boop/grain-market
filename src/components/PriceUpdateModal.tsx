import { useState } from 'react'
import { saveSnapshots } from '../lib/api'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function PriceUpdateModal({ open, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    zcPrice: '', zsPrice: '', cornCash: '', beansCash: '',
    zcMonth: 'ZCZ25', zsMonth: 'ZSX25',
  })
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const zcF = parseFloat(form.zcPrice)
      const zsF = parseFloat(form.zsPrice)
      const cornC = parseFloat(form.cornCash)
      const beansC = parseFloat(form.beansCash)
      await saveSnapshots([
        { crop: 'corn', futuresMonth: form.zcMonth, futuresPrice: zcF, cashPrice: cornC, basis: Math.round((cornC - zcF) * 100) },
        { crop: 'soybeans', futuresMonth: form.zsMonth, futuresPrice: zsF, cashPrice: beansC, basis: Math.round((beansC - zsF) * 100) },
      ])
      onSaved()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">Update Market Prices</h2>
        <p className="text-sm text-gray-500 mb-4">Manually enter current prices. Basis is auto-calculated.</p>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-yellow-700 mb-2">🌽 Corn</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600">ZC Futures Month</span>
                <input className="mt-1 block w-full border rounded-lg px-3 py-2"
                  value={form.zcMonth} onChange={e => set('zcMonth', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">ZC Price ($/bu)</span>
                <input type="number" step="0.0025" className="mt-1 block w-full border rounded-lg px-3 py-2"
                  value={form.zcPrice} onChange={e => set('zcPrice', e.target.value)} placeholder="4.5500" />
              </label>
              <label className="block col-span-2">
                <span className="text-sm text-gray-600">Local Cash Corn ($/bu)</span>
                <input type="number" step="0.0025" className="mt-1 block w-full border rounded-lg px-3 py-2"
                  value={form.cornCash} onChange={e => set('cornCash', e.target.value)} placeholder="4.3000" />
              </label>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">🫘 Soybeans</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600">ZS Futures Month</span>
                <input className="mt-1 block w-full border rounded-lg px-3 py-2"
                  value={form.zsMonth} onChange={e => set('zsMonth', e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">ZS Price ($/bu)</span>
                <input type="number" step="0.0025" className="mt-1 block w-full border rounded-lg px-3 py-2"
                  value={form.zsPrice} onChange={e => set('zsPrice', e.target.value)} placeholder="10.5000" />
              </label>
              <label className="block col-span-2">
                <span className="text-sm text-gray-600">Local Cash Beans ($/bu)</span>
                <input type="number" step="0.0025" className="mt-1 block w-full border rounded-lg px-3 py-2"
                  value={form.beansCash} onChange={e => set('beansCash', e.target.value)} placeholder="10.2000" />
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Prices'}
          </button>
        </div>
      </div>
    </div>
  )
}
