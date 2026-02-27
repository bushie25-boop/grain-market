import { useState } from 'react'
import type { Contract } from '../lib/api'
import { fmtBushels, fmtPrice } from '../lib/utils'
import ContractModal from './ContractModal'
import { createContract, updateContract, deleteContract } from '../lib/api'

interface Props {
  contracts: Contract[]
  onRefresh: () => void
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function Contracts({ contracts, onRefresh }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Contract | null>(null)
  const [cropFilter, setCropFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const filtered = contracts.filter(c =>
    (cropFilter === 'all' || c.crop === cropFilter) &&
    (statusFilter === 'all' || c.status === statusFilter) &&
    (typeFilter === 'all' || c.contractType === typeFilter)
  )

  const handleSave = async (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editing) {
      await updateContract(editing.id, data)
    } else {
      await createContract(data)
    }
    setModalOpen(false)
    setEditing(null)
    onRefresh()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contract?')) return
    await deleteContract(id)
    onRefresh()
  }

  const handleDeliver = async (c: Contract) => {
    await updateContract(c.id, { ...c, status: 'delivered' })
    onRefresh()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <select className="border rounded-lg px-3 py-1.5 text-sm"
            value={cropFilter} onChange={e => setCropFilter(e.target.value)}>
            <option value="all">All Crops</option>
            <option value="corn">🌽 Corn</option>
            <option value="soybeans">🫘 Soybeans</option>
          </select>
          <select className="border rounded-lg px-3 py-1.5 text-sm"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="border rounded-lg px-3 py-1.5 text-sm"
            value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            {['cash','basis','htc','futures_only','dp','option'].map(t =>
              <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }}
          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700">
          + Add Contract
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 text-left">
            <tr>
              <th className="px-4 py-3">Crop</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Bushels</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Basis</th>
              <th className="px-4 py-3">Fut. Month</th>
              <th className="px-4 py-3">Elevator</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-400">No contracts found</td></tr>
            )}
            {filtered.map(c => (
              <tr key={c.id}
                className={`border-t hover:bg-gray-50 ${c.crop === 'corn' ? 'border-l-2 border-l-yellow-400' : 'border-l-2 border-l-green-500'}`}>
                <td className="px-4 py-2 font-medium">{c.crop === 'corn' ? '🌽' : '🫘'} {c.crop}</td>
                <td className="px-4 py-2 capitalize">{c.contractType}</td>
                <td className="px-4 py-2">{fmtBushels(c.bushels)}</td>
                <td className="px-4 py-2 font-mono">{fmtPrice(c.price)}</td>
                <td className="px-4 py-2 font-mono">{c.basis != null ? `${c.basis > 0 ? '+' : ''}${c.basis}¢` : '—'}</td>
                <td className="px-4 py-2">{c.futuresMonth || '—'}</td>
                <td className="px-4 py-2">{c.elevator}</td>
                <td className="px-4 py-2 text-xs text-gray-500">
                  {c.deliveryStart || '—'}{c.deliveryEnd ? ` → ${c.deliveryEnd}` : ''}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || ''}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(c); setModalOpen(true) }}
                      className="text-blue-600 hover:underline text-xs">Edit</button>
                    {c.status === 'open' && (
                      <button onClick={() => handleDeliver(c)}
                        className="text-green-600 hover:underline text-xs">Deliver</button>
                    )}
                    <button onClick={() => handleDelete(c.id)}
                      className="text-red-500 hover:underline text-xs">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContractModal open={modalOpen} contract={editing}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave} />
    </div>
  )
}
