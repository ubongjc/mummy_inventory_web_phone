"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemCount: number;
  itemCountMessage?: string; // Optional custom message to override the default itemCount display
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemCount,
  itemCountMessage,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = () => {
    if (confirmText === "delete") {
      onConfirm();
      setConfirmText("");
      onClose();
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-red-500">
          <div className="flex items-center justify-between p-4 border-b border-red-200 bg-red-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-bold text-red-900">{title}</h3>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-red-100 rounded"
            >
              <X className="w-5 h-5 text-red-900" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-black font-semibold mb-2">{message}</p>
              <p className="text-red-700 font-bold text-lg">
                {itemCountMessage || `${itemCount} ${itemCount === 1 ? "item" : "items"} will be permanently deleted!`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-black">
                Type <span className="text-red-600 font-mono">delete</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type 'delete' here"
                className="w-full px-3 py-2 border-2 border-gray-400 rounded focus:ring-2 focus:ring-red-500 outline-none text-black font-semibold text-base"
                autoFocus
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={confirmText !== "delete"}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
