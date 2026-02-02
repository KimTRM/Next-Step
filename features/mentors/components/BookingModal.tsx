"use client";

import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { useBookSession } from '@/features/mentors/api';
import type { Id } from '@/features/mentors/types';

interface BookingModalProps {
    mentor: {
        _id: Id<'mentors'>;
        userId: Id<'users'>;
        name: string;
        role: string;
        hourlyRate?: number;
        currency?: string;
        offersFreeSession?: boolean;
        availableDays?: string[];
        availableTimeSlots?: string[];
        timezone?: string;
    };
    onClose: () => void;
}

export function BookingModal({ mentor, onClose }: BookingModalProps) {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [booked, setBooked] = useState(false);

    const bookSession = useBookSession();

    const handleSubmit = async () => {
        if (!selectedDate || !selectedTime) {
            setError('Please select a date and time.');
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            // Convert date and time to timestamp
            const dateTime = new Date(`${selectedDate}T${selectedTime}`);
            const timestamp = dateTime.getTime();

            await bookSession({
                mentorId: mentor._id,
                topic: notes.trim() || 'General mentorship session',
                scheduledDate: timestamp,
                duration: 60, // Default 1 hour
                message: notes.trim(),
            });
            setBooked(true);
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to book session';
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
                <h3 className="text-xl font-semibold mb-2">Book a Session with {mentor.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    {mentor.role}
                    {mentor.hourlyRate && (
                        <span className="ml-2 font-medium text-foreground">
                            {mentor.currency === 'PHP' ? '₱' : '$'}
                            {mentor.hourlyRate}/hour
                        </span>
                    )}
                    {mentor.offersFreeSession && (
                        <span className="ml-2 text-emerald-600 text-xs font-medium">
                            First session free
                        </span>
                    )}
                </p>

                {/* Date Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        disabled={submitting || booked}
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {mentor.availableDays && mentor.availableDays.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Available: {mentor.availableDays.join(', ')}
                        </p>
                    )}
                </div>

                {/* Time Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Select Time</label>
                    {mentor.availableTimeSlots && mentor.availableTimeSlots.length > 0 ? (
                        <select
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            disabled={submitting || booked}
                            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                        >
                            <option value="">Choose a time slot</option>
                            {mentor.availableTimeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                    {slot}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            disabled={submitting || booked}
                            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                        />
                    )}
                    {mentor.timezone && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Timezone: {mentor.timezone}
                        </p>
                    )}
                </div>

                {/* Notes */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">
                        Notes (Optional)
                    </label>
                    <textarea
                        placeholder="What would you like to discuss?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={submitting || booked}
                        className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24 disabled:opacity-60"
                    />
                </div>

                {error && (
                    <p className="text-sm text-destructive mb-3">{error}</p>
                )}
                {booked && (
                    <p className="text-sm text-emerald-600 mb-3">Session booked successfully!</p>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || booked || !selectedDate || !selectedTime}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Calendar className="h-4 w-4" />
                        {submitting ? 'Booking…' : booked ? 'Booked' : 'Book Session'}
                    </button>
                </div>
            </div>
        </div>
    );
}
