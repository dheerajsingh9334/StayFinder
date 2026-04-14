import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Mail,
  Menu,
  Moon,
  Pause,
  Play,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/store/ThemeContext';

interface NavbarHeroProps {
  brandName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  backgroundImage?: string;
  videoUrl?: string;
  emailPlaceholder?: string;
  embedded?: boolean;
  className?: string;
}

const NavbarHero: React.FC<NavbarHeroProps> = ({
  brandName = 'nexus',
  heroTitle = 'Innovation Meets Simplicity',
  heroSubtitle,
  heroDescription = 'Discover cutting-edge solutions designed for the modern digital landscape.',
  backgroundImage = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80',
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  emailPlaceholder = 'enter@email.com',
  embedded = false,
  className,
}) => {
  const [email, setEmail] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleEmailSubmit = () => {
    console.log('Email submitted:', email);
  };

  const handlePlayVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.play();
    setIsVideoPlaying(true);
    setIsVideoPaused(false);
  };

  const handlePauseVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    setIsVideoPaused(true);
  };

  const handleResumeVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.play();
    setIsVideoPaused(false);
  };

  const handleVideoEnded = () => {
    setIsVideoPlaying(false);
    setIsVideoPaused(false);
  };

  const ThemeToggleButton = () => {
    if (!mounted) {
      return <div className="h-10 w-10" />;
    }

    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="shrink-0 rounded-full bg-muted p-2.5 transition-colors hover:bg-border"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
      </button>
    );
  };

  const shellClassName = embedded
    ? `relative overflow-hidden rounded-[28px] border border-white/70     shadow-[0_24px_56px_rgba(15,12,8,0.14)] ${className ?? ''}`
    : `absolute inset-0 overflow-y-auto bg-background ${className ?? ''}`;

  const contentClassName = embedded
    ? 'w-full p-4 sm:p-6 lg:p-8'
    : 'mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8';

  return (
    <main className={shellClassName}>
      <div className={contentClassName}>
        {!embedded && (
          <div className="relative z-20 flex items-center justify-between gap-4 py-2">
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="shrink-0 cursor-pointer pb-1 text-2xl font-bold text-foreground"
              >
                {brandName}
              </a>
              <nav className="hidden font-medium text-muted-foreground lg:flex">
                <ul className="flex items-center space-x-2">
                  <li>
                    <a
                      href="#"
                      className="rounded-lg px-3 py-2 text-sm transition-colors hover:text-foreground"
                    >
                      About
                    </a>
                  </li>
                  <li className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('desktop-resources')}
                      className="flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:text-foreground"
                    >
                      Resources
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${openDropdown === 'desktop-resources' ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openDropdown === 'desktop-resources' && (
                      <ul className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lg">
                        <li>
                          <a
                            href="#"
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            Submenu 1
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            Submenu 2
                          </a>
                        </li>
                      </ul>
                    )}
                  </li>
                  <li>
                    <a
                      href="#"
                      className="rounded-lg px-3 py-2 text-sm transition-colors hover:text-foreground"
                    >
                      Blog
                    </a>
                  </li>
                  <li className="relative">
                    <button
                      type="button"
                      onClick={() => toggleDropdown('desktop-pricing')}
                      className="flex items-center rounded-lg px-3 py-2 text-sm transition-colors hover:text-foreground"
                    >
                      Plans & Pricing
                      <ChevronDown
                        className={`ml-1 h-4 w-4 transition-transform ${openDropdown === 'desktop-pricing' ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {openDropdown === 'desktop-pricing' && (
                      <ul className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-lg">
                        <li>
                          <a
                            href="#"
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            Plan A
                          </a>
                        </li>
                        <li>
                          <a
                            href="#"
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            Plan B
                          </a>
                        </li>
                      </ul>
                    )}
                  </li>
                </ul>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 lg:flex">
                <a
                  href="#"
                  className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  Login
                </a>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-muted-foreground"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <ThemeToggleButton />
              <div className="relative lg:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-xl border-none bg-transparent p-2 transition-colors hover:bg-muted"
                >
                  <Menu className="h-6 w-6" />
                </button>
                {isMobileMenuOpen && (
                  <ul className="absolute right-0 top-full z-30 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
                    <li>
                      <a
                        href="#"
                        className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => toggleDropdown('mobile-resources')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Resources
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openDropdown === 'mobile-resources' ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openDropdown === 'mobile-resources' && (
                        <ul className="ml-4 mt-1 border-l border-border pl-3">
                          <li>
                            <a
                              href="#"
                              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              Submenu 1
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              Submenu 2
                            </a>
                          </li>
                        </ul>
                      )}
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Blog
                      </a>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => toggleDropdown('mobile-pricing')}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        Plans & Pricing
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openDropdown === 'mobile-pricing' ? 'rotate-180' : ''}`}
                        />
                      </button>
                      {openDropdown === 'mobile-pricing' && (
                        <ul className="ml-4 mt-1 border-l border-border pl-3">
                          <li>
                            <a
                              href="#"
                              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              Plan A
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                            >
                              Plan B
                            </a>
                          </li>
                        </ul>
                      )}
                    </li>
                    <li className="mt-2 space-y-2 border-t border-border pt-2">
                      <a
                        href="#"
                        className="block w-full rounded-lg px-3 py-2 text-center text-sm text-foreground hover:bg-muted"
                      >
                        Login
                      </a>
                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-3 py-2.5 text-sm font-medium text-background"
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className={`${embedded ? 'pt-0 pb-6 sm:pb-8' : 'pt-4 pb-10 sm:pt-6 sm:pb-12'} text-center`}
        >
          <div className="mx-auto max-w-2xl">
            {heroSubtitle ? (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700/80">
                {heroSubtitle}
              </p>
            ) : null}
            <h1
              className={`${embedded ? 'text-2xl sm:text-4xl' : 'text-3xl sm:text-5xl md:text-5xl'} font-bold tracking-tight text-foreground`}
            >
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              {heroDescription}
            </p>
            {!embedded && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground sm:h-5 sm:w-5" />
                  <input
                    type="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full max-w-xs rounded-full border-border bg-muted py-2 pl-10 pr-4 text-sm font-medium text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:py-3 sm:pl-11 sm:text-base"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleEmailSubmit}
                  className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium normal-case text-background transition-colors hover:bg-muted-foreground sm:px-6 sm:py-3 sm:text-base"
                >
                  Join Now
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <header
          className={`relative w-full overflow-hidden ${embedded ? 'aspect-16/7 rounded-3xl' : 'aspect-video rounded-3xl'}`}
        >
          <img
            src={backgroundImage}
            alt="Hero background"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isVideoPlaying ? 'opacity-0' : 'opacity-100'}`}
          />
          <video
            ref={videoRef}
            src={videoUrl}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}
            onEnded={handleVideoEnded}
            playsInline
            muted
          />
          <div className="absolute bottom-5 right-5 z-10">
            {!isVideoPlaying ? (
              <button
                type="button"
                onClick={handlePlayVideo}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-transparent/20 shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-transparent/30"
              >
                <Play className="ml-1 h-7 w-7 fill-white text-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={isVideoPaused ? handleResumeVideo : handlePauseVideo}
                className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-transparent/20 shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-transparent/30"
              >
                {isVideoPaused ? (
                  <Play className="ml-1 h-7 w-7 fill-white text-white" />
                ) : (
                  <Pause className="h-7 w-7 fill-white text-white" />
                )}
              </button>
            )}
          </div>
        </header>
      </div>
    </main>
  );
};

export { NavbarHero };
