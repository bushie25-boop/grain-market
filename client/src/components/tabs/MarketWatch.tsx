import React, { useState } from 'react';
import type { MarketSnapshot } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';
import { getMarketHistory } from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ElevatorBasis {
  name: string;
  cornBasis: number | null;
  beanBasis: number | null;
  cornCash: number | null;
  beanCash: number | null;
  updated: string;
}

function getElevatorBasis(): ElevatorBasis[] {
  try {
    const raw = localStorage.getItem('elevatorData');
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { name: 'Dummer/Holmen', cornBasis: -35, beanBasis: -45, cornCash: null, beanCash: null, updated: 'N/A' },
    { name: 'ADM/Winona', cornBasis: -30, beanBasis: -40, cornCash: null, beanCash: null, updated: 'N/A' },
    { name: 'Cargill/La Crosse', cornBasis: -32, beanBasis: -42, cornCash: null, beanCash: null, updated: 'N/A' },
    { name: 'Golden Plump/Arcadia', cornBasis: -38, beanBasis: null, cornCash: null, beanCash: null, updated: 'N/A' },
    { name: 'White Water/St. Charles', cornBasis: -55, beanBasis: -65, cornCash: null, beanCash: null, updated: 'N/A' },
  ];
}

interface Props {
  snapshot: MarketSnapshot | null;
  onUpdatePrices: () => void;
}

export function MarketWatch({ snapshot, onUpdatePrices }: Props) {
  const [days, setDays] = useState(30);
  const { data: history = [] } = useQuery({ queryKey: ['history', days], queryFn: () => getMarketHistory(days) });

  const prior = history.length >= 2 ? history[history.length - 2] : null;
  const cornChange = snapshot && prior ? (snapshot.cornFutures ?? 0) - (prior.cornFutures ?? 0) : null;
  const soyChange = snapshot && prior ? (snapshot.soyFutures ?? 0) - (prior.soyFutures ?? 0) : null;

  const elevators = getElevatorBasis();
  const cf = snapshot?.cornFutures ?? 0;
  const sf = snapshot?.soyFutures ?? 0;

  const chartData = history.map(h => ({
    date: new Date(h.snapshotAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    corn: h.cornFutures,
    beans: h.soyFutures,
  }));

  function PriceCard({ crop, futures, change, basis, cash, accent, icon, month }: any) {
    return (
      <div className="card p-5 flex-1" style={{ borderTop: `3px solid ${accent}` }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{icon}</span>
          <span className="text-xs font-bold tracking-widest text-muted">{crop}</span>
          <span className="text-xs text-muted ml-auto">{month}</span>
        </div>
        <div className="font-price text-4xl font-bold mb-1" style={{ color: accent }}>
          {futures != null ? `$${futures.toFixed(4)}` : '—'}
        </div>
        {change != null && (
          <div className={`font-price text-sm mb-3 ${change >= 0 ? 'text-up' : 'text-down'}`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change * 100).toFixed(1)}¢
          </div>
        )}
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted">Basis (Dummer)</span>
            <span className="font-price text-muted">{basis != null ? `${basis > 0 ? '+' : ''}${basis}¢` : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Cash Price</span>
            <span className="font-price font-bold" style={{ color: accent }}>{cash != null ? `$${cash.toFixed(4)}` : '—'}</span>
          </div>
        </div>
        {snapshot && (
          <div className="text-xs text-muted mt-3">
            Updated: {new Date(snapshot.snapshotAt).toLocaleTimeString()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Big price cards */}
      <div className="flex gap-4">
        <PriceCard
          crop="CORN" icon="🌽" accent="#D4A017" month="Dec26"
          futures={snapshot?.cornFutures}
          change={cornChange}
          basis={snapshot?.cornBasis}
          cash={snapshot?.cornCash}
        />
        <PriceCard
          crop="SOYBEANS" icon="🫘" accent="#C47B1C" month="Nov26"
          futures={snapshot?.soyFutures}
          change={soyChange}
          basis={snapshot?.soyBasis}
          cash={snapshot?.soyCash}
        />
      </div>

      {/* Chart */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-bold text-muted tracking-wider">PRICE HISTORY</div>
          <div className="flex gap-1">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className="px-3 py-1 text-xs rounded border transition-colors"
                style={days === d
                  ? { background: '#D4A017', color: '#0F1A0F', borderColor: '#D4A017' }
                  : { borderColor: '#2A4A2A', color: '#8FA88F' }}>
                {d}D
              </button>
            ))}
          </div>
        </div>
        {chartData.length < 2 ? (
          <div className="text-muted text-sm text-center py-8">Not enough history data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: '#8FA88F', fontSize: 10 }} />
              <YAxis tick={{ fill: '#8FA88F', fontSize: 10 }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: '#1A2E1A', border: '1px solid #2A4A2A', color: '#E8E8E0' }} />
              <Legend wrapperStyle={{ color: '#8FA88F', fontSize: 12 }} />
              <Line type="monotone" dataKey="corn" stroke="#D4A017" dot={false} strokeWidth={2} name="Corn" />
              <Line type="monotone" dataKey="beans" stroke="#C47B1C" dot={false} strokeWidth={2} name="Beans" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Basis tracker */}
      <div className="card p-4">
        <div className="text-xs font-bold text-muted tracking-wider mb-3">BASIS TRACKER</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted border-b border-card-border">
              <th className="text-left py-1 pr-3">Elevator</th>
              <th className="text-right py-1 pr-3">Corn Basis</th>
              <th className="text-right py-1 pr-3">Corn Cash</th>
              <th className="text-right py-1 pr-3">Bean Basis</th>
              <th className="text-right py-1 pr-3">Bean Cash</th>
              <th className="text-left py-1">Updated</th>
            </tr>
          </thead>
          <tbody>
            {elevators.map(el => {
              const cc = el.cornBasis != null && cf ? cf + el.cornBasis / 100 : null;
              const bc = el.beanBasis != null && sf ? sf + el.beanBasis / 100 : null;
              return (
                <tr key={el.name} className="border-b border-card-border/40">
                  <td className="py-1.5 pr-3 text-xs">{el.name}</td>
                  <td className="py-1.5 pr-3 text-right font-price text-muted text-xs">{el.cornBasis != null ? `${el.cornBasis}¢` : '—'}</td>
                  <td className="py-1.5 pr-3 text-right font-price text-gold text-xs">{cc ? `$${cc.toFixed(4)}` : '—'}</td>
                  <td className="py-1.5 pr-3 text-right font-price text-muted text-xs">{el.beanBasis != null ? `${el.beanBasis}¢` : '—'}</td>
                  <td className="py-1.5 pr-3 text-right font-price text-xs" style={{ color: '#C47B1C' }}>{bc ? `$${bc.toFixed(4)}` : '—'}</td>
                  <td className="py-1.5 text-xs text-muted">{el.updated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
