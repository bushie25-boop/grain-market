import React, { useState } from 'react';
import type { MarketSnapshot } from '../../lib/api';

interface ElevatorData {
  name: string;
  location: string;
  distance: string;
  crops: ('corn' | 'beans')[];
  barge?: boolean;
  haulCost?: number; // $/bu extra haul cost for net-back
  cornBasis: number | null;
  beanBasis: number | null;
  notes: string;
  updated: string;
}

const DEFAULT_ELEVATORS: ElevatorData[] = [
  { name: 'Dummer Grain', location: 'Holmen WI', distance: '~15 mi', crops: ['corn','beans'], cornBasis: -35, beanBasis: -45, notes: '', updated: '' },
  { name: 'ADM', location: 'Winona MN', distance: '~25 mi', crops: ['corn','beans'], barge: true, cornBasis: -30, beanBasis: -40, notes: '', updated: '' },
  { name: 'Cargill', location: 'La Crosse WI', distance: '~35 mi', crops: ['corn','beans'], barge: true, cornBasis: -32, beanBasis: -42, notes: '', updated: '' },
  { name: 'Golden Plump', location: 'Arcadia WI', distance: '~25 mi', crops: ['corn'], cornBasis: -38, beanBasis: null, notes: '', updated: '' },
  { name: 'White Water Milling', location: 'St. Charles MN', distance: '~75 mi', crops: ['corn','beans'], haulCost: 0.15, cornBasis: -55, beanBasis: -65, notes: '', updated: '' },
];

