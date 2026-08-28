'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Modal confirmation used before any destructive admin action.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  // Define Navigation

  // Define Context

  // Define Refs
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Define States

  // Helper Functions

  // Use Effects
  useEffect(() => {
    if (!open) {
      return;
    }

    // Escape closes; focus lands on the confirm action so the dialog is usable
    // from the keyboard alone.
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    confirmButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      aria-describedby="confirm-dialog-description"
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-ink/40"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-rule bg-paper p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-ink" id="confirm-dialog-title">
            {title}
          </h2>
          <p className="text-sm leading-6 text-ink-muted" id="confirm-dialog-description">
            {description}
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} variant="outline">
            {cancelLabel}
          </Button>
          <button
            className={
              tone === 'danger'
                ? 'inline-flex h-10 items-center justify-center rounded-lg bg-danger px-4 text-sm font-medium text-paper transition-opacity hover:opacity-90'
                : 'inline-flex h-10 items-center justify-center rounded-lg bg-accent px-4 text-sm font-medium text-paper transition-opacity hover:opacity-90'
            }
            onClick={onConfirm}
            ref={confirmButtonRef}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
