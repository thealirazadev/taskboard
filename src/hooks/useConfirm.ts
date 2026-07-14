import { useCallback, useState } from 'react';

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel: string;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

export interface UseConfirmResult {
  pending: ConfirmOptions | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  respondConfirm: () => void;
  respondCancel: () => void;
}

/** Queues a single confirmation prompt and resolves a promise with the user's choice. */
export function useConfirm(): UseConfirmResult {
  const [pendingConfirm, setPendingConfirm] = useState<PendingConfirm | null>(
    null,
  );

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPendingConfirm({ ...options, resolve });
    });
  }, []);

  const respondConfirm = useCallback(() => {
    pendingConfirm?.resolve(true);
    setPendingConfirm(null);
  }, [pendingConfirm]);

  const respondCancel = useCallback(() => {
    pendingConfirm?.resolve(false);
    setPendingConfirm(null);
  }, [pendingConfirm]);

  return { pending: pendingConfirm, confirm, respondConfirm, respondCancel };
}
