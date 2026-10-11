import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string; // e.g., 'max-w-xl', 'max-w-2xl', 'max-w-3xl'
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footer,
  maxWidth = 'max-w-2xl',
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen ${maxWidth} bg-white shadow-2xl border-l border-slate-200 flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right`}
          role="dialog"
          aria-modal="true"
        >
          {/* Sticky Drawer Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm flex items-start justify-between gap-4 sticky top-0 z-10">
            <div className="min-w-0 flex-1">
              {badge && <div className="mb-2 flex items-center gap-2">{badge}</div>}
              {title && (
                <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{subtitle}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
              title="Close panel (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-slate-800">
            {children}
          </div>

          {/* Sticky Drawer Footer */}
          {footer && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 sticky bottom-0 z-10">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Drawer;
