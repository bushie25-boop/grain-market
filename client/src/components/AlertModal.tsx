import React from 'react';
import { useForm } from 'react-hook-form';
import * as Dialog from '@radix-ui/react-dialog';

interface AlertData {
  crop: string;
  alertType: string;
  targetValue: number;
  futuresMonth: string;
  active: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AlertData) => void;
}

export function AlertModal({ open, onClose, onSubmit }: Props) {
  const { register, handleSubmit, reset } = useForm<AlertData>({
    defaultValues: { crop: 'corn', alertType: 'price_above', active: 1 },
  });

  const submit = handleSubmit((data) => {
    onSubmit({ ...data, targetValue: Number(data.targetValue), active: 1 });
    reset();
    onClose();
  });

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl p-6 w-full max-w-sm z-50">
          <Dialog.Title className="text-lg font-bold mb-4">Set Price Alert</Dialog.Title>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Crop</label>
              <select {...register('crop')} className="w-full border rounded px-2 py-1.5 text-sm">
                <option value="corn">🌽 Corn</option>
                <option value="soybeans">🫘 Soybeans</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Alert Type</label>
              <select {...register('alertType')} className="w-full border rounded px-2 py-1.5 text-sm">
                <option value="price_above">Price Above</option>
                <option value="price_below">Price Below</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Target Price ($/bu)</label>
              <input type="number" step="0.0001" {...register('targetValue')} className="w-full border rounded px-2 py-1.5 text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Futures Month</label>
              <input type="text" placeholder="e.g. Dec24" {...register('futuresMonth')} className="w-full border rounded px-2 py-1.5 text-sm" />
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
