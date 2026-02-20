import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Users, Bed } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import BackButton from '@/components/ui/back-button';
import '@/styles/gradients.css';

const AccommodationRequest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    guestName: '',
    guestAddress: '',
    arrivalDate: undefined as Date | undefined,
    arrivalTime: '',
    departureDate: undefined as Date | undefined,
    departureTime: '',
    purposeOfVisit: '',
    guests: 1,
    billingTo: '',
  });
  const [showBillingDialog, setShowBillingDialog] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.arrivalDate || !formData.departureDate || !formData.guestName || !formData.guestAddress || !formData.purposeOfVisit) return;
    setShowBillingDialog(true);
  };

  const handleFinalSubmit = async () => {
    if (!formData.billingTo) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('accommodation_bookings')
        .insert({
          user_id: user.id,
          guest_name: formData.guestName,
          guest_address: formData.guestAddress,
          check_in_date: formData.arrivalDate!.toISOString().split('T')[0],
          check_in_time: formData.arrivalTime,
          check_out_date: formData.departureDate!.toISOString().split('T')[0],
          check_out_time: formData.departureTime,
          purpose_of_visit: formData.purposeOfVisit,
          guests: formData.guests,
          billing_to: formData.billingTo,
          status: 'pending',
          hr_approval: 'pending',
        });

      if (error) throw error;

      // Send notification to user
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Accommodation Request Submitted',
        message: `Your accommodation request for ${formData.guestName} from ${format(formData.arrivalDate!, 'MMM d, yyyy')} to ${format(formData.departureDate!, 'MMM d, yyyy')} has been submitted and is pending HR approval.`,
        type: 'info',
        is_read: false,
      });

      toast({
        title: 'Request submitted successfully',
        description: 'Your accommodation request has been sent to HR for review.',
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
      setShowBillingDialog(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg-blue p-6 space-y-6">
      <BackButton />
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Request Accommodation</h1>
        <p className="text-lg text-muted-foreground">
          Submit a request for accommodation and we'll assign you the best available room
        </p>
      </div>

      <Card className="max-w-2xl premium-card shadow-lg border-0">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl font-display font-bold">
            <Bed className="h-6 w-6 text-primary" />
            Accommodation Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="guestName">Name of Guest *</Label>
              <Input
                id="guestName"
                value={formData.guestName}
                onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                placeholder="Enter guest's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestAddress">Address of Guest *</Label>
              <Textarea
                id="guestAddress"
                value={formData.guestAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, guestAddress: e.target.value }))}
                placeholder="Enter guest's full address"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="arrivalDate">Expected Date of Arrival *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.arrivalDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.arrivalDate ? format(formData.arrivalDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.arrivalDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, arrivalDate: date }))}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrivalTime">Expected Time of Arrival</Label>
                <Select value={formData.arrivalTime} onValueChange={(value) => setFormData(prev => ({ ...prev, arrivalTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Expected Date of Departure *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.departureDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.departureDate ? format(formData.departureDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.departureDate}
                      onSelect={(date) => setFormData(prev => ({ ...prev, departureDate: date }))}
                      disabled={(date) => date <= (formData.arrivalDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">Expected Time of Departure</Label>
                <Select value={formData.departureTime} onValueChange={(value) => setFormData(prev => ({ ...prev, departureTime: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <SelectItem key={hour} value={`${hour}:00`}>
                          {hour}:00
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purposeOfVisit">Purpose of Visit *</Label>
              <Textarea
                id="purposeOfVisit"
                placeholder="Describe the purpose of your visit..."
                value={formData.purposeOfVisit}
                onChange={(e) => setFormData(prev => ({ ...prev, purposeOfVisit: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests">Number of Guests</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="guests"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.guests}
                  onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={!formData.arrivalDate || !formData.departureDate || !formData.guestName || !formData.guestAddress || !formData.purposeOfVisit} className="w-full">
              Continue to Billing
            </Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Billing Information</DialogTitle>
            <DialogDescription>
              Please select who should be debited for the cost of services including accommodation and any food orders during the stay.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <RadioGroup value={formData.billingTo} onValueChange={(value) => setFormData(prev => ({ ...prev, billingTo: value }))}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="guest" id="guest" />
                <Label htmlFor="guest" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Guest</p>
                    <p className="text-sm text-muted-foreground">The guest will pay for all services</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="department" id="department" />
                <Label htmlFor="department" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">The department will be billed for all services</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBillingDialog(false)}>
              Back
            </Button>
            <Button onClick={handleFinalSubmit} disabled={!formData.billingTo || isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccommodationRequest;
