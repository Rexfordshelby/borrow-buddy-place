
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock } from "lucide-react";
import { addDays, isAfter, isBefore, isSameDay, startOfDay } from "date-fns";

interface AvailabilitySlot {
  date: string;
  available: boolean;
  time_slots?: string[];
}

interface AvailabilityCalendarProps {
  itemId: string;
  availability: AvailabilitySlot[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({
  itemId,
  availability,
  onDateSelect,
  selectedDate,
  className,
}) => {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);

  useEffect(() => {
    processAvailability();
  }, [availability]);

  const processAvailability = () => {
    const available: Date[] = [];
    const unavailable: Date[] = [];

    availability.forEach((slot) => {
      const date = new Date(slot.date);
      if (slot.available) {
        available.push(date);
      } else {
        unavailable.push(date);
      }
    });

    setAvailableDates(available);
    setUnavailableDates(unavailable);
  };

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      isSameDay(availableDate, date)
    );
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => 
      isSameDay(unavailableDate, date)
    );
  };

  const getTimeSlots = (date: Date) => {
    const slot = availability.find(slot => 
      isSameDay(new Date(slot.date), date)
    );
    return slot?.time_slots || [];
  };

  const modifiers = {
    available: availableDates,
    unavailable: unavailableDates,
    selected: selectedDate ? [selectedDate] : [],
  };

  const modifiersStyles = {
    available: {
      backgroundColor: '#dcfce7',
      color: '#166534',
    },
    unavailable: {
      backgroundColor: '#fecaca',
      color: '#991b1b',
    },
    selected: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
  };

  const disabledDays = {
    before: startOfDay(new Date()),
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <CalendarDays className="h-5 w-5 mr-2" />
          Availability Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          disabled={disabledDays}
          className="rounded-md border"
        />

        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Selected</span>
          </div>
        </div>

        {selectedDate && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Available Times
            </h4>
            <div className="flex flex-wrap gap-2">
              {getTimeSlots(selectedDate).map((timeSlot, index) => (
                <Badge key={index} variant="outline">
                  {timeSlot}
                </Badge>
              ))}
              {getTimeSlots(selectedDate).length === 0 && (
                <span className="text-gray-500 text-sm">
                  {isDateAvailable(selectedDate) 
                    ? "All day available" 
                    : "No times available"}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityCalendar;
