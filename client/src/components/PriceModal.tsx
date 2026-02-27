import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

interface PriceData {
  cornFutures: number;
  cornCash: number;
  cornBasis: number;
  soyFutures: number;
  soyCash: number;
  soyBasis: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PriceData) => void;
}

export function PriceModal({ open, onClose, onSubmit }: Props) {
  const [cornFutures, setCornFutures] = useState('');
  const [cornCash, setCornCash] = useState('');
  const [soyFutures, setSoyFutures] = useState('');
  const [soyCash, setSoyCash] = useState('');

  const cornBasis = cornFutures && cornCash ? (parseFloat(cornCash) - parseFloat(cornFutures)).toFixed(4) : '';
  const soyBasis = soyFutures && soyCash ? (parseFloat(soyCash) - parseFloat(soyFutures)).toFixed(4) : '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cornFutures: parseFloat(cornFutures),
      cornCash: parseFloat(cornCash),
      cornBasis: parseFloat(cornBasis || '0'),
      soyFutures: parseFloat(soyFutures),
      soyCash: parseFloat(soyCash),
      soyBasis: parseFloat(soyBasis || '0'),
    });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-lg font-bold mb-4">Update Market Prices</Dialog.Title>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-2">🌽 Corn</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs mb-1">Futures</label>
                  <input type="number" step="0.0001" value={cornFutures} onChange={e => setCornFutures(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs mb-1">Cash</label>
                  <input type="number" step="0.0001" value={cornCash} onChange={e => setCornCash(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs mb-1">Basis (auto)</label>
                  <input type="text" value={cornBasis} readOnly className="w-full border rounded px-2 py-1.5 text-sm bg-gray-50" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-700 mb-2">🫘 Soybeans</h3>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs mb-1">Futures</label>
                  <input type="number" step="0.0001" value={soyFutures} onChange={e => setSoyFutures(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs mb-1">Cash</label>
                  <input type="number" step="0.0001" value={soyCash} onChange={e => setSoyCash(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm" required />
                </div>
                <div>
                  <label className="block text-xs mb-1">Basis (auto)</label>
                  <input type="text" value={soyBasis} readOnly className="w-full border rounded px-2 py-1.5 text-sm bg-gray-50" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm bg-green-800 text-white rounded hover:bg-green-700">Save</button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
