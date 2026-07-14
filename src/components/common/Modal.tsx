import { useEffect, useId, useRef } from 'react';
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react';

const focusableSelector = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface ModalProps {
  title: string;
  children: ReactNode;
  onClose: () => void;
  role?: 'dialog' | 'alertdialog';
}

export function Modal({
  title,
  children,
  onClose,
  role = 'dialog',
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const firstFocusable =
      dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
    (firstFocusable ?? dialogRef.current)?.focus();

    return () => {
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus();
      }
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== 'Tab' || !dialogRef.current) {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements.at(-1);
    if (!firstFocusable || !lastFocusable) {
      event.preventDefault();
      dialogRef.current.focus();
      return;
    }

    if (event.shiftKey && document.activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  }

  function handleOverlayMouseDown(event: MouseEvent<HTMLDivElement>): void {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-modal-overlay p-4"
      onMouseDown={handleOverlayMouseDown}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="max-h-full w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-surface p-6 shadow-lg"
      >
        <h2 id={titleId} className="mb-4 text-xl font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
