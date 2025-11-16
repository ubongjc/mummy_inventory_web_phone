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
        className="text-[10px] text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1"
      >
        <FileText className="w-3 h-3" />
        Add notes
      </button>
    );
  }

  const truncated = notes.length > maxPreviewLength;
  const displayText = truncated ? `${notes.slice(0, maxPreviewLength)}...` : notes;

  return (
    <button
      onClick={onClick}
      className="text-[10px] text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1 group max-w-full"
    >
      <FileText className="w-3 h-3 flex-shrink-0" />
      <span className="truncate group-hover:underline font-normal">{displayText}</span>
    </button>
  );
}
