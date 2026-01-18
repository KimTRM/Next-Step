/**
 * Booking Modal Component
 * 
 * Comprehensive booking flow for scheduling mentorship sessions
 */

'use client';

import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { Calendar, Clock, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BookingModalProps {
    mentor: {
        _id: Id<'mentors'>;
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

// Time slot options
const TIME_SLOTS = [
    { value: 'morning', label: 'Morning (9:00 AM - 12:00 PM)', hours: [9, 10, 11] },
    { value: 'afternoon', label: 'Afternoon (1:00 PM - 5:00 PM)', hours: [13, 14, 15, 16] },
    { value: 'evening', label: 'Evening (6:00 PM - 9:00 PM)', hours: [18, 19, 20] },
];

// Duration options
const DURATION_OPTIONS = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
];

// Get next 14 days
const getNextTwoWeeks = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }
    return days;
};

export function BookingModal({ mentor, onClose }: BookingModalProps) {
    const [step, setStep] = useState<'details' | 'confirmation' | 'success' | 'error'>('details');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [selectedHour, setSelectedHour] = useState<number | null>(null);
    const [duration, setDuration] = useState<number>(60);
    const [topic, setTopic] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const bookSession = async (payload: {
        mentorId: Id<'mentors'>;
        topic: string;
        scheduledDate: number;
        duration: number;
        message?: string;
    }) => {
        const res = await fetch('/api/mentors/book', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
            throw new Error(json?.error?.message || 'Failed to book session');
        }
    };

    const availableDates = getNextTwoWeeks();
    const mentorAvailableDays = mentor.availableDays?.map(d => d.toLowerCase()) || [];

    // Filter dates by mentor's available days
    const filteredDates = availableDates.filter(date => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return mentorAvailableDays.length === 0 || mentorAvailableDays.includes(dayName);
    });

    // Get available hours based on selected time slot and mentor's availability
    const getAvailableHours = () => {
        if (!selectedTimeSlot) return [];
        const slot = TIME_SLOTS.find(s => s.value === selectedTimeSlot);
        if (!slot) return [];

        // Filter by mentor's available time slots if specified
        const mentorTimeSlots = mentor.availableTimeSlots?.map(t => t.toLowerCase()) || [];
        if (mentorTimeSlots.length > 0 && !mentorTimeSlots.includes(selectedTimeSlot)) {
            return [];
        }

        return slot.hours;
    };

    const handleBooking = async () => {
        if (!selectedDate || !selectedHour || !topic.trim()) {
            setErrorMessage('Please fill in all required fields');
            return;
        }

        try {
            const scheduledDate = new Date(selectedDate);
            scheduledDate.setHours(selectedHour, 0, 0, 0);

            await bookSession({
                mentorId: mentor._id,
                topic,
                scheduledDate: scheduledDate.getTime(),
                duration,
                message: message || undefined,
            });

            setStep('success');
        } catch (error) {
            console.error('Booking failed:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to book session');
            setStep('error');
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatTime = (hour: number) => {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:00 ${period}`;
    };

    const calculatePrice = () => {
        if (!mentor.hourlyRate) return null;
        const hours = duration / 60;
        const price = mentor.hourlyRate * hours;
        return price;
    };

    if (step === 'success') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Session Booked!</h3>
                        <p className="text-muted-foreground">
                            Your mentorship session with {mentor.name} has been scheduled.
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-medium">{selectedDate && formatDate(selectedDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span className="font-medium">
                                    {selectedHour !== null && formatTime(selectedHour)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Duration:</span>
                                <span className="font-medium">{duration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Topic:</span>
                                <span className="font-medium">{topic}</span>
                            </div>
                        </div>
                    </div>
                    <Button onClick={onClose} className="w-full">
                        Done
                    </Button>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Booking Failed</h3>
                        <p className="text-muted-foreground">{errorMessage}</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button onClick={() => setStep('details')} className="flex-1">
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'confirmation') {
        const price = calculatePrice();
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold">Confirm Booking</h3>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold mb-3">Session Details</h4>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Mentor</span>
                                    <p className="font-medium">{mentor.name}</p>
                                    <p className="text-sm text-muted-foreground">{mentor.role}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Date & Time</span>
                                    <p className="font-medium">
                                        {selectedDate && formatDate(selectedDate)} at{' '}
                                        {selectedHour !== null && formatTime(selectedHour)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Duration</span>
                                    <p className="font-medium">{duration} minutes</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Topic</span>
                                    <p className="font-medium">{topic}</p>
                                </div>
                                {price && (
                                    <div className="pt-3 border-t">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Total</span>
                                            <span className="text-xl font-bold">
                                                {mentor.currency === 'PHP' ? '₱' : '$'}
                                                {price.toFixed(2)}
                                            </span>
                                        </div>
                                        {mentor.offersFreeSession && (
                                            <Badge variant="secondary" className="mt-2">
                                                First session free
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => setStep('details')} className="flex-1">
                            Back
                        </Button>
                        <Button onClick={handleBooking} className="flex-1">
                            Confirm Booking
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold">Book a Session</h3>
                        <p className="text-sm text-muted-foreground">
                            with {mentor.name} • {mentor.role}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Date Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-3">
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Select Date *
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                            {filteredDates.map((date, index) => {
                                const isSelected = selectedDate?.toDateString() === date.toDateString();
                                const isToday = date.toDateString() === new Date().toDateString();
                                return (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setSelectedHour(null);
                                        }}
                                        className={`p-3 rounded-lg border text-center transition-all ${isSelected
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'hover:border-primary hover:bg-primary/5'
                                            }`}
                                    >
                                        <div className="text-xs font-medium">
                                            {date.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className="text-lg font-bold">
                                            {date.getDate()}
                                        </div>
                                        {isToday && (
                                            <div className="text-xs text-primary">Today</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Time Slot Selection */}
                    {selectedDate && (
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                <Clock className="h-4 w-4 inline mr-2" />
                                Select Time Slot *
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {TIME_SLOTS.map((slot) => {
                                    const isAvailable =
                                        !mentor.availableTimeSlots ||
                                        mentor.availableTimeSlots.length === 0 ||
                                        mentor.availableTimeSlots.includes(slot.value);
                                    const isSelected = selectedTimeSlot === slot.value;
                                    return (
                                        <button
                                            key={slot.value}
                                            onClick={() => {
                                                setSelectedTimeSlot(slot.value);
                                                setSelectedHour(null);
                                            }}
                                            disabled={!isAvailable}
                                            className={`p-4 rounded-lg border text-left transition-all ${!isAvailable
                                                ? 'opacity-50 cursor-not-allowed'
                                                : isSelected
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'hover:border-primary hover:bg-primary/5'
                                                }`}
                                        >
                                            <div className="font-medium capitalize">{slot.value}</div>
                                            <div className="text-xs opacity-80 mt-1">
                                                {slot.hours[0]}:00 - {slot.hours[slot.hours.length - 1] + 1}:00
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Hour Selection */}
                    {selectedTimeSlot && (
                        <div>
                            <label className="block text-sm font-medium mb-3">Select Hour *</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                {getAvailableHours().map((hour) => {
                                    const isSelected = selectedHour === hour;
                                    return (
                                        <button
                                            key={hour}
                                            onClick={() => setSelectedHour(hour)}
                                            className={`p-3 rounded-lg border text-center transition-all ${isSelected
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'hover:border-primary hover:bg-primary/5'
                                                }`}
                                        >
                                            {formatTime(hour)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Duration */}
                    {selectedHour !== null && (
                        <div>
                            <label className="block text-sm font-medium mb-3">Duration *</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {DURATION_OPTIONS.map((option) => {
                                    const isSelected = duration === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => setDuration(option.value)}
                                            className={`p-3 rounded-lg border transition-all ${isSelected
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'hover:border-primary hover:bg-primary/5'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Topic */}
                    <div>
                        <label htmlFor="topic" className="block text-sm font-medium mb-2">
                            Session Topic *
                        </label>
                        <input
                            id="topic"
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Career guidance, Portfolio review, Interview prep"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label htmlFor="message" className="block text-sm font-medium mb-2">
                            Additional Message (Optional)
                        </label>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Share more details about what you'd like to discuss..."
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Price Preview */}
                    {mentor.hourlyRate && selectedHour !== null && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Estimated Cost:</span>
                                <span className="text-xl font-bold">
                                    {mentor.currency === 'PHP' ? '₱' : '$'}
                                    {calculatePrice()?.toFixed(2)}
                                </span>
                            </div>
                            {mentor.offersFreeSession && (
                                <Badge variant="secondary" className="mt-2">
                                    First session free
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t p-6">
                    <Button
                        onClick={() => setStep('confirmation')}
                        disabled={!selectedDate || selectedHour === null || !topic.trim()}
                        className="w-full"
                        size="lg"
                    >
                        Continue to Confirmation
                    </Button>
                </div>
            </div>
        </div>
    );
}
