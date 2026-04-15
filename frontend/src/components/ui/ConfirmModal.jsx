import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmLabel = "Confirm", 
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false
}) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      className="sm:max-w-[440px]"
      footer={(
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      )}
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${variant === 'danger' ? 'bg-[#FEF2F2] text-[var(--status-error)]' : 'bg-[var(--accent-bg)] text-[var(--surface-navy)]'}`}>
          <AlertCircle size={24} />
        </div>
        <p className="font-sans text-[15px] text-[var(--text-secondary)] leading-relaxed">
          {message}
        </p>
      </div>
    </Modal>
  );
}
