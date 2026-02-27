import React, { useState } from 'react';
import type { Contract } from '../../lib/api';

type Crop = 'corn' | 'soybeans';

interface Milestone {
  id: string;
  name: string;
  targetDate: string;
  pctToSell: number;
  targetFutures: number;
  targetBasis: number;
  actualPct: number;
  status: 'hit' | 'upcoming' | 'behind';
}

function defaultMilestones(crop: Crop): Milestone[] {
  if (crop === 'corn') return [
    { id: '1', name: 'Pre-plant hedge', targetDate: '2026-03-01', pctToSell: 20, targetFutures: 4.80, targetBasis: -35, actualPct: 0, status: 'upcoming' },
    { id: '2', name: 'Spring rally', targetDate: '2026-05-01', pctToSell: 15, targetFutures: 5.00, targetBasis: -30, actualPct: 0, status: 'upcoming' },
    { id: '3', name: 'Summer high', targetDate: '2026-07-01', pctToSell: 20, targetFutures: 5.20, targetBasis: -28, actualPct: 0, status: 'upcoming' },
    { id: '4', name: 'Harvest', targetDate: '2026-10-01', pctToSell: 30, targetFutures: 4.60, targetBasis: -40, actualPct: 0, status: 'upcoming' },
    { id: '5', name: 'Post-harvest storage', targetDate: '2026-12-01', pctToSell: 15, targetFutures: 4.75, targetBasis: -32, actualPct: 0, status: 'upcoming' },
  ];
  return [
    { id: '1', name: 'Pre-plant hedge', targetDate: '2026-03-01', pctToSell: 25, targetFutures: 10.80, targetBasis: -45, actualPct: 0, status: 'upcoming' },
    { id: '2', name: 'Summer high', targetDate: '2026-07-01', pctToSell: 30, targetFutures: 11.20, targetBasis: -40, actualPct: 0, status: 'upcoming' },
    { id: '3', name: 'Harvest', targetDate: '2026-10-01', pctToSell: 30, targetFutures: 10.40, targetBasis: -48, actualPct: 0, status: 'upcoming' },
    { id: '4', name: 'Post-harvest', targetDate: '2026-12-01', pctToSell: 15, targetFutures: 10.60, targetBasis: -42, actualPct: 0, status: 'upcoming' },
  ];
}

interface Props {
  contracts: Contract[];
}

