'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import EventEditModal from './EventEditModal';

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

const SECTION_TITLE = 'Events You Manage';

export default function HostedEvents({ userName }: HostedEventsProps) {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (updatedEvent: EventData) => {
    if (!updatedEvent) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEvent),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the event in the local state
        setEvents(events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
        setSelectedEvent(updatedEvent);
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
    if (!selectedEvent) return;

    setIsCancelling(true);
    setSaveError(null);

    try {
      const cancelledEvent = { ...selectedEvent, status: 'Cancelled' };
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelledEvent),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the event in the list to show it as cancelled
        setEvents(events.map(e => e.id === selectedEvent.id ? cancelledEvent : e));
        setSelectedEvent(cancelledEvent);
        setIsModalOpen(false);
      } else {
        setSaveError(data.message || 'Failed to cancel event');
      }
    } catch (err) {
      setSaveError('Failed to cancel event. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReactivateEvent = async () => {
    if (!selectedEvent) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const reactivatedEvent = { ...selectedEvent, status: 'Confirmed' };
      const response = await fetch('/portal/api/update-event', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reactivatedEvent),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the event in the list to show it as reactivated
        setEvents(events.map(e => e.id === selectedEvent.id ? reactivatedEvent : e));
        setSelectedEvent(reactivatedEvent);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-serif">{SECTION_TITLE}</h2>
        <p className="text-sm text-gray-500">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-serif">{SECTION_TITLE}</h2>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-serif">{SECTION_TITLE}</h2>
        <p className="text-sm text-gray-500">You don't have any upcoming events</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 font-serif">{SECTION_TITLE}</h2>

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
                    <h3 className="text-base font-medium text-gray-900 mb-1 font-serif">{event.name}</h3>
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

      <EventEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        onSave={handleSave}
        onCancel={handleCancelEvent}
        onReactivate={handleReactivateEvent}
        isSaving={isSaving}
        isCancelling={isCancelling}
        saveError={saveError}
      />
    </>
  );
}
