import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Calendar, Users, CheckCircle2 } from 'lucide-react';

const FacilitiesList: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Facilities</h1>
        <p className="text-lg text-muted-foreground">
          Request facilities and we'll assign you the best available option
        </p>
      </div>

      {/* Request Card */}
      <div className="max-w-2xl mx-auto">
        <Card className="premium-card text-center shadow-lg border-2">
          <CardHeader className="pb-6">
            <div className="mx-auto w-20 h-20 bg-primary/15 rounded-full flex items-center justify-center mb-6">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-display font-bold text-foreground">Request Facility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-foreground text-xl font-medium leading-relaxed">
              Submit your facility requirements and our team will assign you the perfect space based on availability and your needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base font-medium">
              <div className="flex items-center gap-3 justify-center text-foreground">
                <Calendar className="h-5 w-5 text-primary" />
                <span>Flexible timing</span>
              </div>
              <div className="flex items-center gap-3 justify-center text-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>Any group size</span>
              </div>
              <div className="flex items-center gap-3 justify-center text-foreground">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Best match guaranteed</span>
              </div>
            </div>

            <div className="pt-4">
              <Link to="/facilities/request">
                <Button variant="hero" size="lg" className="w-full md:w-auto px-8">
                  Request Facility
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How it works */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-display font-bold text-center mb-8 text-foreground">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground">Submit Request</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Fill out your facility requirements including date, time, and purpose.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground">Admin Review</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Our team reviews your request and assigns the best available facility that matches your needs.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/15 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="font-bold text-lg mb-3 text-foreground">Get Notified</h3>
              <p className="text-base text-muted-foreground leading-relaxed">
                Receive a notification with your assigned facility details and booking confirmation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesList;
