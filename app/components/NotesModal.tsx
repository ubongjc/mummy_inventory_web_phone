'use client';

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notes: string) => void | Promise<void>;
  initialNotes: string;
  title?: string;
  maxLength?: number;
}

export default function NotesModal({
  isOpen,
  onClose,
  onSave,
  initialNotes,
  title = 'Edit Notes',
  maxLength = 50,
}: NotesModalProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNotes(initialNotes);
    setSaving(false);
  }, [initialNotes, isOpen]);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape, true);
    return () => document.removeEventListener('keydown', handleEscape, true);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      await onSave(notes);
      // Close modal after successful save
      setSaving(false);
      onClose();
    } catch (error) {
      console.error('Error saving notes:', error);
      setSaving(false);
      // Don't close modal on error - let user try again
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Optional: close on backdrop click
    // onClose();
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) {
    return null;
  }

  const modal = (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
      onMouseDown={handleMouseDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={handleDialogClick}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value.slice(0, maxLength))}
                maxLength={maxLength}
                rows={8}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-black font-medium resize-none text-base"
                placeholder="Add your notes here..."
              />
              <p className="text-sm text-gray-600 mt-2">
                {notes.length}/{maxLength} characters
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-semibold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  );

  // Render in a portal to avoid parent listeners capturing
  return typeof window !== 'undefined'
    ? ReactDOM.createPortal(modal, document.body)
    : null;
}
