import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getContracts, createContract, updateContract, deleteContract,
  getLatestSnapshot,
  type Contract, type MarketSnapshot,
} from './lib/api';
import { ContractModal } from './components/ContractModal';
import { PriceModal } from './components/PriceModal';
import { Dashboard } from './components/tabs/Dashboard';
import { Contracts } from './components/tabs/Contracts';
import { MarketWatch } from './components/tabs/MarketWatch';
import { Options } from './components/tabs/Options';
import { MarketingPlan } from './components/tabs/MarketingPlan';
import { Elevators } from './components/tabs/Elevators';

type Tab = 'dashboard' | 'contracts' | 'marketwatch' | 'options' | 'marketing' | 'elevators';

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'contracts', label: 'Contracts', icon: '📋' },
  { id: 'marketwatch', label: 'Market Watch', icon: '📈' },
  { id: 'options', label: 'Options', icon: '⚙️' },
  { id: 'marketing', label: 'Marketing Plan', icon: '🗺️' },
  { id: 'elevators', label: 'Elevators', icon: '🌾' },
];

function useNow() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editContract, setEditContract] = useState<Contract | null | undefined>(undefined);
  const now = useNow();
  const qc = useQueryClient();

  const { data: contracts = [] } = useQuery({ queryKey: ['contracts'], queryFn: getContracts });
  const { data: snapshot } = useQuery({ queryKey: ['snapshot'], queryFn: getLatestSnapshot, refetchInterval: 60000 });

  const createMut = useMutation({ mutationFn: createContract, onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Contract> }) => updateContract(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });
  const deleteMut = useMutation({ mutationFn: deleteContract, onSuccess: () => qc.invalidateQueries({ queryKey: ['contracts'] }) });

  function handleSaveContract(data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) {
    if (editContract?.id) {
      updateMut.mutate({ id: editContract.id, data });
    } else {
      createMut.mutate(data as any);
    }
    setEditContract(undefined);
  }

  const tone = localStorage.getItem('marketTone') ?? '';
  const reco = localStorage.getItem('marketReco') ?? '';
  const watch = localStorage.getItem('marketWatch') ?? '';

  const cornChange = snapshot?.cornFutures != null
    ? null // Would need prior day for real delta
    : null;

  function CashReport() {
    const s = snapshot;
    return (
      <div className="flex flex-col gap-3 h-full">
        <div className="text-xs font-bold tracking-widest text-primary">💵 CASH MORNING REPORT</div>
        <div className="text-xs text-muted font-price">{now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="border-b border-card-border my-1" />

        {!s ? (
          <div className="text-xs text-muted flex-1">No report today yet — check back after market open.</div>
        ) : (
          <>
            <div>
              <div className="text-xs font-bold text-gold mb-1.5">🌽 CORN</div>
              <div className="text-xs text-muted mb-0.5">Dec26</div>
              <div className="font-price text-xl text-gold font-bold">{s.cornFutures ? `$${s.cornFutures.toFixed(4)}` : '—'}</div>
              <div className="text-xs text-muted mt-1">Basis: <span className="font-price">{s.cornBasis != null ? `${s.cornBasis > 0 ? '+' : ''}${s.cornBasis}¢` : '—'} (Dummer)</span></div>
              <div className="text-xs mt-0.5">Cash: <span className="font-price text-gold">{s.cornCash ? `$${s.cornCash.toFixed(4)}` : '—'}</span></div>
            </div>

            <div className="border-b border-card-border my-1" />

            <div>
              <div className="text-xs font-bold mb-1.5" style={{ color: '#C47B1C' }}>🫘 SOYBEANS</div>
              <div className="text-xs text-muted mb-0.5">Nov26</div>
              <div className="font-price text-xl font-bold" style={{ color: '#C47B1C' }}>{s.soyFutures ? `$${s.soyFutures.toFixed(4)}` : '—'}</div>
              <div className="text-xs text-muted mt-1">Basis: <span className="font-price">{s.soyBasis != null ? `${s.soyBasis > 0 ? '+' : ''}${s.soyBasis}¢` : '—'} (Dummer)</span></div>
              <div className="text-xs mt-0.5">Cash: <span className="font-price" style={{ color: '#C47B1C' }}>{s.soyCash ? `$${s.soyCash.toFixed(4)}` : '—'}</span></div>
            </div>

            <div className="border-b border-card-border my-1" />

            {tone && <div className="text-xs"><span className="text-muted">📊 Market Tone:</span> <span className="text-primary">{tone}</span></div>}
            {reco && <div className="text-xs"><span className="text-muted">💡 RECOMMENDATION:</span> <span className="text-primary">{reco}</span></div>}
            {watch && <div className="text-xs"><span className="text-muted">⚠️ WATCH:</span> <span className="text-primary">{watch}</span></div>}
          </>
        )}

        <div className="flex-1" />
        <button onClick={() => setShowPriceModal(true)}
          className="w-full py-2 rounded text-xs font-bold text-bg transition-colors hover:opacity-90"
          style={{ background: '#D4A017' }}>
          Update Prices
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0F1A0F' }}>
      {/* Header */}
      <header className="px-4 py-3 border-b flex items-center justify-between" style={{ background: '#111f11', borderColor: '#2A4A2A' }}>
        <div>
          <div className="text-base font-bold text-primary tracking-wider">💵 CASH GRAIN</div>
          <div className="text-xs text-muted">Root Risk Management</div>
        </div>
        <div className="text-right font-price text-xs text-muted">
          <div>{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div className="text-primary">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <nav className="hidden md:flex flex-col gap-1 p-3 border-r shrink-0" style={{ width: 200, borderColor: '#2A4A2A', background: '#111f11' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-left text-sm transition-colors"
              style={tab === n.id
                ? { background: '#1A2E1A', color: '#D4A017', borderLeft: '2px solid #D4A017' }
                : { color: '#8FA88F', borderLeft: '2px solid transparent' }}>
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </nav>

        {/* Mobile top nav */}
        <div className="md:hidden flex overflow-x-auto border-b shrink-0 w-full" style={{ borderColor: '#2A4A2A', background: '#111f11' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-2 text-xs whitespace-nowrap shrink-0 border-b-2 transition-colors"
              style={tab === n.id
                ? { borderColor: '#D4A017', color: '#D4A017' }
                : { borderColor: 'transparent', color: '#8FA88F' }}>
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl">
            {tab === 'dashboard' && <Dashboard contracts={contracts} snapshot={snapshot ?? null} />}
            {tab === 'contracts' && (
              <Contracts
                contracts={contracts}
                onAdd={() => setEditContract(null)}
                onEdit={c => setEditContract(c)}
                onDeliver={c => updateMut.mutate({ id: c.id, data: { status: 'delivered' } })}
                onDelete={c => { if (confirm('Delete this contract?')) deleteMut.mutate(c.id); }}
              />
            )}
            {tab === 'marketwatch' && <MarketWatch snapshot={snapshot ?? null} onUpdatePrices={() => setShowPriceModal(true)} />}
            {tab === 'options' && <Options />}
            {tab === 'marketing' && <MarketingPlan contracts={contracts} />}
            {tab === 'elevators' && <Elevators snapshot={snapshot ?? null} />}
          </div>
        </main>

        {/* Right rail */}
        <aside className="hidden lg:flex flex-col p-4 border-l shrink-0 overflow-y-auto"
          style={{ width: 300, borderColor: '#2A4A2A', background: '#111f11' }}>
          <CashReport />
        </aside>
      </div>

      {/* Modals */}
      {editContract !== undefined && (
        <ContractModal
          contract={editContract}
          onSave={handleSaveContract}
          onClose={() => setEditContract(undefined)}
        />
      )}
      {showPriceModal && (
        <PriceModal
          snapshot={snapshot ?? null}
          onClose={() => setShowPriceModal(false)}
          onSaved={() => qc.invalidateQueries({ queryKey: ['snapshot'] })}
        />
      )}
    </div>
  );
}
