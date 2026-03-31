import React, { useState } from 'react';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export function CSVImportModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);

  const handleSimulateImport = () => {
    setStep(3);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setStep(4), 400);
      }
    }, 200);
  };

  const handleClose = () => {
    setStep(1);
    setProgress(0);
    onClose();
  };

  let content;
  if (step === 1) {
    content = (
      <div className="flex flex-col items-center">
        <label className="w-full h-[280px] rounded-[16px] border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--surface-gold)] hover:bg-[#EBB7360A] transition-colors mb-4">
          <input type="file" className="hidden" accept=".csv" onChange={() => setStep(2)} />
          <UploadCloud size={40} className="text-[var(--surface-gold)] mb-4" />
          <p className="font-sans font-medium text-[16px] text-[var(--text-primary)]">Drop CSV here or click to browse</p>
          <p className="font-sans text-[12px] text-[var(--text-muted)] mt-1">.csv files only</p>
        </label>
        <a href="#" className="font-sans text-[12px] text-[var(--surface-gold)] font-medium underline hover:text-yellow-600 transition-colors">Download CSV template</a>
      </div>
    );
  } else if (step === 2) {
    content = (
      <div className="flex flex-col">
        <div className="mb-4">
          <h3 className="font-sans font-semibold text-[16px] mb-1">alumni-import.csv</h3>
          <p className="font-sans text-[12px] text-[var(--text-secondary)]">24 KB • 142 rows</p>
        </div>
        <div className="rounded-[12px] border border-[var(--border-subtle)] overflow-hidden mb-4">
          <table className="w-full text-left font-mono text-[12px]">
            <thead className="bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
              <tr><th className="p-2 px-3">Name</th><th className="p-2 px-3">Phone</th><th className="p-2 px-3">Subgroup</th></tr>
            </thead>
            <tbody>
              <tr><td className="p-2 px-3 border-b border-[var(--border-subtle)]">John Doe</td><td className="p-2 px-3 border-b border-[var(--border-subtle)]">080123...</td><td className="p-2 px-3 border-b border-[var(--border-subtle)]">Media</td></tr>
              <tr><td className="p-2 px-3 border-b border-[var(--border-subtle)]">Jane Smith</td><td className="p-2 px-3 border-b border-[var(--border-subtle)]">080987...</td><td className="p-2 px-3 border-b border-[var(--border-subtle)]">Choir</td></tr>
            </tbody>
          </table>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); }} className="font-sans text-[12px] text-[var(--text-secondary)] underline hover:text-[var(--text-primary)]">Looks wrong? Replace file</a>
      </div>
    );
  } else if (step === 3) {
    content = (
      <div className="flex flex-col items-center justify-center h-[280px]">
        <div className="w-full max-w-[320px]">
          <div className="w-full h-[6px] rounded-full bg-[var(--bg-canvas-dim)] overflow-hidden mb-3 relative">
            <div className="h-full bg-[var(--surface-gold)] transition-all duration-200" style={{ width: `${progress}%` }} />
          </div>
          <p className="font-mono text-[12px] text-[var(--text-secondary)] text-center">Importing row {Math.min(Math.round((progress/100)*142), 142)} of 142...</p>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="flex flex-col items-center justify-center py-6">
        <CheckCircle size={48} className="text-[var(--status-success)] mb-4" />
        <h3 className="font-display font-bold text-[24px] mb-6">Import Complete</h3>
        <div className="grid grid-cols-3 gap-4 w-full text-center">
          <div className="p-3 rounded-[12px] bg-[#F0FDF4] text-[var(--status-success)]">
            <div className="font-mono text-[24px] font-bold">138</div>
            <div className="font-sans text-[12px]">Created</div>
          </div>
          <div className="p-3 rounded-[12px] bg-[#FEF9C3] text-[#A16207]">
            <div className="font-mono text-[24px] font-bold">4</div>
            <div className="font-sans text-[12px]">Skipped</div>
          </div>
          <div className="p-3 rounded-[12px] bg-[#FEF2F2] text-[var(--status-error)]">
            <div className="font-mono text-[24px] font-bold">0</div>
            <div className="font-sans text-[12px]">Errors</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={step !== 4 ? "Import Alumni via CSV" : null}
      footer={step === 2 ? (
        <>
          <Button variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSimulateImport}>Start Import</Button>
        </>
      ) : step === 4 ? (
        <Button onClick={handleClose}>Done</Button>
      ) : null}
    >
      {content}
    </Modal>
  );
}
