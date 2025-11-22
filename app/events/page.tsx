'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Calendar,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface Event {
  id: string;
  eventId: string;
  eventType: string;
  title: string;
  dateStart: string;
  dateEnd: string | null;
  locationRaw: string | null;
  locationState: string | null;
  locationCityLga: string | null;
  venueName: string | null;
  contactName: string | null;
  contactRole: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  organizerOrg: string | null;
  organizerSocial: string | null;
  sourcePlatform: string;
  sourceUrl: string;
  confidence: string;
  notes: string | null;
}

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [eventType, setEventType] = useState('');
  const [locationState, setLocationState] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const eventTypes = [
    { value: '', label: 'All Event Types' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'traditional_marriage', label: 'Traditional Marriage' },
    { value: 'burial', label: 'Burial' },
    { value: 'memorial', label: 'Memorial Service' },
    { value: 'child_dedication', label: 'Child Dedication' },
    { value: 'christening', label: 'Christening' },
    { value: 'naming', label: 'Naming Ceremony' },
    { value: 'thanksgiving', label: 'Thanksgiving' },
    { value: 'anniversary', label: 'Anniversary' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'other_ceremony', label: 'Other Ceremony' },
  ];

  const nigeriaStates = [
    '', 'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti',
    'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
    'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
    'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  ];

  // Check authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/sign-in');
    }
  }, [status, router]);

  // Fetch events
  useEffect(() => {
    if (status === 'authenticated') {
      fetchEvents();
    }
  }, [status, currentPage, eventType, locationState, searchQuery, dateFrom, dateTo]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (eventType) params.append('eventType', eventType);
      if (locationState) params.append('locationState', locationState);
      if (searchQuery) params.append('q', searchQuery);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/events?${params}`);

      if (response.status === 403) {
        setError('Premium subscription required to access Events Near You');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data.events);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'jsonl') => {
    try {
      const response = await fetch(`/api/events/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      wedding: 'bg-pink-100 text-pink-700',
      traditional_marriage: 'bg-purple-100 text-purple-700',
      burial: 'bg-gray-100 text-gray-700',
      memorial: 'bg-blue-100 text-blue-700',
      child_dedication: 'bg-green-100 text-green-700',
      christening: 'bg-teal-100 text-teal-700',
      naming: 'bg-yellow-100 text-yellow-700',
      thanksgiving: 'bg-orange-100 text-orange-700',
      anniversary: 'bg-rose-100 text-rose-700',
      birthday: 'bg-indigo-100 text-indigo-700',
      other_ceremony: 'bg-slate-100 text-slate-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <h2 className="text-xl font-bold text-red-900 mb-2">Access Restricted</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <Link
            href="/premium"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mb-2">Events Near You</h1>
          <p className="text-purple-100">
            Discover local weddings, funerals, and ceremonies in Nigeria that need rentals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Filter Events</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, location, venue, contact..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={locationState}
                onChange={(e) => setLocationState(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All States</option>
                {nigeriaStates.filter(s => s).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Export */}
            <div className="flex items-end gap-2">
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={() => handleExport('jsonl')}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                JSONL
              </button>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Found</h3>
              <p className="text-gray-500">
                Try adjusting your filters or check back later for new events
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                        {event.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        Confidence: {(parseFloat(event.confidence) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Date */}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Date</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(event.dateStart)}
                        {event.dateEnd && ` - ${formatDate(event.dateEnd)}`}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  {(event.locationRaw || event.venueName) && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Location</p>
                        <p className="text-sm text-gray-600">
                          {event.venueName || event.locationRaw}
                        </p>
                        {event.locationState && (
                          <p className="text-xs text-gray-500">{event.locationState} State</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {(event.contactName || event.contactPhone || event.contactEmail) && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact</p>
                        {event.contactName && (
                          <p className="text-sm text-gray-600">
                            {event.contactName}
                            {event.contactRole && ` (${event.contactRole})`}
                          </p>
                        )}
                        {event.contactPhone && (
                          <p className="text-sm text-gray-600">{event.contactPhone}</p>
                        )}
                        {event.contactEmail && (
                          <p className="text-sm text-gray-600">{event.contactEmail}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Organizer */}
                  {event.organizerOrg && (
                    <div className="flex items-start gap-2">
                      <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Organizer</p>
                        <p className="text-sm text-gray-600">{event.organizerOrg}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Source: {event.sourcePlatform}
                  </div>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                  >
                    View Source
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {event.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-600">
                    <strong>Note:</strong> {event.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
