import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';
import type { Contract } from '../lib/api';

type FormData = Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  initial?: Contract | null;
}

export function ContractModal({ open, onClose, onSubmit, initial }: Props) {
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  useEffect(() => {
    if (initial) {
      Object.entries(initial).forEach(([k, v]) => {
        if (k !== 'id' && k !== 'createdAt' && k !== 'updatedAt') {
          setValue(k as keyof FormData, v as any);
        }
      });
    } else {
      reset({ crop: 'corn', contractType: 'cash', status: 'open', bushels: undefined, price: undefined });
    }
  }, [initial, open]);

  const submit = handleSubmit((data) => {
    onSubmit({ ...data, bushels: Number(data.bushels), price: Number(data.price), basis: data.basis ? Number(data.basis) : null });
    onClose();
  });

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-lg z-50 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-lg font-bold mb-4">{initial ? 'Edit Contract' : 'Add Contract'}</Dialog.Title>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Crop</label>
                <select {...register('crop')} className="w-full border rounded px-2 py-1.5 text-sm">
                  <option value="corn">🌽 Corn</option>
                  <option value="soybeans">🫘 Soybeans</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contract Type</label>
                <select {...register('contractType')} className="w-full border rounded px-2 py-1.5 text-sm">
                  <option value="cash">Cash</option>
                  <option value="basis">Basis</option>
                  <option value="htc">HTC</option>
                  <option value="futures_only">Futures Only</option>
                  <option value="dp">DP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bushels</label>
                <input type="number" step="any" {...register('bushels')} className="w-full border rounded px-2 py-1.5 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price ($/bu)</label>
                <input type="number" step="0.0001" {...register('price')} className="w-full border rounded px-2 py-1.5 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Basis</label>
                <input type="number" step="0.0001" {...register('basis')} className="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Futures Month</label>
                <input type="text" placeholder="e.g. Dec24" {...register('futuresMonth')} className="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Elevator</label>
                <input type="text" {...register('elevator')} className="w-full border rounded px-2 py-1.5 text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select {...register('status')} className="w-full border rounded px-2 py-1.5 text-sm">
                  <option value="open">Open</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery Start</label>
                <input type="date" {...register('deliveryStart')} className="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Delivery End</label>
                <input type="date" {...register('deliveryEnd')} className="w-full border rounded px-2 py-1.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea {...register('notes')} rows={2} className="w-full border rounded px-2 py-1.5 text-sm" />
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
