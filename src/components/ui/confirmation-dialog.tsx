'use client';

import { AlertTriangle, Info, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'info' | 'success' | 'error';
  isDestructive?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'warning',
  isDestructive = false,
}: ConfirmationDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 rounded-2xl border-0 shadow-2xl">
        {/* Header with icon and title */}
        <div className="flex flex-col items-center text-center p-6 pb-4">
          {isDestructive ? (
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-red-500" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <Info className="h-8 w-8 text-blue-500" />
            </div>
          )}
          
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
          )}
          
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-100">
          <div className="flex">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-center text-gray-600 hover:bg-gray-50 transition-colors font-medium border-r border-gray-100"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                isDestructive 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}