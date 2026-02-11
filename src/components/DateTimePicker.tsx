import React, { useState } from 'react';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar as CalendarIcon, Clock, ChevronsUpDown, Check } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

interface DateTimePickerProps {
  date: string;
  time: string;
  timezone: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onTimezoneChange: (timezone: string) => void;
}

// Comprehensive list of valid timezones
const TIMEZONES = [
  'UTC',
  'GMT',
  'EST',
  'EDT',
  'CST',
  'CDT',
  'MST',
  'MDT',
  'PST',
  'PDT',
  'AKST',
  'AKDT',
  'HST',
  'AST',
  'NST',
  'BST',
  'CET',
  'CEST',
  'EET',
  'EEST',
  'IST',
  'JST',
  'KST',
  'AWST',
  'ACST',
  'AEST',
  'NZST',
  'NZDT',
].sort();

export function DateTimePicker({
  date,
  time,
  timezone,
  onDateChange,
  onTimeChange,
  onTimezoneChange,
}: DateTimePickerProps) {
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');

  const selectedDate = date ? new Date(date) : undefined;

  // Validate date format (MM/DD/YYYY)
  const validateDate = (dateValue: string) => {
    if (!dateValue) {
      setDateError('');
      return;
    }
    // Check MM/DD/YYYY format
    const dateRegex = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}$/;
    if (!dateRegex.test(dateValue)) {
      setDateError('Invalid date');
      return;
    }
    
    // Check if it's a valid date
    const parts = dateValue.split('/');
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    const testDate = new Date(year, month - 1, day);
    if (
      testDate.getFullYear() !== year ||
      testDate.getMonth() !== month - 1 ||
      testDate.getDate() !== day
    ) {
      setDateError('Invalid date');
    } else {
      setDateError('');
    }
  };

  // Validate time format (HH:MM)
  const validateTime = (timeValue: string) => {
    if (!timeValue) {
      setTimeError('');
      return;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(timeValue)) {
      setTimeError('Invalid time format (HH:MM)');
    } else {
      setTimeError('');
    }
  };



  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      onDateChange(`${year}-${month}-${day}`);
      setIsDateOpen(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  const [hours24, minutesPart] = time.split(':');
  const currentHour = hours24 || '09';
  const currentMinute = minutesPart || '00';

  const handleTimeSelect = (hour: string, minute: string) => {
    onTimeChange(`${hour}:${minute}`);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Date Input with Picker */}
      <div className="relative flex flex-col">
        <div className="h-4 relative z-10" style={{ marginBottom: '-4px' }}>
          {dateError && (
            <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
              {dateError}
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            type="text"
            value={formatDate(date)}
            onChange={(e) => {
              onDateChange(e.target.value);
              validateDate(e.target.value);
            }}
            onBlur={(e) => validateDate(e.target.value)}
            placeholder="MM/DD/YYYY"
            className={`bg-input-background pr-10 h-8 ${dateError ? 'border-destructive' : 'border-border'} ${isDateOpen ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''}`}
            style={{ fontSize: 'var(--text-xs)' }}
          />
          <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault();
                  setIsDateOpen(!isDateOpen);
                }}
              >
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: '5fr 1.2fr' }}>
        {/* Time Input with Picker */}
        <div className="relative flex flex-col">
          <div className="relative">
            <Input
              type="text"
              value={time}
              onChange={(e) => {
                onTimeChange(e.target.value);
                validateTime(e.target.value);
              }}
              onBlur={(e) => validateTime(e.target.value)}
              placeholder="HH:MM"
              className={`bg-input-background pr-10 h-8 ${timeError ? 'border-destructive' : 'border-border'} ${isTimeOpen ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''}`}
              style={{ fontSize: 'var(--text-xs)' }}
            />
            <Popover open={isTimeOpen} onOpenChange={setIsTimeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsTimeOpen(!isTimeOpen);
                  }}
                >
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4 bg-popover" align="start">
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium text-popover-foreground">Select Time</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Hour</label>
                      <Select
                        value={currentHour}
                        onValueChange={(hour) => handleTimeSelect(hour, currentMinute)}
                      >
                        <SelectTrigger className="w-full bg-input-background border-border" style={{ fontSize: 'var(--text-xs)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground max-h-[200px]">
                          {hours.map((hour) => (
                            <SelectItem key={hour} value={hour} style={{ fontSize: 'var(--text-xs)' }}>
                              {hour}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>Minute</label>
                      <Select
                        value={currentMinute}
                        onValueChange={(minute) => handleTimeSelect(currentHour, minute)}
                      >
                        <SelectTrigger className="w-full bg-input-background border-border" style={{ fontSize: 'var(--text-xs)' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover text-popover-foreground max-h-[200px]">
                          {minutes.map((minute) => (
                            <SelectItem key={minute} value={minute} style={{ fontSize: 'var(--text-xs)' }}>
                              {minute}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsTimeOpen(false)}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Done
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="h-4 mt-0.5">
            {timeError && (
              <span className="text-destructive" style={{ fontSize: 'var(--text-xs)' }}>
                {timeError}
              </span>
            )}
          </div>
        </div>

        {/* Timezone Searchable Dropdown */}
        <div className="relative flex flex-col">
          <Popover open={isTimezoneOpen} onOpenChange={setIsTimezoneOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isTimezoneOpen}
                className={`h-8 justify-between bg-input-background border-border hover:bg-input-background px-2 ${isTimezoneOpen ? 'ring-2 ring-ring ring-offset-2 ring-offset-background' : ''}`}
                style={{ fontSize: 'var(--text-xs)' }}
              >
                <span className="truncate" style={{ fontSize: 'var(--text-xs)' }}>
                  {timezone || 'Select...'}
                </span>
                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[140px] p-0 bg-popover" align="start">
              <Command className="bg-popover">
                <CommandInput 
                  placeholder="Search..." 
                  className="h-7 border-none"
                  style={{ fontSize: 'var(--text-xs)' }}
                />
                <CommandList>
                  <CommandEmpty className="py-2 text-center text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                    No timezone found.
                  </CommandEmpty>
                  <CommandGroup>
                    {TIMEZONES.map((tz) => (
                      <CommandItem
                        key={tz}
                        value={tz}
                        onSelect={() => {
                          onTimezoneChange(tz);
                          setIsTimezoneOpen(false);
                        }}
                        className="text-popover-foreground py-1.5"
                        style={{ fontSize: 'var(--text-xs)' }}
                      >
                        <Check
                          className={`mr-1.5 h-3 w-3 ${timezone === tz ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {tz}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="h-4 mt-0.5">
            {/* Reserved space for consistency with time input */}
          </div>
        </div>
      </div>
    </div>
  );
}
