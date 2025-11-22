'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Globe,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Package,
} from 'lucide-react';

interface Item {
  id: string;
  name: string;
  unit: string;
  totalQuantity: number;
  price: number;
}

interface PublicPageData {
  slug: string;
  title: string;
  phonePublic: string | null;
  emailPublic: string | null;
  itemsJson: Array<{ itemId: string; displayName: string }>;
  isActive: boolean;
}

export default function PublicPageSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [publicPage, setPublicPage] = useState<PublicPageData | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form fields
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [phonePublic, setPhonePublic] = useState('');
  const [emailPublic, setEmailPublic] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [slugError, setSlugError] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [contactMethods, setContactMethods] = useState<string[]>(['app']);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const publicUrl = `${baseUrl}/book/${slug}`;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch public page settings
      const pageResponse = await fetch('/api/public-page');
      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        if (pageData.publicPage) {
          setPublicPage(pageData.publicPage);
          setSlug(pageData.publicPage.slug || '');
          setTitle(pageData.publicPage.title || '');
          setPhonePublic(pageData.publicPage.phonePublic || '');
          setEmailPublic(pageData.publicPage.emailPublic || '');
          setIsActive(pageData.publicPage.isActive);
          setCustomMessage(pageData.publicPage.customMessage || '');
          setContactMethods(pageData.publicPage.contactMethods || ['app']);

          // Set selected items
          const itemIds = (pageData.publicPage.itemsJson || []).map((item: any) => item.itemId);
          setSelectedItems(new Set(itemIds));
        }
      }

      // Fetch available items
      const itemsResponse = await fetch('/api/items');
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const validateSlug = (value: string): boolean => {
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    if (!value) {
      setSlugError('Slug is required');
      return false;
    }
    if (!slugRegex.test(value)) {
      setSlugError('Slug must be 3-50 characters, lowercase letters, numbers, and hyphens only');
      return false;
    }
    setSlugError('');
    return true;
  };

  const handleSlugChange = (value: string) => {
    // Auto-format: lowercase and replace spaces with hyphens
    const formatted = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
    setSlug(formatted);
    validateSlug(formatted);
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    if (!validateSlug(slug)) {
      setError('Please fix the slug before saving');
      return;
    }

    if (selectedItems.size === 0) {
      setError('Please select at least one item to display');
      return;
    }

    setSaving(true);

    try {
      const itemsJson = Array.from(selectedItems).map((itemId) => {
        const item = items.find((i) => i.id === itemId);
        return {
          itemId,
          displayName: item?.name || '',
        };
      });

      const response = await fetch('/api/public-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title,
          phonePublic: phonePublic || null,
          emailPublic: emailPublic || null,
          itemsJson,
          isActive,
          customMessage: customMessage || null,
          contactMethods,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess(true);
      setPublicPage(data.publicPage);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Public Booking Page</h1>
              <p className="text-gray-600 mt-1">
                Share a custom link for customers to check availability and submit rental inquiries
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">Settings saved successfully!</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

              <div className="space-y-4">
                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page URL Slug *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{baseUrl}/book/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        slugError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="my-business"
                    />
                  </div>
                  {slugError && <p className="text-red-600 text-sm mt-1">{slugError}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    Lowercase letters, numbers, and hyphens only (3-50 characters)
                  </p>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rental Equipment & Services"
                  />
                </div>

                {/* Public Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={emailPublic}
                    onChange={(e) => setEmailPublic(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@yourbusiness.com"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Displayed on public page for customer inquiries
                  </p>
                </div>

                {/* Public Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phonePublic}
                    onChange={(e) => setPhonePublic(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1234567890"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Displayed on public page for customer inquiries
                  </p>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Add a custom welcome message or instructions for your customers..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This message will be displayed at the top of your public booking page
                  </p>
                </div>

                {/* Contact Methods */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How should customers contact you?
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'app', label: 'Through Application (Dashboard notifications)' },
                      { value: 'email', label: 'Email' },
                      { value: 'sms', label: 'SMS' },
                      { value: 'whatsapp', label: 'WhatsApp' },
                      { value: 'social', label: 'Social Media' },
                    ].map((method) => (
                      <label key={method.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contactMethods.includes(method.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setContactMethods([...contactMethods, method.value]);
                            } else {
                              setContactMethods(contactMethods.filter((m) => m !== method.value));
                            }
                          }}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-sm text-gray-700">{method.label}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Select all methods you want customers to use to contact you
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between py-3 border-t border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900">Page Status</h3>
                    <p className="text-sm text-gray-500">
                      {isActive ? 'Your page is live and accessible' : 'Your page is hidden'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Item Selection */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Select Items to Display</h2>
              </div>

              {items.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleItemSelection(item.id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedItems.has(item.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            ${item.price.toFixed(2)}/{item.unit} • {item.totalQuantity} available
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => {}}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No items found. Create items in your inventory first.</p>
                  <Link
                    href="/inventory"
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                  >
                    Go to Inventory
                  </Link>
                </div>
              )}

              <p className="text-sm text-gray-500 mt-4">
                Selected {selectedItems.size} of {items.length} items
              </p>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving || !slug || selectedItems.size === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Preview & Share */}
          <div className="space-y-6">
            {/* Share Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">Share Your Page</h3>

              {slug && !slugError ? (
                <div className="space-y-3">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Your public URL</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{publicUrl}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </button>
                    {isActive && (
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Preview
                      </a>
                    )}
                  </div>

                  {!isActive && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <EyeOff className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                          Page is currently hidden. Enable it to make it public.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <p>Enter a valid slug to generate your public URL</p>
                </div>
              )}
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Choose a unique URL slug for your page</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Select which items to display</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Share the link with potential customers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Receive inquiry notifications via email/SMS</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