function loadElevators(): ElevatorData[] {
  try {
    const raw = localStorage.getItem('elevatorData2');
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ELEVATORS;
}

function saveElevators(data: ElevatorData[]) {
  localStorage.setItem('elevatorData2', JSON.stringify(data));
}

interface Props {
  snapshot: MarketSnapshot | null;
}

export function Elevators({ snapshot }: Props) {
  const [elevators, setElevators] = useState<ElevatorData[]>(loadElevators);
  const [editing, setEditing] = useState<number | null>(null);
  const [editBasis, setEditBasis] = useState<{ corn: string; beans: string }>({ corn: '', beans: '' });

  const cf = snapshot?.cornFutures ?? 0;
  const sf = snapshot?.soyFutures ?? 0;

  function startEdit(i: number) {
    setEditing(i);
    setEditBasis({ corn: String(elevators[i].cornBasis ?? ''), beans: String(elevators[i].beanBasis ?? '') });
  }

  function saveEdit(i: number) {
    const updated = [...elevators];
    updated[i] = {
      ...updated[i],
      cornBasis: parseFloat(editBasis.corn) || null,
      beanBasis: parseFloat(editBasis.beans) || null,
      updated: new Date().toLocaleTimeString(),
    };
    setElevators(updated);
    saveElevators(updated);
    setEditing(null);
  }

  function updateNotes(i: number, notes: string) {
    const updated = [...elevators];
    updated[i] = { ...updated[i], notes };
    setElevators(updated);
    saveElevators(updated);
  }

  function cashPrice(basis: number | null, futures: number, haulCost = 0): number | null {
    if (basis == null || !futures) return null;
    return futures + basis / 100 - haulCost;
  }

  // Find best prices
  const cornCashes = elevators.map(el => cashPrice(el.cornBasis, cf, el.haulCost ?? 0));
  const beanCashes = elevators.map(el => cashPrice(el.beanBasis, sf, el.haulCost ?? 0));
  const bestCornCash = Math.max(...cornCashes.filter(v => v != null) as number[]);
  const bestBeanCash = Math.max(...beanCashes.filter(v => v != null) as number[]);
  const bestCornBasis = Math.max(...elevators.map(el => el.cornBasis ?? -999).filter(v => v > -999));
  const bestBeanBasis = Math.max(...elevators.map(el => el.beanBasis ?? -999).filter(v => v > -999));

  const inp = "bg-bg border border-card-border rounded px-2 py-1 text-xs font-price text-primary w-24";

  return (
    <div className="space-y-6">
      {/* Elevator cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {elevators.map((el, i) => {
          const cc = cashPrice(el.cornBasis, cf, el.haulCost ?? 0);
          const bc = cashPrice(el.beanBasis, sf, el.haulCost ?? 0);
          return (
            <div key={el.name} className="card p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-bold text-primary text-sm">{el.name}</div>
                  <div className="text-xs text-muted">{el.location} · {el.distance}</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {el.barge && <span className="text-xs bg-blue-900/50 text-blue-300 border border-blue-700 px-1.5 py-0.5 rounded">⚓ BARGE</span>}
                  {el.haulCost && <span className="text-xs text-muted">net-back −${el.haulCost}/bu</span>}
                </div>
              </div>

              <div className="flex gap-1.5 mb-3">
                {el.crops.includes('corn') && <span className="text-xs font-bold text-gold bg-gold/10 border border-gold/30 px-1.5 py-0.5 rounded">🌽</span>}
                {el.crops.includes('beans') && <span className="text-xs font-bold px-1.5 py-0.5 rounded border" style={{ color: '#C47B1C', background: 'rgba(196,123,28,0.1)', borderColor: 'rgba(196,123,28,0.3)' }}>🫘</span>}
              </div>

              {editing === i ? (
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted w-20">Corn Basis</span>
                    <input value={editBasis.corn} onChange={e => setEditBasis(p => ({ ...p, corn: e.target.value }))} className={inp} type="number" />
                    <span className="text-xs text-muted">¢</span>
                  </div>
                  {el.crops.includes('beans') && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted w-20">Bean Basis</span>
                      <input value={editBasis.beans} onChange={e => setEditBasis(p => ({ ...p, beans: e.target.value }))} className={inp} type="number" />
                      <span className="text-xs text-muted">¢</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(i)} className="text-xs px-3 py-1 rounded font-bold text-bg" style={{ background: '#D4A017' }}>Save</button>
                    <button onClick={() => setEditing(null)} className="text-xs px-3 py-1 rounded border border-card-border text-muted">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {el.crops.includes('corn') && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">🌽 Corn:</span>
                      <span className="font-price text-gold font-bold">{cc ? `$${cc.toFixed(4)}` : '—'}</span>
                      <span className="font-price text-muted">{el.cornBasis != null ? `${el.cornBasis}¢` : '—'}</span>
                    </div>
                  )}
                  {el.crops.includes('beans') && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">🫘 Beans:</span>
                      <span className="font-price font-bold" style={{ color: '#C47B1C' }}>{bc ? `$${bc.toFixed(4)}` : '—'}</span>
                      <span className="font-price text-muted">{el.beanBasis != null ? `${el.beanBasis}¢` : '—'}</span>
                    </div>
                  )}
                </div>
              )}

              {el.updated && <div className="text-xs text-muted mb-2">Updated: {el.updated}</div>}

              <textarea value={el.notes} onChange={e => updateNotes(i, e.target.value)}
                placeholder="Notes..."
                rows={2}
                className="w-full bg-bg border border-card-border rounded px-2 py-1 text-xs text-muted resize-none mb-2" />

              {editing !== i && (
                <button onClick={() => startEdit(i)}
                  className="text-xs px-3 py-1 rounded border border-card-border text-muted hover:text-primary transition-colors">
                  Update Basis
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="card p-4">
        <div className="text-xs text-muted font-bold tracking-wider mb-3">ELEVATOR COMPARISON</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted border-b border-card-border">
              <th className="text-left py-1 pr-3">Elevator</th>
              <th className="text-right py-1 pr-3">Corn Cash</th>
              <th className="text-right py-1 pr-3">Corn Basis</th>
              <th className="text-right py-1 pr-3">Bean Cash</th>
              <th className="text-right py-1 pr-3">Bean Basis</th>
              <th className="text-left py-1">Updated</th>
            </tr>
          </thead>
          <tbody>
            {elevators.map((el, i) => {
              const cc = cashPrice(el.cornBasis, cf, el.haulCost ?? 0);
              const bc = cashPrice(el.beanBasis, sf, el.haulCost ?? 0);
              const bestCC = cc != null && cc === bestCornCash;
              const bestBC = bc != null && bc === bestBeanCash;
              const bestCB = el.cornBasis != null && el.cornBasis === bestCornBasis;
              const bestBB = el.beanBasis != null && el.beanBasis === bestBeanBasis;
              return (
                <tr key={el.name} className="border-b border-card-border/40">
                  <td className="py-1.5 pr-3 text-xs">{el.name} {el.barge && '⚓'}</td>
                  <td className="py-1.5 pr-3 text-right font-price text-xs">
                    <span className={bestCC ? 'text-gold font-bold border border-gold rounded px-1' : 'text-muted'}>
                      {cc ? `$${cc.toFixed(4)}` : '—'}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 text-right font-price text-xs">
                    <span className={bestCB ? 'text-gold font-bold border border-gold rounded px-1' : 'text-muted'}>
                      {el.cornBasis != null ? `${el.cornBasis}¢` : '—'}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 text-right font-price text-xs">
                    <span className={bestBC ? 'font-bold border rounded px-1' : 'text-muted'} style={bestBC ? { color: '#C47B1C', borderColor: '#C47B1C' } : {}}>
                      {bc ? `$${bc.toFixed(4)}` : '—'}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 text-right font-price text-xs">
                    <span className={bestBB ? 'font-bold border rounded px-1' : 'text-muted'} style={bestBB ? { color: '#C47B1C', borderColor: '#C47B1C' } : {}}>
                      {el.beanBasis != null ? `${el.beanBasis}¢` : '—'}
                    </span>
                  </td>
                  <td className="py-1.5 text-xs text-muted">{el.updated || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
