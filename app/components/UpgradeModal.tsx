'use client';

import { X, Crown, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
  limit?: {
    current: number;
    max: number;
    type: string;
  };
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title = 'Upgrade to Premium',
  message,
  feature,
  limit,
}: UpgradeModalProps) {
  if (!isOpen) {
    return null;
  }

  const defaultMessage =
    feature || limit
      ? limit
        ? `You've reached the free plan limit of ${limit.max} ${limit.type}. Upgrade to Premium for unlimited ${limit.type}.`
        : `This feature requires a Premium subscription.`
      : 'Unlock all features and remove limits by upgrading to Premium.';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-400 rounded-xl">
                <Crown className="w-8 h-8 text-gray-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <p className="text-blue-100 text-sm">
                  ₦15,000/month • Cancel anytime
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Message */}
            <p className="text-gray-700 text-base leading-relaxed">
              {message || defaultMessage}
            </p>

            {/* Limit Info */}
            {limit && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Current Usage
                  </span>
                  <span className="text-sm font-bold text-orange-600">
                    {limit.current} / {limit.max}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((limit.current / limit.max) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Premium Benefits */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-gray-900 text-sm mb-3">
                Premium includes:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Unlimited items, customers & bookings</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Advanced analytics & reports</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Online payments & tax calculator</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Customer reminders & notifications</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span>Team collaboration & much more</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/billing"
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold text-center transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Premium
              </Link>

              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-all"
              >
                Maybe Later
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center pt-2">
              Cancel anytime • No long-term commitment
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
