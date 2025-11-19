import Navbar from '../layout/Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import FAQ from './FAQ';
import CTA from './CTA';
import Footer from './Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      
      {/* Flowing decorative lines throughout page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Vertical flowing line - left */}
        <div className="absolute top-0 left-[10%] w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-30" />
        
        {/* Vertical flowing line - right */}
        <div className="absolute top-0 right-[10%] w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-30" />
        
        {/* Curved connecting line */}
        <svg className="absolute top-1/3 left-0 w-full h-96 opacity-20" preserveAspectRatio="none">
          <path 
            d="M 0,100 Q 400,50 800,100 T 1600,100" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none"
            className="text-border"
          />
        </svg>
        
        {/* Dots pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl">
          <div className="grid grid-cols-12 gap-8 opacity-10">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-foreground" />
            ))}
          </div>
        </div>
      </div>
      
      <div className="pt-16 relative z-10">
        <Hero />
        
        {/* Connecting element between sections */}
        <div className="relative py-12 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative px-6 bg-background">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
              <div className="h-px w-12 bg-gradient-to-r from-foreground to-transparent" />
              <div className="h-2 w-2 rounded-full bg-foreground/50" />
              <div className="h-px w-12 bg-gradient-to-l from-foreground to-transparent" />
              <div className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
            </div>
          </div>
        </div>
        
        <Features />
        
        {/* Visual separator with flowing line */}
        <div className="relative h-32 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <path 
              d="M 0,50 Q 200,20 400,50 T 800,50 T 1200,50 T 1600,50" 
              stroke="currentColor" 
              strokeWidth="1" 
              fill="none"
              className="text-border opacity-50"
            />
            <circle cx="400" cy="50" r="3" className="fill-foreground opacity-30 animate-pulse" />
            <circle cx="800" cy="50" r="3" className="fill-foreground opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <circle cx="1200" cy="50" r="3" className="fill-foreground opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
          </svg>
        </div>
        
        <HowItWorks />
        <Pricing />
        
        {/* Decorative break */}
        <div className="py-16 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-border" />
            <div className="h-3 w-3 rounded-full border-2 border-border" />
            <div className="h-px w-20 bg-border" />
            <div className="h-3 w-3 rounded-full border-2 border-border bg-foreground/10" />
            <div className="h-px w-20 bg-border" />
            <div className="h-3 w-3 rounded-full border-2 border-border" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-border" />
          </div>
        </div>
        
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
