import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel} role="alertdialog">
      <p className="text-sm text-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-10 rounded-md border border-border bg-surface px-4 py-2 font-medium hover:bg-background"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="min-h-10 rounded-md bg-danger px-4 py-2 font-medium text-danger-contrast hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
