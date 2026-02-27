import { useState, useEffect } from 'react'
import type { Contract } from '../lib/api'

interface Props {
  open: boolean
  contract?: Contract | null
  onClose: () => void
  onSave: (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void
}

const CROPS = ['corn', 'soybeans']
const TYPES = ['cash', 'basis', 'htc', 'futures_only', 'dp', 'option']
const STATUSES = ['open', 'delivered', 'cancelled']

const empty = {
  crop: 'corn', contractType: 'cash', bushels: 0, price: 0, basis: 0,
  futuresMonth: '', elevator: '', deliveryStart: '', deliveryEnd: '',
  status: 'open', notes: '', companyId: 'root-risk',
}

export default function ContractModal({ open, contract, onClose, onSave }: Props) {
  const [form, setForm] = useState({ ...empty })

  useEffect(() => {
    if (contract) {
      setForm({
        crop: contract.crop,
        contractType: contract.contractType,
        bushels: contract.bushels,
        price: contract.price,
        basis: contract.basis ?? 0,
        futuresMonth: contract.futuresMonth ?? '',
        elevator: contract.elevator,
        deliveryStart: contract.deliveryStart ?? '',
        deliveryEnd: contract.deliveryEnd ?? '',
        status: contract.status,
        notes: contract.notes ?? '',
        companyId: contract.companyId ?? 'root-risk',
      })
    } else {
      setForm({ ...empty })
    }
  }, [contract, open])

  if (!open) return null

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...form,
      bushels: Number(form.bushels),
      price: Number(form.price),
      basis: form.basis != null ? Number(form.basis) : null,
    } as Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{contract ? 'Edit Contract' : 'Add Contract'}</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Crop</span>
              <select className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.crop} onChange={e => set('crop', e.target.value)}>
                {CROPS.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Type</span>
              <select className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.contractType} onChange={e => set('contractType', e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Bushels</span>
              <input type="number" className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.bushels} onChange={e => set('bushels', e.target.value)} required />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Price ($/bu)</span>
              <input type="number" step="0.0001" className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.price} onChange={e => set('price', e.target.value)} required />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Basis (¢)</span>
              <input type="number" step="0.25" className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.basis ?? ''} onChange={e => set('basis', e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Futures Month</span>
              <input type="text" placeholder="ZCZ25" className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.futuresMonth} onChange={e => set('futuresMonth', e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Elevator / Buyer</span>
            <input type="text" className="mt-1 block w-full border rounded-lg px-3 py-2"
              value={form.elevator} onChange={e => set('elevator', e.target.value)} required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Delivery Start</span>
              <input type="date" className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.deliveryStart} onChange={e => set('deliveryStart', e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Delivery End</span>
              <input type="date" className="mt-1 block w-full border rounded-lg px-3 py-2"
                value={form.deliveryEnd} onChange={e => set('deliveryEnd', e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Status</span>
            <select className="mt-1 block w-full border rounded-lg px-3 py-2"
              value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Notes</span>
            <textarea className="mt-1 block w-full border rounded-lg px-3 py-2 h-20 resize-none"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700">
              {contract ? 'Save Changes' : 'Add Contract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
