import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Heart, Coffee, Code, Sparkles, Rocket, Zap, Star, Trophy } from 'lucide-react';

const Footer = () => {
  const [clicks, setClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [konamiCode, setKonamiCode] = useState([]);
  const [showKonami, setShowKonami] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

  // Konami Code Easter Egg
  useEffect(() => {
    const handleKeyPress = (e) => {
      const newCode = [...konamiCode, e.key].slice(-10);
      setKonamiCode(newCode);
      
      if (newCode.join(',') === konami.join(',')) {
        setShowKonami(true);
        confetti();
        setTimeout(() => setShowKonami(false), 10000);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [konamiCode]);

  // Mouse trail effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const confetti = () => {
    // Simple confetti effect
    for (let i = 0; i < 50; i++) {
      createConfetti();
    }
  };

  const createConfetti = () => {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][Math.floor(Math.random() * 5)];
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-10px';
    confetti.style.opacity = '1';
    confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
    confetti.style.transition = 'top 3s, opacity 3s';
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    document.body.appendChild(confetti);
    
    setTimeout(() => {
      confetti.style.top = window.innerHeight + 'px';
      confetti.style.opacity = '0';
    }, 10);
    
    setTimeout(() => confetti.remove(), 3000);
  };

  const handleLogoClick = () => {
    setClicks(clicks + 1);
    if (clicks + 1 === 5) {
      setShowEasterEgg(true);
      setTimeout(() => setShowEasterEgg(false), 5000);
    }
  };

  const footerLinks = {
    Product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'FAQ', href: '#faq' },
      { name: 'Roadmap', href: '#' },
    ],
    Company: [
      { name: 'About', href: '#' },
      { name: 'Blog', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Resources: [
      { name: 'Documentation', href: '#' },
      { name: 'API Reference', href: '#' },
      { name: 'Support', href: '#' },
      { name: 'Status', href: '#' },
    ],
    Legal: [
      { name: 'Privacy', href: '#' },
      { name: 'Terms', href: '#' },
      { name: 'Security', href: '#' },
      { name: 'Cookies', href: '#' },
    ],
  };

  return (
    <footer className="relative border-t bg-background overflow-hidden">
      {/* EPIC ASCII Art Background */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none overflow-hidden">
        <pre className="text-[6px] leading-[6px] whitespace-pre font-mono p-4">

        </pre>
      </div>

      {/* Floating orbs */}
      <div className="absolute top-10 left-20 w-40 h-40 bg-gray-200/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-20 w-60 h-60 bg-gray-200/10 rounded-full blur-3xl animate-float-delayed" />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Konami Code Easter Egg */}
        {showKonami && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="p-8 rounded-3xl border-4 border-yellow-500 bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl max-w-lg animate-bounce-in">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="h-12 w-12 text-white animate-pulse" />
                <h3 className="font-bold text-3xl text-white">🎉 KONAMI CODE!</h3>
              </div>
              <p className="text-white text-lg mb-4 font-semibold">
                YOU'RE A LEGEND! 🚀 You found the ultimate secret!
              </p>
              <div className="p-4 rounded-xl bg-white/20 backdrop-blur font-mono text-sm text-white">
                <Code className="h-5 w-5 inline mr-2" />
                Achievement Unlocked: TRUE GAMER 🏆
              </div>
              <p className="text-white/80 text-sm mt-4">
                ↑ ↑ ↓ ↓ ← → ← → B A
              </p>
            </div>
          </div>
        )}

        {/* Logo Click Easter Egg */}
        {showEasterEgg && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fade-in-up">
            <div className="p-6 rounded-2xl border-2 bg-card shadow-2xl max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
                <h3 className="font-bold text-lg">🎉 Secret Unlocked!</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                You're curious! Here's a message from the devs:
              </p>
              <div className="p-3 rounded-lg bg-secondary font-mono text-xs space-y-2">
                <div><Code className="h-3 w-3 inline mr-2" />console.log("Thanks for exploring! 🚀");</div>
                <div><Rocket className="h-3 w-3 inline mr-2" />// Keep clicking around...</div>
                <div><Star className="h-3 w-3 inline mr-2" />// Try the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A</div>
              </div>
            </div>
          </div>
        )}

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
  <div className="h-7 w-7 rounded-md bg-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
    <span className="text-background font-bold text-xs">प</span>
  </div>
  <div className="flex flex-col leading-none">
    <span className="font-semibold text-[15px]">Pariksha</span>
    <span className="text-[9px] text-muted-foreground">परीक्षा • پَرِیکْشا</span>
  </div>
</Link>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4 text-sm flex items-center gap-2">
                {category}
                <span className="text-[10px] opacity-0 group-hover:opacity-100">✨</span>
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-all inline-flex items-center group hover:translate-x-1"
                    >
                      <span>{link.name}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Decorative Divider with animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <div className="px-4 bg-background flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-foreground/20 animate-pulse" />
              <div className="h-1 w-1 rounded-full bg-foreground/30 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="h-1.5 w-1.5 rounded-full bg-foreground/20 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2025 Pariksha</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline hover:text-foreground transition-colors cursor-default" title="All your exams are belong to us... just kidding! 😄">
              All rights reserved
            </span>
          </div>

          {/* Social Links with emojis */}
          <div className="flex items-center gap-4">
            {[
              { name: 'Twitter', href: '#', symbol: '𝕏', hover: 'Tweet about us!' },
              { name: 'GitHub', href: '#', symbol: '⚡', hover: 'Star us on GitHub!' },
              { name: 'Discord', href: '#', symbol: '💬', hover: 'Join our community!' },
              { name: 'LinkedIn', href: '#', symbol: 'in', hover: 'Connect with us!' },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-all hover:scale-125 hover:-translate-y-1"
                title={social.hover}
              >
                {social.symbol}
              </a>
            ))}
          </div>
        </div>
        {/* Secret hints */}
        <div className="mt-8 space-y-2 text-center">
          <p className="text-[10px] text-muted-foreground/50 font-mono select-none hover:text-muted-foreground transition-colors">
            Thanks for Visiting 
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
