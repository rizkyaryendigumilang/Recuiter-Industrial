'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { HelpdeskTicketModal } from './helpdesk-ticket-modal';
import { LifeBuoy } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface HelpdeskOpenOptions {
  initialKeluhan?: string;
  initialSubject?: string;
}

interface HelpdeskContextType {
  isOpen: boolean;
  openHelpdesk: (options?: HelpdeskOpenOptions) => void;
  closeHelpdesk: () => void;
}

const HelpdeskContext = createContext<HelpdeskContextType | null>(null);

export function useHelpdesk(): HelpdeskContextType {
  const context = useContext(HelpdeskContext);
  if (!context) {
    throw new Error('useHelpdesk must be used within a HelpdeskProvider');
  }
  return context;
}

export function HelpdeskProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalOptions, setModalOptions] = useState<HelpdeskOpenOptions>({});

  const openHelpdesk = useCallback((options?: HelpdeskOpenOptions) => {
    setModalOptions(options || {});
    setIsOpen(true);
    triggerHaptic.light();
  }, []);

  const closeHelpdesk = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <HelpdeskContext.Provider value={{ isOpen, openHelpdesk, closeHelpdesk }}>
      {children}

      {/* Global Helpdesk Ticket Modal */}
      <HelpdeskTicketModal
        isOpen={isOpen}
        onClose={closeHelpdesk}
        initialKeluhan={modalOptions.initialKeluhan}
        initialSubject={modalOptions.initialSubject}
      />

      {/* Industrial Floating Help Button (Bottom Right) */}
      <aside
        aria-label="Pusat Bantuan & Kendala"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 print:hidden"
      >
        <button
          type="button"
          onClick={() => openHelpdesk()}
          className="group relative flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-full bg-[#0D1117]/95 hover:bg-[#161B22] text-white border border-[#30363D] shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md"
          title="Bantuan / Laporkan Kendala (SSO VPS Helpdesk)"
          aria-label="Bantuan / Laporkan Kendala (SSO VPS Helpdesk)"
        >
          {/* Glowing status indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>

          <LifeBuoy className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />

          <span className="text-xs font-semibold tracking-tight hidden sm:inline-block">
            Bantuan <span className="text-amber-400 font-mono text-[10px] uppercase">/ Kendala</span>
          </span>

          <span className="sm:hidden text-xs font-semibold">
            Bantuan
          </span>
        </button>
      </aside>
    </HelpdeskContext.Provider>
  );
}
