'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

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

interface EventEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData | null;
  onSave: (event: EventData) => Promise<void>;
  onCancel: () => Promise<void>;
  onReactivate: () => Promise<void>;
  isSaving: boolean;
  isCancelling: boolean;
  saveError: string | null;
}

const TYPE_OPTIONS = ['Public', 'Members', 'Private'];

function formatDateTimeForInput(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function EventEditModal({
  isOpen,
  onClose,
  event,
  onSave,
  onCancel,
  onReactivate,
  isSaving,
  isCancelling,
  saveError,
}: EventEditModalProps) {
  const [editedEvent, setEditedEvent] = React.useState<EventData | null>(event);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  React.useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
      setShowCancelConfirm(false);
    }
  }, [event]);

  const handleFieldChange = (field: keyof EventData, value: string | undefined) => {
    if (editedEvent) {
      setEditedEvent({ ...editedEvent, [field]: value });
    }
  };

  const handleSave = async () => {
    if (editedEvent) {
      await onSave(editedEvent);
    }
  };

  const handleCancelEvent = async () => {
    await onCancel();
    setShowCancelConfirm(false);
  };

  if (!editedEvent) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background overlay - only show on desktop */}
      <div className="hidden lg:block fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen on mobile, centered modal on desktop */}
      <div className="fixed inset-0 lg:flex lg:items-center lg:justify-center lg:p-4">
        <DialogPanel className="w-full h-full lg:h-auto lg:max-w-2xl lg:rounded-lg bg-background-surface dark:bg-background-surface-dark flex flex-col lg:block lg:overflow-y-auto lg:shadow-xl lg:max-h-[90vh]">
          {/* Mobile header with close button */}
          <div className="lg:hidden flex-shrink-0 bg-background-surface dark:bg-background-surface-dark border-b border-border-light dark:border-border-light-dark px-4 py-3 flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-brand dark:text-brand-dark-mode font-display">
              Edit Event
            </DialogTitle>
            <button
              onClick={onClose}
              className="p-2 text-text-muted dark:text-text-muted-dark hover:text-text-secondary dark:hover:text-text-secondary-dark transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block p-6 sm:p-8">
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-brand dark:text-brand-dark-mode mb-6 font-display">
              Edit Event
            </DialogTitle>
          </div>

          {/* Scrollable content area on mobile */}
          <div className="flex-1 overflow-y-auto lg:overflow-visible">
            <div className="p-4 lg:px-6 lg:pb-6 lg:pt-0 sm:lg:px-8 sm:lg:pb-8">

            {saveError && (
              <div className="mb-4 p-3 bg-error-bg dark:bg-error-bg-dark border border-error-bg dark:border-error-bg-dark text-error-text dark:text-error-text-dark text-sm">
                {saveError}
              </div>
            )}

            <div className="space-y-4 lg:space-y-5 font-sans">
              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={editedEvent.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand font-merriweather"
                />
              </div>

              {/* Start Date and Time */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(editedEvent.startDate)}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
                />
              </div>

              {/* End Date and Time */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formatDateTimeForInput(editedEvent.endDate)}
                  onChange={(e) => handleFieldChange('endDate', e.target.value || undefined)}
                  className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
                />
              </div>

              {/* Assigned Rooms (Read-only) */}
              {editedEvent.assignedRooms && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                    Assigned Rooms
                  </label>
                  <input
                    type="text"
                    value={editedEvent.assignedRooms}
                    disabled
                    className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-subtle dark:bg-background-subtle-dark text-text-tertiary dark:text-text-tertiary-dark cursor-not-allowed"
                  />
                  <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">Room assignment is managed by staff</p>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  Type
                </label>
                <select
                  value={editedEvent.type || ''}
                  onChange={(e) => handleFieldChange('type', e.target.value)}
                  className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
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
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  Event Description
                </label>
                <textarea
                  value={editedEvent.description || ''}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand font-merriweather"
                  placeholder="Describe your event..."
                />
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  Notes (Internal)
                </label>
                <textarea
                  value={editedEvent.notes || ''}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand font-merriweather"
                  placeholder="Internal notes (optional)"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                  Event URL
                </label>
                <input
                  type="url"
                  value={editedEvent.url || ''}
                  onChange={(e) => handleFieldChange('url', e.target.value)}
                  className="w-full px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-surface dark:bg-background-subtle-dark text-text-primary dark:text-text-primary-dark focus:ring-2 focus:ring-brand dark:focus:ring-brand focus:border-brand dark:focus:border-brand"
                />
              </div>

              {/* Status Display */}
              {editedEvent.status && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                    Status
                  </label>
                  <div className="px-3 py-2.5 lg:px-4 border border-border-medium dark:border-border-medium-dark bg-background-subtle dark:bg-background-subtle-dark text-text-secondary dark:text-text-secondary-dark">
                    {editedEvent.status}
                  </div>
                  <p className="mt-1.5 text-xs text-text-muted dark:text-text-muted-dark">Status is managed by staff</p>
                </div>
              )}
            </div>

            {/* Action Buttons - Desktop only */}
            <div className="hidden lg:flex lg:mt-8 flex-col sm:flex-row sm:justify-between sm:items-center gap-3 lg:gap-4 font-sans">
              <div>
                {editedEvent.status === 'Cancelled' ? (
                  <button
                    onClick={onReactivate}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Reactivating...' : 'Reactivate Event'}
                  </button>
                ) : showCancelConfirm ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                    <span className="text-sm text-gray-700">Are you sure?</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelEvent}
                        disabled={isCancelling}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isCancelling ? 'Cancelling...' : 'Yes, cancel event'}
                      </button>
                      <button
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={isCancelling}
                        className="flex-1 sm:flex-none px-3 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isSaving || isCancelling}
                    className="w-full sm:w-auto px-4 py-2 bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    Cancel Event
                  </button>
                )}
              </div>

              <div className="flex gap-2 lg:gap-3">
                <button
                  onClick={onClose}
                  disabled={isSaving || isCancelling}
                  className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Close
                </button>
                {editedEvent.status !== 'Cancelled' && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving || isCancelling}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>

            {/* Mobile action buttons in scrollable area */}
            <div className="lg:hidden pt-4 space-y-3 font-sans">
              {editedEvent.status === 'Cancelled' ? (
                <button
                  onClick={onReactivate}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Reactivating...' : 'Reactivate Event'}
                </button>
              ) : showCancelConfirm ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">Are you sure you want to cancel this event?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEvent}
                      disabled={isCancelling}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {isCancelling ? 'Cancelling...' : 'Yes, cancel event'}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={isCancelling}
                      className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
                    >
                      No
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={isSaving || isCancelling}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                >
                  Cancel Event
                </button>
              )}
            </div>
            </div>
          </div>

          {/* Mobile sticky footer */}
          <div className="lg:hidden flex-shrink-0 bg-background-surface dark:bg-background-surface-dark border-t border-border-light dark:border-border-light-dark px-4 py-3 font-sans">
            <div className="flex gap-2">
              {editedEvent.status !== 'Cancelled' && (
                <button
                  onClick={handleSave}
                  disabled={isSaving || isCancelling}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

// Need to import React for useState
import React from 'react';
