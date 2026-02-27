import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  getContracts, createContract, updateContract, deleteContract,
  getAlerts, createAlert, deleteAlert,
  getLatestSnapshot, getMarketHistory, createSnapshot,
  type Contract, type Alert, type MarketSnapshot
} from './lib/api';
import { ContractModal } from './components/ContractModal';
import { PriceModal } from './components/PriceModal';
import { AlertModal } from './components/AlertModal';

function fmt(n: number | null | undefined, decimals = 4) {
  if (n == null) return '—';
  return n.toFixed(decimals);
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    delivered: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

// ──────────────── Dashboard ────────────────
function Dashboard({ contracts, snapshot, alerts }: { contracts: Contract[]; snapshot: MarketSnapshot | null; alerts: Alert[] }) {
  const corn = contracts.filter(c => c.crop === 'corn' && c.status === 'open');
  const soy = contracts.filter(c => c.crop === 'soybeans' && c.status === 'open');
  const avgPrice = (arr: Contract[]) => arr.length ? arr.reduce((s, c) => s + c.price, 0) / arr.length : 0;

  const now = new Date();
  const thisMonth = contracts.filter(c => {
    if (!c.deliveryEnd) return false;
    const d = new Date(c.deliveryEnd);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });

  const cards = [
    { label: 'Corn Bushels', value: corn.reduce((s, c) => s + c.bushels, 0).toLocaleString(), unit: 'bu' },
    { label: 'Soybean Bushels', value: soy.reduce((s, c) => s + c.bushels, 0).toLocaleString(), unit: 'bu' },
    { label: 'Avg Corn Price', value: `$${avgPrice(corn).toFixed(4)}`, unit: '/bu' },
    { label: 'Avg Soy Price', value: `$${avgPrice(soy).toFixed(4)}`, unit: '/bu' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-lg border p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-green-900">{c.value}<span className="text-sm font-normal text-gray-500 ml-1">{c.unit}</span></p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h3 className="font-semibold mb-3 text-gray-800">Contracts Due This Month</h3>
          {thisMonth.length === 0 ? (
            <p className="text-sm text-gray-400">None</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 border-b"><th className="pb-1">Crop</th><th>Elevator</th><th>Bushels</th><th>End</th></tr></thead>
              <tbody>
                {thisMonth.map(c => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-1">{c.crop === 'corn' ? '🌽' : '🫘'} {c.crop}</td>
                    <td>{c.elevator}</td>
                    <td>{c.bushels.toLocaleString()}</td>
                    <td>{c.deliveryEnd}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h3 className="font-semibold mb-3 text-gray-800">Current Market Prices</h3>
          {snapshot ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs">🌽 Corn Futures</p>
                <p className="font-semibold">${fmt(snapshot.cornFutures)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">🌽 Corn Cash</p>
                <p className="font-semibold">${fmt(snapshot.cornCash)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">🌽 Corn Basis</p>
                <p className="font-semibold">{fmt(snapshot.cornBasis)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">🫘 Soy Futures</p>
                <p className="font-semibold">${fmt(snapshot.soyFutures)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">🫘 Soy Cash</p>
                <p className="font-semibold">${fmt(snapshot.soyCash)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">🫘 Soy Basis</p>
                <p className="font-semibold">{fmt(snapshot.soyBasis)}</p>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400">No price data yet</p>}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h3 className="font-semibold mb-3 text-gray-800">Active Alerts</h3>
        {alerts.length === 0 ? <p className="text-sm text-gray-400">No active alerts</p> : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-sm">
                <span className="text-yellow-500">⚠️</span>
                <span>{a.crop === 'corn' ? '🌽' : '🫘'} {a.crop}</span>
                <span className="text-gray-500">{a.alertType === 'price_above' ? 'above' : 'below'}</span>
                <span className="font-semibold">${fmt(a.targetValue)}</span>
                {a.futuresMonth && <span className="text-gray-400">({a.futuresMonth})</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────── Contracts ────────────────
function ContractsTab({ contracts, onAdd, onEdit, onDelete, onDeliver }: {
  contracts: Contract[];
  onAdd: (d: any) => void;
  onEdit: (id: string, d: any) => void;
  onDelete: (id: string) => void;
  onDeliver: (id: string) => void;
}) {
  const [cropFilter, setCropFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Contract | null>(null);

  const filtered = contracts.filter(c =>
    (cropFilter === 'all' || c.crop === cropFilter) &&
    (statusFilter === 'all' || c.status === statusFilter)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          {['all', 'corn', 'soybeans'].map(f => (
            <button key={f} onClick={() => setCropFilter(f)}
              className={`px-3 py-1 rounded text-sm ${cropFilter === f ? 'bg-green-800 text-white' : 'border hover:bg-gray-50'}`}>
              {f === 'all' ? 'All Crops' : f === 'corn' ? '🌽 Corn' : '🫘 Soybeans'}
            </button>
          ))}
          <span className="w-px bg-gray-200" />
          {['all', 'open', 'delivered'].map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1 rounded text-sm ${statusFilter === f ? 'bg-green-800 text-white' : 'border hover:bg-gray-50'}`}>
              {f === 'all' ? 'All Status' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="px-4 py-2 bg-green-800 text-white rounded text-sm hover:bg-green-700">
          + Add Contract
        </button>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-3">Crop</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Bushels</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Basis</th>
              <th className="px-4 py-3">Elevator</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-6 text-center text-gray-400">No contracts</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-2">{c.crop === 'corn' ? '🌽' : '🫘'} {c.crop}</td>
                <td className="px-4 py-2">{c.contractType}</td>
                <td className="px-4 py-2">{c.bushels.toLocaleString()}</td>
                <td className="px-4 py-2">${fmt(c.price)}</td>
                <td className="px-4 py-2">{c.basis != null ? fmt(c.basis) : '—'}</td>
                <td className="px-4 py-2">{c.elevator}</td>
                <td className="px-4 py-2 text-xs">{c.deliveryStart && c.deliveryEnd ? `${c.deliveryStart} → ${c.deliveryEnd}` : c.deliveryEnd || '—'}</td>
                <td className="px-4 py-2">{statusBadge(c.status)}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(c); setModalOpen(true); }} className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Edit</button>
                    {c.status === 'open' && <button onClick={() => onDeliver(c.id)} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200">✓ Deliver</button>}
                    <button onClick={() => onDelete(c.id)} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200">Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ContractModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={(data) => editing ? onEdit(editing.id, data) : onAdd(data)}
        initial={editing}
      />
    </div>
  );
}

// ──────────────── Market Watch ────────────────
function MarketWatch({ snapshot, history, alerts, onUpdatePrices, onAddAlert, onDeleteAlert }: {
  snapshot: MarketSnapshot | null;
  history: MarketSnapshot[];
  alerts: Alert[];
  onUpdatePrices: (d: any) => void;
  onAddAlert: (d: any) => void;
  onDeleteAlert: (id: string) => void;
}) {
  const [priceOpen, setPriceOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const chartData = history.map(s => ({
    date: s.snapshotAt.slice(0, 10),
    corn: s.cornFutures,
    soy: s.soyFutures,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setPriceOpen(true)} className="px-4 py-2 bg-green-800 text-white rounded text-sm hover:bg-green-700">
          📊 Update Prices
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {[
          { label: '🌽 Corn', futures: snapshot?.cornFutures, cash: snapshot?.cornCash, basis: snapshot?.cornBasis },
          { label: '🫘 Soybeans', futures: snapshot?.soyFutures, cash: snapshot?.soyCash, basis: snapshot?.soyBasis },
        ].map(crop => (
          <div key={crop.label} className="bg-white rounded-lg border p-4 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">{crop.label}</h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Futures</p>
                <p className="font-bold text-lg">${fmt(crop.futures)}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Cash</p>
                <p className="font-bold text-lg">${fmt(crop.cash)}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Basis</p>
                <p className="font-bold text-lg">{fmt(crop.basis)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {chartData.length > 0 && (
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Price History</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="corn" stroke="#16a34a" name="Corn Futures" dot={false} />
              <Line type="monotone" dataKey="soy" stroke="#ca8a04" name="Soy Futures" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800">Price Alerts</h3>
          <button onClick={() => setAlertOpen(true)} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">+ Add Alert</button>
        </div>
        {alerts.length === 0 ? <p className="text-sm text-gray-400">No active alerts</p> : (
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center justify-between text-sm border rounded px-3 py-2">
                <span>
                  {a.crop === 'corn' ? '🌽' : '🫘'} {a.crop} — {a.alertType === 'price_above' ? '↑ above' : '↓ below'} <strong>${fmt(a.targetValue)}</strong>
                  {a.futuresMonth && ` (${a.futuresMonth})`}
                </span>
                <button onClick={() => onDeleteAlert(a.id)} className="text-red-500 hover:text-red-700 text-xs">✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <PriceModal open={priceOpen} onClose={() => setPriceOpen(false)} onSubmit={onUpdatePrices} />
      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} onSubmit={onAddAlert} />
    </div>
  );
}

// ──────────────── Analytics ────────────────
function Analytics({ contracts, snapshot, history }: { contracts: Contract[]; snapshot: MarketSnapshot | null; history: MarketSnapshot[] }) {
  const [cornTotal, setCornTotal] = useState(50000);
  const [soyTotal, setSoyTotal] = useState(30000);

  const cornContracted = contracts.filter(c => c.crop === 'corn' && c.status === 'open').reduce((s, c) => s + c.bushels, 0);
  const soyContracted = contracts.filter(c => c.crop === 'soybeans' && c.status === 'open').reduce((s, c) => s + c.bushels, 0);

  const barData = [
    { name: 'Corn', contracted: cornContracted, uncontracted: Math.max(0, cornTotal - cornContracted) },
    { name: 'Soybeans', contracted: soyContracted, uncontracted: Math.max(0, soyTotal - soyContracted) },
  ];

  const cornContracts = contracts.filter(c => c.crop === 'corn' && c.status === 'open');
  const soyContracts = contracts.filter(c => c.crop === 'soybeans' && c.status === 'open');
  const avgCorn = cornContracts.length ? cornContracts.reduce((s, c) => s + c.price, 0) / cornContracts.length : 0;
  const avgSoy = soyContracts.length ? soyContracts.reduce((s, c) => s + c.price, 0) / soyContracts.length : 0;

  const cornRev = cornContracted * avgCorn;
  const soyRev = soyContracted * avgSoy;
  const cornMarket = cornContracted * (snapshot?.cornCash || 0);
  const soyMarket = soyContracted * (snapshot?.soyCash || 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Contracted vs Uncontracted Bushels</h3>
        <div className="flex gap-4 mb-3">
          <label className="text-sm">Corn total: <input type="number" value={cornTotal} onChange={e => setCornTotal(Number(e.target.value))} className="border rounded px-2 py-1 w-28 text-sm ml-1" /></label>
          <label className="text-sm">Soy total: <input type="number" value={soyTotal} onChange={e => setSoyTotal(Number(e.target.value))} className="border rounded px-2 py-1 w-28 text-sm ml-1" /></label>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="contracted" stackId="a" fill="#16a34a" name="Contracted" />
            <Bar dataKey="uncontracted" stackId="a" fill="#d1fae5" name="Uncontracted" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3">Revenue Summary</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b">
            <tr><th className="pb-2">Crop</th><th>Contracted Revenue</th><th>Market Value</th><th>Difference</th></tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">🌽 Corn</td>
              <td>${cornRev.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
              <td>${cornMarket.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
              <td className={cornRev - cornMarket >= 0 ? 'text-green-700' : 'text-red-600'}>{cornRev - cornMarket >= 0 ? '+' : ''}${(cornRev - cornMarket).toLocaleString('en', { maximumFractionDigits: 0 })}</td>
            </tr>
            <tr>
              <td className="py-2">🫘 Soybeans</td>
              <td>${soyRev.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
              <td>${soyMarket.toLocaleString('en', { maximumFractionDigits: 0 })}</td>
              <td className={soyRev - soyMarket >= 0 ? 'text-green-700' : 'text-red-600'}>{soyRev - soyMarket >= 0 ? '+' : ''}${(soyRev - soyMarket).toLocaleString('en', { maximumFractionDigits: 0 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ──────────────── App Root ────────────────
export default function App() {
  const qc = useQueryClient();

  const { data: contracts = [] } = useQuery({ queryKey: ['contracts'], queryFn: getContracts });
  const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });
  const { data: snapshot = null } = useQuery({ queryKey: ['snapshot'], queryFn: getLatestSnapshot });
  const { data: history = [] } = useQuery({ queryKey: ['history'], queryFn: () => getMarketHistory(30) });

  const addContract = useMutation({ mutationFn: createContract, onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });
  const editContract = useMutation({ mutationFn: ({ id, data }: { id: string; data: any }) => updateContract(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });
  const removeContract = useMutation({ mutationFn: deleteContract, onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });

  const addAlert = useMutation({ mutationFn: createAlert, onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) });
  const removeAlert = useMutation({ mutationFn: deleteAlert, onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }) });

  const addSnapshot = useMutation({ mutationFn: createSnapshot, onSuccess: () => { qc.invalidateQueries({ queryKey: ['snapshot'] }); qc.invalidateQueries({ queryKey: ['history'] }); } });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-900 text-white px-6 py-4 shadow-md">
        <h1 className="text-2xl font-bold">🌽 Grain Market</h1>
        <p className="text-green-300 text-sm">Root Risk Management</p>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <Tabs.Root defaultValue="dashboard">
          <Tabs.List className="flex gap-1 mb-6 border-b">
            {['dashboard', 'contracts', 'market', 'analytics'].map(t => (
              <Tabs.Trigger key={t} value={t}
                className="px-4 py-2 text-sm font-medium capitalize text-gray-600 border-b-2 border-transparent data-[state=active]:border-green-800 data-[state=active]:text-green-900 hover:text-gray-900">
                {t === 'market' ? 'Market Watch' : t.charAt(0).toUpperCase() + t.slice(1)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="dashboard">
            <Dashboard contracts={contracts} snapshot={snapshot} alerts={alerts} />
          </Tabs.Content>
          <Tabs.Content value="contracts">
            <ContractsTab
              contracts={contracts}
              onAdd={(d) => addContract.mutate(d)}
              onEdit={(id, d) => editContract.mutate({ id, data: d })}
              onDelete={(id) => removeContract.mutate(id)}
              onDeliver={(id) => editContract.mutate({ id, data: { status: 'delivered' } })}
            />
          </Tabs.Content>
          <Tabs.Content value="market">
            <MarketWatch
              snapshot={snapshot}
              history={history}
              alerts={alerts}
              onUpdatePrices={(d) => addSnapshot.mutate(d)}
              onAddAlert={(d) => addAlert.mutate(d)}
              onDeleteAlert={(id) => removeAlert.mutate(id)}
            />
          </Tabs.Content>
          <Tabs.Content value="analytics">
            <Analytics contracts={contracts} snapshot={snapshot} history={history} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
