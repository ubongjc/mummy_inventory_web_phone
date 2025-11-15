'use client';

import { FileText } from 'lucide-react';

interface NotesDisplayProps {
  notes: string;
  onClick: () => void;
  maxPreviewLength?: number;
}

export default function NotesDisplay({
  notes,
  onClick,
  maxPreviewLength = 20,
}: NotesDisplayProps) {
  if (!notes || notes.trim() === '') {
    return (
      <button
        onClick={onClick}
        className="text-sm text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
      >
        <FileText className="w-4 h-4" />
        Add notes
      </button>
    );
  }

  const truncated = notes.length > maxPreviewLength;
  const displayText = truncated ? `${notes.slice(0, maxPreviewLength)}...` : notes;

  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1 group"
    >
      <FileText className="w-4 h-4 flex-shrink-0" />
      <span className="truncate group-hover:underline">{displayText}</span>
      {truncated && (
        <span className="text-xs text-blue-600 ml-1">(click to view all)</span>
      )}
    </button>
  );
}
