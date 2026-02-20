import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Logo from '@/components/layout/Logo';
import { 
  Building2, 
  UtensilsCrossed, 
  CalendarDays, 
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Crown,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    icon: Building2,
    title: 'Accommodation Booking',
    description: 'Reserve rooms and suites with real-time availability and instant confirmations.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Food Ordering',
    description: 'Order meals in advance with dietary preferences and scheduled delivery.',
  },
  {
    icon: CalendarDays,
    title: 'Facility Reservations',
    description: 'Book meeting rooms, recreational areas, and more with conflict detection.',
  },
  {
    icon: ShieldCheck,
    title: 'Multi-Level Approvals',
    description: 'Streamlined approval workflow from department heads to managing directors.',
  },
];

const benefits = [
  'Real-time booking confirmations',
  'Email and dashboard notifications',
  'Dietary preference tracking',
  'Interactive availability calendar',
  'Multi-level approval workflow',
  'Third-party guest access',
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hero-gradient" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative container mx-auto px-4 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 mb-8 animate-fade-in">
              <img src="/TOPP club house new logo.jpeg" alt="TOPP" className="w-8 h-8 rounded-md" />
              <span className="font-semibold">TOPP Club House</span>
              <Crown className="w-4 h-4 text-accent" />
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 animate-slide-up">
              Where Excellence{' '}
              <span className="text-gradient-gold">Meets</span>{' '}
              Convenience
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              The premier booking platform for TOPP employees and partners. 
              Seamlessly reserve accommodations, order meals, and book facilities.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/register">
                <Button variant="hero" size="xl" className="group">
                  Get Started
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="glass" size="xl">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 md:gap-8 text-white/50 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Secure & Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 rounded-full text-accent text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed for the modern enterprise
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="premium-card p-6 group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-accent/20 to-accent/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-accent group-hover:text-accent-foreground transition-colors" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Designed for{' '}
                <span className="text-gradient-gold">Excellence</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                TOPP Club House streamlines your booking experience with powerful features 
                and an intuitive interface that saves time and eliminates friction.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-accent/10 rounded-3xl flex items-center justify-center">
                <div className="absolute inset-4 bg-card rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto mb-6 animate-float">
                      <img src="/TOPP club house new logo.jpeg" alt="TOPP Club House" className="w-full h-full object-contain" />
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      Premium Experience
                    </h3>
                    <p className="text-muted-foreground">
                      Built for TOPP's elite workforce
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }} />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join the platform trusted by TOPP employees and partners worldwide.
          </p>
          <Link to="/register">
            <Button variant="hero" size="xl" className="group">
              Create Your Account
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo variant="light" size="sm" />
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} TOPP Club House. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