export function MarketingPlan({ contracts }: Props) {
  const [crop, setCrop] = useState<Crop>('corn');
  const [estProd, setEstProd] = useState(() => parseInt(localStorage.getItem(`estProd_${crop}`) ?? '50000'));
  const [costProd, setCostProd] = useState(() => parseFloat(localStorage.getItem(`costProd_${crop}`) ?? '4.20'));
  const [targetMargin, setTargetMargin] = useState(() => parseFloat(localStorage.getItem(`targetMargin_${crop}`) ?? '15'));
  const [milestones] = useState<Record<Crop, Milestone[]>>({
    corn: defaultMilestones('corn'),
    soybeans: defaultMilestones('soybeans'),
  });

  const cropContracts = contracts.filter(c => c.crop === crop && c.status === 'open');
  const totalSold = cropContracts.reduce((s, c) => s + c.bushels, 0);
  const pctSold = estProd > 0 ? (totalSold / estProd) * 100 : 0;
  const targetPct = 50; // simple target: 50% by now
  const progressColor = pctSold >= 60 ? '#4CAF50' : pctSold >= 30 ? '#D4A017' : '#E53935';

  const ms = milestones[crop];

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-5">
      {/* Crop toggle */}
      <div className="flex gap-2">
        {(['corn', 'soybeans'] as Crop[]).map(c => (
          <button key={c} onClick={() => setCrop(c)}
            className="px-4 py-1.5 rounded text-xs font-bold border transition-colors"
            style={crop === c
              ? { background: c === 'corn' ? '#D4A017' : '#C47B1C', color: '#0F1A0F', borderColor: 'transparent' }
              : { borderColor: '#2A4A2A', color: '#8FA88F' }}>
            {c === 'corn' ? '🌽 CORN' : '🫘 SOYBEANS'}
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="card p-4">
        <div className="text-xs text-muted font-bold tracking-wider mb-3">SETTINGS — {crop.toUpperCase()}</div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-muted block mb-1">Est. Total Production (bu)</label>
            <input type="number" value={estProd}
              onChange={e => { const v = parseInt(e.target.value); setEstProd(v); localStorage.setItem(`estProd_${crop}`, String(v)); }}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary font-price text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Cost of Production ($/bu)</label>
            <input type="number" step="0.01" value={costProd}
              onChange={e => { const v = parseFloat(e.target.value); setCostProd(v); localStorage.setItem(`costProd_${crop}`, String(v)); }}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary font-price text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Target Margin %</label>
            <input type="number" step="0.5" value={targetMargin}
              onChange={e => { const v = parseFloat(e.target.value); setTargetMargin(v); localStorage.setItem(`targetMargin_${crop}`, String(v)); }}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary font-price text-sm" />
          </div>
        </div>
        <div className="mt-3 text-xs text-muted">
          Target price: <span className="font-price text-gold">${(costProd * (1 + targetMargin / 100)).toFixed(4)}/bu</span>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs text-muted font-bold tracking-wider">MARKETING PROGRESS</div>
          <div className="font-price text-2xl font-bold" style={{ color: progressColor }}>{pctSold.toFixed(1)}%</div>
        </div>
        <div className="text-xs text-muted mb-2">{totalSold.toLocaleString()} bu sold of {estProd.toLocaleString()} bu estimated</div>
        <div className="h-3 rounded-full bg-card-border overflow-hidden mb-1">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pctSold)}%`, background: progressColor }} />
        </div>
        <div className="text-xs text-muted">
          {pctSold >= 60 ? '✅ Ahead of target' : pctSold >= 30 ? '⚡ On track' : '⚠️ Behind — consider pricing'}
        </div>
      </div>

      {/* Milestone table */}
      <div className="card p-4">
        <div className="text-xs text-muted font-bold tracking-wider mb-3">MARKETING MILESTONES</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted border-b border-card-border">
              {['Milestone','Target Date','% to Sell','Target Futures','Target Basis','Actual % Sold','Status'].map(h => (
                <th key={h} className="text-left py-1 pr-3 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ms.map(m => {
              const isPast = new Date(m.targetDate) < new Date();
              const rowColor = m.status === 'hit' ? '#1a3a1a' : isPast ? '#3a1a1a' : '#1e2a1e';
              const statusColor = m.status === 'hit' ? '#4CAF50' : isPast ? '#E53935' : '#D4A017';
              const statusText = m.status === 'hit' ? '✅ HIT' : isPast ? '⚠️ PAST DUE' : '🎯 UPCOMING';
              return (
                <tr key={m.id} style={{ background: rowColor }} className="border-b border-card-border/40">
                  <td className="py-2 pr-3 text-xs">{m.name}</td>
                  <td className="py-2 pr-3 text-xs text-muted font-price">{m.targetDate}</td>
                  <td className="py-2 pr-3 text-xs font-price text-gold">{m.pctToSell}%</td>
                  <td className="py-2 pr-3 text-xs font-price">${m.targetFutures.toFixed(2)}</td>
                  <td className="py-2 pr-3 text-xs font-price text-muted">{m.targetBasis}¢</td>
                  <td className="py-2 pr-3 text-xs font-price">{m.actualPct}%</td>
                  <td className="py-2 text-xs font-bold" style={{ color: statusColor }}>{statusText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      <div className="card p-4">
        <div className="text-xs text-muted font-bold tracking-wider mb-3">MARKETING TIMELINE — 2026</div>
        <div className="flex gap-0.5 h-8 rounded overflow-hidden">
          {months.map((m, i) => {
            // Find milestones targeting this month range
            const milestonesInMonth = ms.filter(ml => {
              const d = new Date(ml.targetDate);
              return d.getMonth() === i;
            });
            const hit = milestonesInMonth.some(ml => ml.status === 'hit');
            const upcoming = milestonesInMonth.some(ml => ml.status === 'upcoming');
            const past = new Date(2026, i) < new Date() && !hit;
            let bg = '#2A4A2A';
            if (hit) bg = '#D4A017';
            else if (upcoming) bg = '#1a3a1a';
            else if (past && milestonesInMonth.length > 0) bg = '#E5393533';
            return (
              <div key={m} className="flex-1 flex items-center justify-center text-xs transition-all"
                style={{ background: bg, border: upcoming ? '1px solid #D4A017' : '1px solid transparent' }}
                title={milestonesInMonth.map(ml => ml.name).join(', ') || m}>
                <span className="text-muted" style={{ fontSize: 9 }}>{m}</span>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-muted">
          <span><span className="inline-block w-3 h-3 rounded mr-1" style={{ background: '#D4A017' }} />Sold/Hit</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1 border border-gold" style={{ background: '#1a3a1a' }} />Target Window</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1" style={{ background: '#E5393533' }} />Past Due</span>
        </div>
      </div>
    </div>
  );
}
