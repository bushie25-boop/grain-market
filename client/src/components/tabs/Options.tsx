import React, { useState } from 'react';

type Crop = 'corn' | 'soybeans';

const CORN_EXPIRIES = ['Dec26', 'Mar27', 'May27', 'Jul27'];
const BEAN_EXPIRIES = ['Nov26', 'Jan27', 'Mar27'];

interface StrikeRow {
  strike: number;
  putBid: string; putAsk: string; putLast: string; putOI: string; putIV: string;
  callBid: string; callAsk: string; callLast: string; callOI: string; callIV: string;
}

function makeStrikes(center: number): StrikeRow[] {
  return Array.from({ length: 11 }, (_, i) => {
    const s = center - 0.25 * (5 - i);
    return {
      strike: parseFloat(s.toFixed(2)),
      putBid: '', putAsk: '', putLast: '', putOI: '', putIV: '',
      callBid: '', callAsk: '', callLast: '', callOI: '', callIV: '',
    };
  });
}

export function Options() {
  const [crop, setCrop] = useState<Crop>('corn');
  const [expiry, setExpiry] = useState('Dec26');
  const expiries = crop === 'corn' ? CORN_EXPIRIES : BEAN_EXPIRIES;

  // 3-way calculator
  const [buyPutStrike, setBuyPutStrike] = useState('');
  const [buyPutPrice, setBuyPutPrice] = useState('');
  const [sellCallStrike, setSellCallStrike] = useState('');
  const [sellCallPrice, setSellCallPrice] = useState('');
  const [sellPutStrike, setSellPutStrike] = useState('');
  const [sellPutPrice, setSellPutPrice] = useState('');

  const bp = parseFloat(buyPutPrice) || 0;
  const sc = parseFloat(sellCallPrice) || 0;
  const sp = parseFloat(sellPutPrice) || 0;
  const net = sc + sp - bp;
  const bpS = parseFloat(buyPutStrike) || 0;
  const scS = parseFloat(sellCallStrike) || 0;
  const spS = parseFloat(sellPutStrike) || 0;

  const strikes = makeStrikes(crop === 'corn' ? 4.5 : 10.0);
  const atm = strikes[5].strike;

  const inp = "w-full bg-bg border border-card-border rounded px-2 py-1 text-xs font-price text-primary";

  return (
    <div className="space-y-5">
      <div className="card p-3 text-xs text-muted">
        ℹ️ Data manually entered — Barchart API integration coming soon
      </div>

      {/* Crop/expiry selectors */}
      <div className="flex gap-2 flex-wrap">
        {(['corn', 'soybeans'] as Crop[]).map(c => (
          <button key={c} onClick={() => { setCrop(c); setExpiry(c === 'corn' ? 'Dec26' : 'Nov26'); }}
            className="px-4 py-1.5 rounded text-xs font-bold border transition-colors"
            style={crop === c
              ? { background: c === 'corn' ? '#D4A017' : '#C47B1C', color: '#0F1A0F', borderColor: 'transparent' }
              : { borderColor: '#2A4A2A', color: '#8FA88F' }}>
            {c === 'corn' ? '🌽 CORN' : '🫘 SOYBEANS'}
          </button>
        ))}
        <div className="border-l border-card-border mx-1" />
        {expiries.map(e => (
          <button key={e} onClick={() => setExpiry(e)}
            className="px-3 py-1.5 rounded text-xs border transition-colors"
            style={expiry === e
              ? { background: '#1A2E1A', color: '#E8E8E0', borderColor: '#D4A017' }
              : { borderColor: '#2A4A2A', color: '#8FA88F' }}>
            {e}
          </button>
        ))}
      </div>

      {/* Strike ladder */}
      <div className="card overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted border-b border-card-border">
              <th className="px-2 py-2 text-center" colSpan={5} style={{ color: '#E53935' }}>— PUTS —</th>
              <th className="px-2 py-2 text-center font-bold text-primary">STRIKE</th>
              <th className="px-2 py-2 text-center" colSpan={5} style={{ color: '#4CAF50' }}>— CALLS —</th>
            </tr>
            <tr className="text-muted border-b border-card-border text-center">
              <th className="px-2 py-1">Bid</th><th className="px-2 py-1">Ask</th><th className="px-2 py-1">Last</th><th className="px-2 py-1">OI</th><th className="px-2 py-1">IV</th>
              <th className="px-2 py-1 font-bold text-primary">$</th>
              <th className="px-2 py-1">Bid</th><th className="px-2 py-1">Ask</th><th className="px-2 py-1">Last</th><th className="px-2 py-1">OI</th><th className="px-2 py-1">IV</th>
            </tr>
          </thead>
          <tbody>
            {strikes.map(row => {
              const isAtm = row.strike === atm;
              return (
                <tr key={row.strike}
                  className="border-b border-card-border/30 text-center"
                  style={isAtm ? { background: '#D4A01722', borderColor: '#D4A017' } : {}}>
                  {['putBid','putAsk','putLast','putOI','putIV'].map(f => (
                    <td key={f} className="px-1 py-1"><input className={inp} style={{ width: 50 }} /></td>
                  ))}
                  <td className="px-2 py-1 font-price font-bold" style={{ color: isAtm ? '#D4A017' : '#E8E8E0' }}>
                    ${row.strike.toFixed(2)}
                    {isAtm && <span className="ml-1 text-gold text-xs">ATM</span>}
                  </td>
                  {['callBid','callAsk','callLast','callOI','callIV'].map(f => (
                    <td key={f} className="px-1 py-1"><input className={inp} style={{ width: 50 }} /></td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3-Way Calculator */}
      <div className="card p-4">
        <div className="text-xs font-bold text-muted tracking-wider mb-4">3-WAY OPTIONS CALCULATOR</div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-muted block mb-1">Buy Put — Strike</label>
            <input type="number" step="0.25" value={buyPutStrike} onChange={e => setBuyPutStrike(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-2 py-1.5 text-xs font-price text-primary mb-1" />
            <label className="text-xs text-muted block mb-1">at Price ($/bu)</label>
            <input type="number" step="0.01" value={buyPutPrice} onChange={e => setBuyPutPrice(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-2 py-1.5 text-xs font-price text-primary" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Sell Call — Strike</label>
            <input type="number" step="0.25" value={sellCallStrike} onChange={e => setSellCallStrike(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-2 py-1.5 text-xs font-price text-primary mb-1" />
            <label className="text-xs text-muted block mb-1">at Price ($/bu)</label>
            <input type="number" step="0.01" value={sellCallPrice} onChange={e => setSellCallPrice(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-2 py-1.5 text-xs font-price text-primary" />
          </div>
          <div>
            <label className="text-xs text-muted block mb-1">Sell Put — Strike</label>
            <input type="number" step="0.25" value={sellPutStrike} onChange={e => setSellPutStrike(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-2 py-1.5 text-xs font-price text-primary mb-1" />
            <label className="text-xs text-muted block mb-1">at Price ($/bu)</label>
            <input type="number" step="0.01" value={sellPutPrice} onChange={e => setSellPutPrice(e.target.value)}
              className="w-full bg-bg border border-card-border rounded px-2 py-1.5 text-xs font-price text-primary" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 p-3 rounded" style={{ background: '#0F1A0F' }}>
          <div className="text-center">
            <div className="text-xs text-muted mb-1">Net Cost/Credit</div>
            <div className={`font-price text-lg font-bold ${net >= 0 ? 'text-up' : 'text-down'}`}>
              {net >= 0 ? '+' : ''}{(net * 100).toFixed(1)}¢
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted mb-1">Floor (Buy Put − Cost)</div>
            <div className="font-price text-lg font-bold text-gold">{bpS ? `$${(bpS + net).toFixed(2)}` : '—'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted mb-1">Ceiling (Sell Call)</div>
            <div className="font-price text-lg font-bold text-up">{scS ? `$${scS.toFixed(2)}` : '—'}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted mb-1">Hole (below Sell Put)</div>
            <div className="font-price text-lg font-bold text-down">{spS ? `below $${spS.toFixed(2)}` : '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
