'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { format } from 'date-fns';

interface HostedEventsProps {
  userName: string;
}

interface EventData {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  description?: string;
  assignedRooms?: string;
  notes?: string;
  type?: string;
  status?: string;
  url?: string;
  host?: string;
}

const STATUS_OPTIONS = [
  'Idea',
  'Maybe',
  'Confirmed',
  'To invoice',
  'Invoiced',
  'Paid',
  'Cancelled',
  'Recurring',
  'Declined'
];

const TYPE_OPTIONS = [
  'Public',
  'Members',
  'Private'
];

const SECTION_TITLE = 'Events You Manage';

export default function HostedEvents({ userName }: HostedEventsProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [editedEvent, setEditedEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    async function fetchHostedEvents() {
      if (!userName) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/portal/api/hosted-events?userName=${encodeURIComponent(userName)}`);
        const data = await response.json();

        if (response.ok && data.events) {
          setEvents(data.events);
        } else {
          setError(data.message || 'Failed to load events');
        }
      } catch (err) {
        setError('Failed to load hosted events');
      } finally {
        setLoading(false);
      }
    }

    fetchHostedEvents();
  }, [userName]);

  const handleEventClick = (event: EventData) => {
    setSelectedEvent(event);
    setEditedEvent({ ...event });
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleFieldChange = (field: keyof EventData, value: string) => {
    if (editedEvent) {
      setEditedEvent({ ...editedEvent, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!editedEvent) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedEvent),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the event in the local state
        setEvents(events.map(e => e.id === editedEvent.id ? editedEvent : e));
        setSelectedEvent(editedEvent);
        setIsModalOpen(false);
      } else {
        setSaveError(data.message || 'Failed to save changes');
      }
    } catch (err) {
      setSaveError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!editedEvent) return;

    setIsCancelling(true);
    setSaveError(null);

    try {
      const cancelledEvent = { ...editedEvent, status: 'Cancelled' };
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelledEvent),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the event in the list to show it as cancelled
        setEvents(events.map(e => e.id === editedEvent.id ? cancelledEvent : e));
        setSelectedEvent(cancelledEvent);
        setEditedEvent(cancelledEvent);
        setIsModalOpen(false);
        setShowCancelConfirm(false);
      } else {
        setSaveError(data.message || 'Failed to cancel event');
        setShowCancelConfirm(false);
      }
    } catch (err) {
      setSaveError('Failed to cancel event. Please try again.');
      setShowCancelConfirm(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateEvent = async () => {
    if (!editedEvent) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const reactivatedEvent = { ...editedEvent, status: 'Confirmed' };
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reactivatedEvent),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the event in the list to show it as reactivated
        setEvents(events.map(e => e.id === editedEvent.id ? reactivatedEvent : e));
        setSelectedEvent(reactivatedEvent);
        setEditedEvent(reactivatedEvent);
        setIsModalOpen(false);
      } else {
        setSaveError(data.message || 'Failed to reactivate event');
      }
    } catch (err) {
      setSaveError('Failed to reactivate event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDateTimeForInput = (dateString: string | undefined) => {
    if (!dateString) return '';
    // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
    return dateString.slice(0, 16);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{SECTION_TITLE}</h2>
        <p className="text-sm text-gray-500">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{SECTION_TITLE}</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{SECTION_TITLE}</h2>
        <p className="text-sm text-gray-500">You don't have any upcoming events</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{SECTION_TITLE}</h2>

        <div className="space-y-3">
          {events.map((event) => {
            const startDate = new Date(event.startDate);
            const formattedDate = format(startDate, 'MMM d, yyyy');
            const formattedTime = format(startDate, 'h:mm a');

            // Status color mapping
            const getStatusColor = (status?: string) => {
              switch (status) {
                case 'Confirmed':
                  return 'bg-green-100 text-green-800';
                case 'Cancelled':
                  return 'bg-red-100 text-red-800';
                case 'Recurring':
                  return 'bg-purple-100 text-purple-800';
                case 'Maybe':
                  return 'bg-yellow-100 text-yellow-800';
                case 'Idea':
                  return 'bg-blue-100 text-blue-800';
                case 'To invoice':
                case 'Invoiced':
                  return 'bg-orange-100 text-orange-800';
                case 'Paid':
                  return 'bg-teal-100 text-teal-800';
                case 'Declined':
                  return 'bg-gray-100 text-gray-800';
                default:
                  return 'bg-gray-100 text-gray-700';
              }
            };

            return (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{event.name}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{formattedDate} at {formattedTime}</span>
                      {event.assignedRooms && <span>📍 {event.assignedRooms}</span>}
                      {event.status && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Event Details Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="relative z-50"
      >
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Full-screen container for centering */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            {editedEvent && (
              <>
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-4">
                  Edit Event
                </DialogTitle>

                {saveError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {saveError}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Name
                    </label>
                    <input
                      type="text"
                      value={editedEvent.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Start Date and Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeForInput(editedEvent.startDate)}
                      onChange={(e) => handleFieldChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* End Date and Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeForInput(editedEvent.endDate)}
                      onChange={(e) => handleFieldChange('endDate', e.target.value || undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Assigned Rooms (Read-only) */}
                  {editedEvent.assignedRooms && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned Rooms
                      </label>
                      <input
                        type="text"
                        value={editedEvent.assignedRooms}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                      <p className="mt-1 text-xs text-gray-500">Room assignment is managed by staff</p>
                    </div>
                  )}

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={editedEvent.type || ''}
                      onChange={(e) => handleFieldChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select type...</option>
                      {TYPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Event Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Description
                    </label>
                    <textarea
                      value={editedEvent.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your event..."
                    />
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (Internal)
                    </label>
                    <textarea
                      value={editedEvent.notes || ''}
                      onChange={(e) => handleFieldChange('notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Internal notes (optional)"
                    />
                  </div>

                  {/* URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event URL
                    </label>
                    <input
                      type="url"
                      value={editedEvent.url || ''}
                      onChange={(e) => handleFieldChange('url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center">
                  <div>
                    {editedEvent.status === 'Cancelled' ? (
                      <button
                        onClick={handleReactivateEvent}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Reactivating...' : 'Reactivate Event'}
                      </button>
                    ) : (
                      showCancelConfirm ? (
                        <div className="flex gap-2 items-center">
                          <span className="text-sm text-gray-700">Are you sure?</span>
                          <button
                            onClick={handleCancelEvent}
                            disabled={isCancelling}
                            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            {isCancelling ? 'Cancelling...' : 'Yes, cancel event'}
                          </button>
                          <button
                            onClick={() => setShowCancelConfirm(false)}
                            disabled={isCancelling}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={isSaving || isCancelling}
                          className="px-4 py-2 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          Cancel Event
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSaving || isCancelling}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      Close
                    </button>
                    {editedEvent.status !== 'Cancelled' && (
                      <button
                        onClick={handleSave}
                        disabled={isSaving || isCancelling}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
