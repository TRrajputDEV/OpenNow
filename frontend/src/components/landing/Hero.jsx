import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      
      {/* Floating gradient orbs */}
      <div className="absolute top-40 -left-20 w-72 h-72 bg-gray-300/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-40 -right-20 w-96 h-96 bg-gray-300/20 rounded-full blur-3xl animate-float-delayed" />
      
      <div className="container mx-auto px-4 py-32 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Top Badge */}
          <div className="flex justify-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border/50 text-[13px] font-medium hover:bg-accent transition-colors cursor-default group">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-muted-foreground">Live</span>
              </div>
              <div className="h-3 w-px bg-border" />
              <span className="group-hover:text-foreground transition-colors">1,000+ educators trust us</span>
            </div>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 animate-fade-in-up">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              Exams that grade
              <br />
              <span className="relative inline-block">
                themselves
                <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 5 150 5 198 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-muted-foreground/30"/>
                </svg>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Create, manage, and grade exams instantly. 
              <br className="hidden sm:block" />
              No more manual work. Just results.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              <Button asChild size="lg" className="h-12 px-8 font-medium group shadow-lg hover:shadow-xl transition-all">
                <Link to="/register">
                  Get started for free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 font-medium border-2">
                <Link to="#features">
                  See how it works
                </Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
              {[
                { icon: CheckCircle2, text: 'Free 14-day trial' },
                { icon: CheckCircle2, text: 'No credit card' },
                { icon: CheckCircle2, text: 'Cancel anytime' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <item.icon className="h-4 w-4 text-green-500" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto">
            {[
              { label: 'Grading time', value: '< 1 second', trend: '+100%', delay: '0s' },
              { label: 'Accuracy rate', value: '99.9%', trend: 'Perfect', delay: '0.1s' },
              { label: 'Time saved', value: '10+ hours', trend: 'per week', delay: '0.2s' },
            ].map((stat, i) => (
              <div
                key={i}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: stat.delay }}
              >
                {/* Glow effect on hover */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-300 to-gray-200 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity" />
                
                <div className="relative p-6 rounded-xl bg-card border border-border hover:border-foreground/20 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Floating Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            {[
              { icon: Sparkles, text: 'AI-powered' },
              { icon: CheckCircle2, text: 'Auto-grading' },
              { icon: TrendingUp, text: 'Real-time analytics' },
            ].map((pill, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium hover:bg-accent hover:border-border transition-all cursor-default"
              >
                <pill.icon className="h-4 w-4 text-muted-foreground" />
                <span>{pill.text}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
            {/* Decorative connecting lines at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Floating connection dots */}
      <div className="absolute bottom-20 left-1/4 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-foreground/20 animate-pulse" />
        <div className="h-px w-24 bg-foreground/10" />
      </div>
      
      <div className="absolute bottom-40 right-1/4 flex items-center gap-2">
        <div className="h-px w-24 bg-foreground/10" />
        <div className="h-2 w-2 rounded-full bg-foreground/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

    </section>
  );
};

export default Hero;
