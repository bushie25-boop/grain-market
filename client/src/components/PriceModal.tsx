import React, { useState } from 'react';
import type { MarketSnapshot } from '../lib/api';
import { createSnapshot } from '../lib/api';

interface Props {
  snapshot: MarketSnapshot | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PriceModal({ snapshot, onClose, onSaved }: Props) {
  const [cornFutures, setCornFutures] = useState(String(snapshot?.cornFutures ?? ''));
  const [cornCash, setCornCash] = useState(String(snapshot?.cornCash ?? ''));
  const [soyFutures, setSoyFutures] = useState(String(snapshot?.soyFutures ?? ''));
  const [soyCash, setSoyCash] = useState(String(snapshot?.soyCash ?? ''));
  const [tone, setTone] = useState(() => localStorage.getItem('marketTone') ?? '');
  const [recommendation, setRecommendation] = useState(() => localStorage.getItem('marketReco') ?? '');
  const [watch, setWatch] = useState(() => localStorage.getItem('marketWatch') ?? '');
  const [saving, setSaving] = useState(false);

  const cf = parseFloat(cornFutures) || 0;
  const cc = parseFloat(cornCash) || 0;
  const sf = parseFloat(soyFutures) || 0;
  const sc = parseFloat(soyCash) || 0;
  const cornBasis = cc - cf;
  const soyBasis = sc - sf;

  async function handleSave() {
    setSaving(true);
    try {
      await createSnapshot({
        cornFutures: cf,
        cornCash: cc,
        cornBasis: parseFloat((cornBasis * 100).toFixed(1)),
        soyFutures: sf,
        soyCash: sc,
        soyBasis: parseFloat((soyBasis * 100).toFixed(1)),
        snapshotAt: new Date().toISOString(),
      } as any);
      localStorage.setItem('marketTone', tone);
      localStorage.setItem('marketReco', recommendation);
      localStorage.setItem('marketWatch', watch);
      onSaved();
      onClose();
    } catch (e) {
      alert('Save failed: ' + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inp = "w-full bg-bg border border-card-border rounded px-3 py-2 text-primary font-price";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">💵 Update Market Prices</h2>
          <button onClick={onClose} className="text-muted hover:text-primary text-xl">✕</button>
        </div>

        <div className="space-y-4">
          <div className="p-3 rounded" style={{ background: '#0F1A0F' }}>
            <div className="text-xs text-muted mb-2 font-bold tracking-wider">🌽 CORN</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Futures</label>
                <input type="number" step="0.0025" value={cornFutures} onChange={e => setCornFutures(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Cash</label>
                <input type="number" step="0.0025" value={cornCash} onChange={e => setCornCash(e.target.value)} className={inp} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted block mb-1">Basis (auto)</label>
                <div className={`${cf && cc ? 'text-gold' : 'text-muted'} font-price p-2 rounded border border-card-border bg-bg`}>
                  {cf && cc ? `${(cornBasis * 100).toFixed(1)}¢` : '—'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded" style={{ background: '#0F1A0F' }}>
            <div className="text-xs text-muted mb-2 font-bold tracking-wider">🫘 SOYBEANS</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted block mb-1">Futures</label>
                <input type="number" step="0.0025" value={soyFutures} onChange={e => setSoyFutures(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Cash</label>
                <input type="number" step="0.0025" value={soyCash} onChange={e => setSoyCash(e.target.value)} className={inp} />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-muted block mb-1">Basis (auto)</label>
                <div className={`${sf && sc ? 'text-amber-grain' : 'text-muted'} font-price p-2 rounded border border-card-border bg-bg`}>
                  {sf && sc ? `${(soyBasis * 100).toFixed(1)}¢` : '—'}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted block mb-1">📊 Market Tone</label>
            <input type="text" value={tone} onChange={e => setTone(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">💡 Recommendation</label>
            <textarea value={recommendation} onChange={e => setRecommendation(e.target.value)} rows={2}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary resize-none" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">⚠️ Watch</label>
            <input type="text" value={watch} onChange={e => setWatch(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-3 py-2 text-primary" />
          </div>
        </div>

        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-card-border rounded text-muted hover:text-primary">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-4 py-2 rounded font-bold text-bg disabled:opacity-50"
            style={{ background: '#D4A017' }}>
            {saving ? 'Saving...' : 'Save Prices'}
          </button>
        </div>
      </div>
    </div>
  );
}
