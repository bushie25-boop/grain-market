import React, { useState } from 'react';
import type { Contract, MarketSnapshot } from '../../lib/api';

function parseCropYear(c: Contract): string {
  try {
    const n = JSON.parse(c.notes ?? '{}');
    if (n.cropYear) return n.cropYear;
  } catch {}
  if (c.futuresMonth) {
    const yr = c.futuresMonth.slice(-2);
    return `20${yr}`;
  }
  return '2026';
}

function getCropYearContracts(contracts: Contract[], crop: string, year: string) {
  return contracts.filter(c => c.crop === crop && c.status === 'open' && parseCropYear(c) === year);
}

export function Dashboard({ contracts, snapshot }: { contracts: Contract[]; snapshot: MarketSnapshot | null }) {
  const [cornEst, setCornEst] = useState<number>(() => parseInt(localStorage.getItem('estCorn') ?? '50000'));
  const [beanEst, setBeanEst] = useState<number>(() => parseInt(localStorage.getItem('estBeans') ?? '15000'));
  const [editingCorn, setEditingCorn] = useState(false);
  const [editingBeans, setEditingBeans] = useState(false);

  const cornContracts = contracts.filter(c => c.crop === 'corn' && c.status === 'open');
  const beanContracts = contracts.filter(c => c.crop === 'soybeans' && c.status === 'open');

  const totalCorn = cornContracts.reduce((s, c) => s + c.bushels, 0);
  const totalBeans = beanContracts.reduce((s, c) => s + c.bushels, 0);
  const avgCorn = cornContracts.length ? cornContracts.reduce((s, c) => s + c.price, 0) / cornContracts.length : 0;
  const avgBeans = beanContracts.length ? beanContracts.reduce((s, c) => s + c.price, 0) / beanContracts.length : 0;

  const corn26 = getCropYearContracts(contracts, 'corn', '2026');
  const beans26 = getCropYearContracts(contracts, 'soybeans', '2026');
  const totalCorn26 = corn26.reduce((s, c) => s + c.bushels, 0);
  const totalBeans26 = beans26.reduce((s, c) => s + c.bushels, 0);
  const avgCorn26 = corn26.length ? corn26.reduce((s, c) => s + c.price, 0) / corn26.length : 0;
  const avgBeans26 = beans26.length ? beans26.reduce((s, c) => s + c.price, 0) / beans26.length : 0;

  const now = new Date();
  const thisMonth = contracts.filter(c => {
    if (!c.deliveryEnd) return false;
    const d = new Date(c.deliveryEnd);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const statCards = [
    { label: 'Total Corn Contracted', value: totalCorn.toLocaleString(), unit: 'bu', accent: '#D4A017' },
    { label: 'Total Soybean Contracted', value: totalBeans.toLocaleString(), unit: 'bu', accent: '#C47B1C' },
    { label: 'Avg Corn Price', value: avgCorn ? `$${avgCorn.toFixed(4)}` : '—', unit: '/bu', accent: '#D4A017' },
    { label: 'Avg Soy Price', value: avgBeans ? `$${avgBeans.toFixed(4)}` : '—', unit: '/bu', accent: '#C47B1C' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="card p-4" style={{ borderLeft: `3px solid ${card.accent}` }}>
            <div className="text-xs text-muted mb-1">{card.label}</div>
            <div className="font-price text-2xl font-bold" style={{ color: card.accent }}>{card.value}</div>
            <div className="text-xs text-muted">{card.unit}</div>
          </div>
        ))}
      </div>

      {/* Summary bars */}
      <div className="card p-4 space-y-3">
        <div className="text-xs text-muted font-bold tracking-wider mb-2">2026 CROP YEAR SUMMARY</div>
        {/* Corn */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-bold text-gold">🌽 CORN 2026:</span>
          <span className="font-price text-primary">{totalCorn26.toLocaleString()} bu</span>
          <span className="text-muted text-xs">|</span>
          <span className="text-xs text-muted">{cornEst ? Math.round(totalCorn26 / cornEst * 100) : 0}% of est.</span>
          <span className="text-muted text-xs">|</span>
          <span className="font-price text-xs text-gold">Avg: ${avgCorn26.toFixed(4)}</span>
          <span className="text-muted text-xs">|</span>
          <span className="text-xs text-muted">Est:</span>
          {editingCorn ? (
            <input type="number" defaultValue={cornEst}
              className="w-24 bg-bg border border-card-border rounded px-2 py-0.5 text-xs font-price text-primary"
              onBlur={e => { const v = parseInt(e.target.value); setCornEst(v); localStorage.setItem('estCorn', String(v)); setEditingCorn(false); }}
              autoFocus />
          ) : (
            <button onClick={() => setEditingCorn(true)} className="text-xs text-muted underline font-price">{cornEst.toLocaleString()} bu ✏️</button>
          )}
        </div>
        {/* Progress bar corn */}
        <div className="h-1.5 rounded bg-card-border overflow-hidden">
          <div className="h-full rounded" style={{ width: `${Math.min(100, cornEst ? totalCorn26 / cornEst * 100 : 0)}%`, background: '#D4A017' }} />
        </div>
        {/* Beans */}
        <div className="flex items-center gap-4 flex-wrap mt-2">
          <span className="text-xs font-bold" style={{ color: '#C47B1C' }}>🫘 BEANS 2026:</span>
          <span className="font-price text-primary">{totalBeans26.toLocaleString()} bu</span>
          <span className="text-muted text-xs">|</span>
          <span className="text-xs text-muted">{beanEst ? Math.round(totalBeans26 / beanEst * 100) : 0}% of est.</span>
          <span className="text-muted text-xs">|</span>
          <span className="font-price text-xs" style={{ color: '#C47B1C' }}>Avg: ${avgBeans26.toFixed(4)}</span>
          <span className="text-muted text-xs">|</span>
          <span className="text-xs text-muted">Est:</span>
          {editingBeans ? (
            <input type="number" defaultValue={beanEst}
              className="w-24 bg-bg border border-card-border rounded px-2 py-0.5 text-xs font-price text-primary"
              onBlur={e => { const v = parseInt(e.target.value); setBeanEst(v); localStorage.setItem('estBeans', String(v)); setEditingBeans(false); }}
              autoFocus />
          ) : (
            <button onClick={() => setEditingBeans(true)} className="text-xs text-muted underline font-price">{beanEst.toLocaleString()} bu ✏️</button>
          )}
        </div>
        <div className="h-1.5 rounded bg-card-border overflow-hidden">
          <div className="h-full rounded" style={{ width: `${Math.min(100, beanEst ? totalBeans26 / beanEst * 100 : 0)}%`, background: '#C47B1C' }} />
        </div>
      </div>

      {/* Delivering this month */}
      <div className="card p-4">
        <div className="text-xs text-muted font-bold tracking-wider mb-3">
          DELIVERING THIS MONTH — {now.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase()}
        </div>
        {thisMonth.length === 0 ? (
          <div className="text-muted text-sm">No contracts delivering this month.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted border-b border-card-border">
                <th className="text-left py-1 pr-3">Crop</th>
                <th className="text-left py-1 pr-3">Type</th>
                <th className="text-right py-1 pr-3">Bushels</th>
                <th className="text-right py-1 pr-3">Cash Price</th>
                <th className="text-left py-1 pr-3">Elevator</th>
                <th className="text-left py-1">Delivery End</th>
              </tr>
            </thead>
            <tbody>
              {thisMonth.map(c => {
                const cash = c.price + (c.basis ?? 0) / 100;
                return (
                  <tr key={c.id} className="border-b border-card-border/40 hover:bg-card/50">
                    <td className="py-1.5 pr-3">
                      {c.crop === 'corn'
                        ? <span className="text-xs font-bold text-gold">🌽 CORN</span>
                        : <span className="text-xs font-bold" style={{ color: '#C47B1C' }}>🫘 BEANS</span>}
                    </td>
                    <td className="py-1.5 pr-3 text-xs text-muted">{c.contractType}</td>
                    <td className="py-1.5 pr-3 text-right font-price">{c.bushels.toLocaleString()}</td>
                    <td className="py-1.5 pr-3 text-right font-price text-gold">${cash.toFixed(4)}</td>
                    <td className="py-1.5 pr-3 text-xs text-muted">{c.elevator}</td>
                    <td className="py-1.5 text-xs text-muted">{c.deliveryEnd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
