import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Users, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import BackButton from '@/components/ui/back-button';
import '@/styles/gradients.css';

const FacilityRequest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bookingDate: undefined as Date | undefined,
    startTime: '',
    endTime: '',
    facilityTypePreference: '',
    purpose: '',
    attendees: 1,
  });

  const facilityTypes = ['Dining hall', 'Basketball court', 'Swimming pool', 'Tennis court', 'Volleyball court'];
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.bookingDate || !formData.startTime || !formData.endTime) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('facility_bookings')
        .insert({
          user_id: user.id,
          booking_date: formData.bookingDate.toISOString().split('T')[0],
          start_time: formData.startTime,
          end_time: formData.endTime,
          facility_type_preference: formData.facilityTypePreference || null,
          purpose: formData.purpose || null,
          attendees: formData.attendees,
          status: 'pending',
          club_manager_approval: 'pending',
        });

      if (error) throw error;

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Facility Request Submitted',
        message: `Your facility request for ${format(formData.bookingDate, 'MMM d, yyyy')} from ${formData.startTime} to ${formData.endTime} has been submitted and is pending approval.`,
        type: 'info',
        is_read: false,
      });

      toast({
        title: 'Request submitted successfully',
        description: 'Your facility request has been sent for review.',
      });

      navigate('/bookings');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error submitting request',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-blue p-6 space-y-6">
      <BackButton />
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Request Facility</h1>
        <p className="text-lg text-muted-foreground">
          Submit a request for a facility and we'll assign you the best available option
        </p>
      </div>

      <Card className="max-w-2xl premium-card shadow-lg border-0">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-display font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            Facility Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Booking Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.bookingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.bookingDate ? format(formData.bookingDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.bookingDate}
                    onSelect={(date) => setFormData(prev => ({ ...prev, bookingDate: date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Select value={formData.startTime} onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Select value={formData.endTime} onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Number of Attendees</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.attendees}
                  onChange={(e) => setFormData(prev => ({ ...prev, attendees: parseInt(e.target.value) || 1 }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="facilityType">Facility Type Preference (Optional)</Label>
              <Select value={formData.facilityTypePreference} onValueChange={(value) => setFormData(prev => ({ ...prev, facilityTypePreference: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred facility type" />
                </SelectTrigger>
                <SelectContent>
                  {facilityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of your booking..."
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isSubmitting || !formData.bookingDate || !formData.startTime || !formData.endTime} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacilityRequest;
