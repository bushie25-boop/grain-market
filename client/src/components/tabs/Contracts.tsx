import React, { useState } from 'react';
import type { Contract } from '../../lib/api';

const TYPE_COLORS: Record<string, string> = {
  Cash: '#4CAF50',
  Basis: '#2196F3',
  HTA: '#9C27B0',
  DP: '#607D8B',
  'Futures-Only': '#FF9800',
  'Min-Price': '#FF5722',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: '#1a3a1a', text: '#4CAF50' },
  delivered: { bg: '#2a2a2a', text: '#8FA88F' },
  cancelled: { bg: '#3a1a1a', text: '#E53935' },
};

function parseCropYear(c: Contract): string {
  try {
    const n = JSON.parse(c.notes ?? '{}');
    if (n.cropYear) return n.cropYear;
  } catch {}
  if (c.futuresMonth) return `20${c.futuresMonth.slice(-2)}`;
  return '2026';
}

interface Props {
  contracts: Contract[];
  onAdd: () => void;
  onEdit: (c: Contract) => void;
  onDeliver: (c: Contract) => void;
  onDelete: (c: Contract) => void;
}

export function Contracts({ contracts, onAdd, onEdit, onDeliver, onDelete }: Props) {
  const [filterCrop, setFilterCrop] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = contracts.filter(c => {
    if (filterCrop !== 'all' && c.crop !== filterCrop) return false;
    if (filterYear !== 'all' && parseCropYear(c) !== filterYear) return false;
    if (filterType !== 'all' && c.contractType !== filterType) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const corn = contracts.filter(c => c.crop === 'corn' && c.status === 'open');
  const beans = contracts.filter(c => c.crop === 'soybeans' && c.status === 'open');
  const totalCornBu = corn.reduce((s, c) => s + c.bushels, 0);
  const totalBeansBu = beans.reduce((s, c) => s + c.bushels, 0);

  const sel = "bg-bg border border-card-border rounded px-2 py-1.5 text-xs text-primary";

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="card p-3 flex flex-wrap gap-6 text-xs">
        <span><span className="text-gold font-bold">🌽 CORN:</span> <span className="font-price text-primary">{totalCornBu.toLocaleString()} bu</span> <span className="text-muted">({corn.length} contracts)</span></span>
        <span><span style={{ color: '#C47B1C' }} className="font-bold">🫘 BEANS:</span> <span className="font-price text-primary">{totalBeansBu.toLocaleString()} bu</span> <span className="text-muted">({beans.length} contracts)</span></span>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 items-center">
        <select className={sel} value={filterCrop} onChange={e => setFilterCrop(e.target.value)}>
          <option value="all">All Crops</option>
          <option value="corn">🌽 Corn</option>
          <option value="soybeans">🫘 Soybeans</option>
        </select>
        <select className={sel} value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="all">All Years</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
        </select>
        <select className={sel} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {['Cash','Basis','HTA','DP','Futures-Only','Min-Price'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select className={sel} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <div className="flex-1" />
        <button onClick={onAdd}
          className="px-4 py-1.5 rounded text-xs font-bold text-bg"
          style={{ background: '#D4A017' }}>
          + Add Contract
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted border-b border-card-border">
              {['#ID','Crop','Year','Type','Bushels','Futures','Basis','Cash Price','Elevator','Delivery','Status','Actions'].map(h => (
                <th key={h} className="text-left px-3 py-2 font-normal whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={12} className="text-center text-muted py-8">No contracts found.</td></tr>
            )}
            {filtered.map(c => {
              const cash = c.price + (c.basis ?? 0) / 100;
              const sc = STATUS_COLORS[c.status] ?? STATUS_COLORS.open;
              const tc = TYPE_COLORS[c.contractType] ?? '#8FA88F';
              return (
                <tr key={c.id} className="border-b border-card-border/40 hover:bg-card/50 transition-colors">
                  <td className="px-3 py-2 font-price text-xs text-muted">{c.id.slice(0,8)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {c.crop === 'corn'
                      ? <span className="text-xs font-bold text-gold">🌽 CORN</span>
                      : <span className="text-xs font-bold" style={{ color: '#C47B1C' }}>🫘 BEANS</span>}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted font-price">{parseCropYear(c)}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: tc, background: tc + '22', border: `1px solid ${tc}44` }}>
                      {c.contractType}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-price text-right">{c.bushels.toLocaleString()}</td>
                  <td className="px-3 py-2 font-price text-right">${c.price.toFixed(4)}</td>
                  <td className="px-3 py-2 font-price text-right text-muted">{c.basis != null ? `${c.basis > 0 ? '+' : ''}${c.basis}¢` : '—'}</td>
                  <td className="px-3 py-2 font-price text-right text-gold font-bold">${cash.toFixed(4)}</td>
                  <td className="px-3 py-2 text-xs text-muted whitespace-nowrap">{c.elevator}</td>
                  <td className="px-3 py-2 text-xs text-muted whitespace-nowrap">{c.deliveryEnd ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: sc.text, background: sc.bg }}>
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(c)} title="Edit" className="text-muted hover:text-gold transition-colors px-1">✏️</button>
                      <button onClick={() => onDeliver(c)} title="Mark Delivered" className="text-muted hover:text-up transition-colors px-1">✓</button>
                      <button onClick={() => onDelete(c)} title="Delete" className="text-muted hover:text-down transition-colors px-1">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
