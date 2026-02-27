import React, { useState, useEffect } from 'react';
import type { Contract } from '../lib/api';

const ELEVATORS = [
  'Dummer/Holmen',
  'ADM/Winona',
  'Cargill/La Crosse',
  'Golden Plump/Arcadia',
  'White Water/St. Charles',
];

const CORN_MONTHS = ['Dec', 'Mar', 'May', 'Jul', 'Sep'];
const BEAN_MONTHS = ['Nov', 'Jan', 'Mar', 'May'];
const CONTRACT_TYPES = ['Cash', 'Basis', 'HTA', 'DP', 'Futures-Only', 'Min-Price'];
const CROP_YEARS = ['2025', '2026', '2027'];

interface Props {
  contract?: Contract | null;
  onSave: (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export function ContractModal({ contract, onSave, onClose }: Props) {
  const [crop, setCrop] = useState(contract?.crop ?? 'corn');
  const [cropYear, setCropYear] = useState('2026');
  const [contractType, setContractType] = useState(contract?.contractType ?? 'Cash');
  const [bushels, setBushels] = useState(String(contract?.bushels ?? ''));
  const [futuresMonth, setFuturesMonth] = useState(contract?.futuresMonth ?? '');
  const [price, setPrice] = useState(String(contract?.price ?? ''));
  const [basis, setBasis] = useState(String(contract?.basis ?? ''));
  const [elevator, setElevator] = useState(contract?.elevator ?? ELEVATORS[0]);
  const [deliveryStart, setDeliveryStart] = useState(contract?.deliveryStart ?? '');
  const [deliveryEnd, setDeliveryEnd] = useState(contract?.deliveryEnd ?? '');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState(contract?.status ?? 'open');

  // parse cropYear and notes from contract.notes JSON if present
  useEffect(() => {
    if (contract?.notes) {
      try {
        const parsed = JSON.parse(contract.notes);
        setCropYear(parsed.cropYear ?? '2026');
        setNotes(parsed.notes ?? '');
      } catch {
        setNotes(contract.notes);
      }
    }
  }, [contract]);

  const months = crop === 'corn' ? CORN_MONTHS : BEAN_MONTHS;
  const futuresPrice = parseFloat(price) || 0;
  const basisVal = parseFloat(basis) || 0;
  const cashPrice = futuresPrice + basisVal / 100;

  function handleSave() {
    const notesPayload = JSON.stringify({ cropYear, notes });
    onSave({
      crop,
      contractType,
      bushels: parseFloat(bushels) || 0,
      price: futuresPrice,
      basis: basisVal,
      futuresMonth: futuresMonth || `${months[0]}${cropYear.slice(2)}`,
      elevator,
      deliveryStart: deliveryStart || null,
      deliveryEnd: deliveryEnd || null,
      status,
      notes: notesPayload,
    } as any);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">{contract ? 'Edit Contract' : 'New Contract'}</h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-xl">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Crop */}
          <div>
            <label className="text-xs text-muted mb-1 block">Crop</label>
            <select value={crop} onChange={e => setCrop(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary">
              <option value="corn">🌽 Corn</option>
              <option value="soybeans">🫘 Soybeans</option>
            </select>
          </div>

          {/* Crop Year */}
          <div>
            <label className="text-xs text-muted mb-1 block">Crop Year</label>
            <select value={cropYear} onChange={e => setCropYear(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary">
              {CROP_YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>

          {/* Contract Type */}
          <div>
            <label className="text-xs text-muted mb-1 block">Contract Type</label>
            <select value={contractType} onChange={e => setContractType(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary">
              {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Bushels */}
          <div>
            <label className="text-xs text-muted mb-1 block">Bushels</label>
            <input type="number" value={bushels} onChange={e => setBushels(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary font-price" />
          </div>

          {/* Futures Month */}
          <div>
            <label className="text-xs text-muted mb-1 block">Futures Month</label>
            <select value={futuresMonth} onChange={e => setFuturesMonth(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary">
              {months.map(m => {
                const val = `${m}${cropYear.slice(2)}`;
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
          </div>

          {/* Futures Price */}
          <div>
            <label className="text-xs text-muted mb-1 block">Futures Price ($/bu)</label>
            <input type="number" step="0.0025" value={price} onChange={e => setPrice(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary font-price" />
          </div>

          {/* Basis */}
          <div>
            <label className="text-xs text-muted mb-1 block">Basis (¢, signed)</label>
            <input type="number" value={basis} onChange={e => setBasis(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary font-price" />
          </div>

          {/* Cash Price (computed) */}
          <div>
            <label className="text-xs text-muted mb-1 block">Cash Price (auto)</label>
            <div className="bg-bg border border-card-border rounded px-3 py-2 text-gold font-price">
              ${cashPrice.toFixed(4)}
            </div>
          </div>

          {/* Elevator */}
          <div className="col-span-2">
            <label className="text-xs text-muted mb-1 block">Elevator</label>
            <select value={elevator} onChange={e => setElevator(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary">
              {ELEVATORS.map(el => <option key={el}>{el}</option>)}
            </select>
          </div>

          {/* Delivery dates */}
          <div>
            <label className="text-xs text-muted mb-1 block">Delivery Start</label>
            <input type="date" value={deliveryStart} onChange={e => setDeliveryStart(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary" />
          </div>
          <div>
            <label className="text-xs text-muted mb-1 block">Delivery End</label>
            <input type="date" value={deliveryEnd} onChange={e => setDeliveryEnd(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary" />
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-muted mb-1 block">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary">
              <option value="open">Open</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="text-xs text-muted mb-1 block">Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary resize-none" />
          </div>
        </div>

        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onClose}
            className="px-4 py-2 border border-card-border rounded text-muted hover:text-primary">
            Cancel
          </button>
          <button onClick={handleSave}
            className="px-4 py-2 rounded font-bold text-bg"
            style={{ background: '#D4A017' }}>
            {contract ? 'Save Changes' : 'Add Contract'}
          </button>
        </div>
      </div>
    </div>
  );
}
