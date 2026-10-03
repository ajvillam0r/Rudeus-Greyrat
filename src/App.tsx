/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagneticElement } from './components/MagneticElement';
import { RollingText } from './components/RollingText';
import { HeroPillButton } from './components/HeroPillButton';
import { CustomCursor } from './components/CustomCursor';
import { CinematicModal, OriginPoint } from './components/CinematicModal';
import { BackgroundVideo } from './components/BackgroundVideo';
import { HeroTitle } from './components/HeroTitle';
import { BottomMarquee } from './components/BottomMarquee';

/**
 * Custom hook to type out text character-by-character
 */
function useTypewriter(
  text: string,
  speed: number = 38,
  startDelay: number = 600
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      let currentIndex = 0;
      intervalId = setInterval(() => {
        currentIndex++;
        setDisplayed(text.slice(0, currentIndex));
        if (currentIndex >= text.length) {
          if (intervalId) clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

type ModalType =
  | 'ABOUT'
  | 'ABILITIES'
  | 'JOURNEY'
  | 'ARCHIVE'
  | 'STORY'
  | 'TIMELINE'
  | 'WORLD'
  | 'MAGIC_WATER'
  | 'MAGIC_EARTH'
  | 'MAGIC_FIRE'
  | 'MAGIC_WIND'
  | null;

export default function App() {
  // Video scrubbing refs (untouched mechanics)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Mana core resonance active // Laplace Factor detected');
  
  // Instant Modal State (Decoupled & Pre-rendered)
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [renderedModal, setRenderedModal] = useState<ModalType>(null);
  const [modalOrigin, setModalOrigin] = useState<OriginPoint | null>(null);
  const [selectedMagic, setSelectedMagic] = useState<string | null>(null);

  // Interactive Typography & Cursor State
  const [cursorText, setCursorText] = useState<string | null>(null);
  const [cursorHovered, setCursorHovered] = useState(false);

  // Typewriter text for Rudeus Greyrat
  const typewriterText =
    'Born again in another world. Given a second life. This time, he intends to live it differently.';
  const { displayed, done } = useTypewriter(typewriterText, 38, 600);

  // Keep last rendered modal content cached during closing transition
  useEffect(() => {
    if (activeModal) {
      setRenderedModal(activeModal);
    }
  }, [activeModal]);

  // Seek handler for seek-flooding prevention
  const handleSeeked = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) {
      isSeekingRef.current = false;
      return;
    }
    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      targetTimeRef.current = videoRef.current.currentTime || 0;
      try {
        videoRef.current.currentTime = 0.01;
      } catch {
        // Ignore unready state errors
      }
    }
  }, []);

  // Mouse scrub listener on window (isolated: zero React re-renders)
  useEffect(() => {
    const SENSITIVITY = 0.8;

    const handleMouseMove = (e: MouseEvent) => {
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) return;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      const newTargetTime = Math.min(Math.max(0, targetTimeRef.current + timeOffset), video.duration);
      targetTimeRef.current = newTargetTime;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = newTargetTime;
      }
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      if (prevXRef.current === null) {
        prevXRef.current = clientX;
        return;
      }
      const delta = clientX - prevXRef.current;
      prevXRef.current = clientX;

      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) return;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      const newTargetTime = Math.min(Math.max(0, targetTimeRef.current + timeOffset), video.duration);
      targetTimeRef.current = newTargetTime;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = newTargetTime;
      }
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Action pill buttons reveal 400ms after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Instantaneous modal opening with single coordinate calculation
  const openModalImmediate = useCallback((
    modalType: ModalType,
    e?: React.MouseEvent<HTMLElement>
  ) => {
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      setModalOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else {
      setModalOrigin({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
    // Instant activation in the exact same event frame
    setActiveModal(modalType);
  }, []);

  // Mana outline button interaction
  const handleManaClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setModalOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    try {
      await navigator.clipboard.writeText(
        'Rudeus Greyrat // Mana: Unlimited Potential — Silent Incantation & Laplace Factor'
      );
      setToastMessage('Mana signature copied // Laplace Factor reserves online');
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2400);
    } catch {
      setToastMessage('Mana reserves: Unquantified & active');
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2400);
    }
  }, []);

  const displayModal = activeModal || renderedModal;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#07111F] text-[#F4F5F2] select-none font-['HelveticaNowDisplayW01-Rg',sans-serif]">
      {/* Awwwards Custom Smooth Cursor (Hidden on touch devices, pointer-events-none) */}
      <CustomCursor cursorText={cursorText} isHovered={cursorHovered} />

      {/* BACKGROUND VIDEO (Stable, Memoized, Zero Re-renders, Zero Scaling Lag) */}
      <BackgroundVideo
        videoRef={videoRef}
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* CINEMATIC ATMOSPHERE OVERLAY (Subtle navy tint, vignette, faint magical geometry - does NOT obscure video) */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-gradient-to-t from-[#07111F]/90 via-[#07111F]/35 to-[#07111F]/60" />
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-40 mix-blend-soft-light"
        style={{
          background: 'radial-gradient(circle at 65% 45%, rgba(124, 203, 255, 0.12) 0%, transparent 65%)',
        }}
      />

      {/* Subtle Arcane Circle in Background */}
      <div
        className="fixed -right-24 -bottom-24 w-[500px] h-[500px] md:w-[700px] md:h-[700px] z-[1] pointer-events-none opacity-[0.06] animate-arcane-spin"
        aria-hidden="true"
      >
        <svg viewBox="0 0 400 400" fill="none" className="w-full h-full text-[#7CCBFF]">
          <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 8" />
          <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 6" />
          <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="0.5" />
          <polygon points="200,40 338,280 62,280" stroke="currentColor" strokeWidth="0.6" />
          <polygon points="200,360 338,120 62,120" stroke="currentColor" strokeWidth="0.6" />
        </svg>
      </div>

      {/* NAVBAR (fixed, z-index: 10) */}
      <header className="fixed top-0 left-0 right-0 z-10 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center backdrop-blur-[2px]">
        {/* Logo: RUDEUS + secondary label GREYRAT + subtle arcane glyph */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={(e) => openModalImmediate('ABOUT', e)}
          onMouseEnter={() => {
            setCursorText('CODEX');
            setCursorHovered(true);
          }}
          onMouseLeave={() => {
            setCursorText(null);
            setCursorHovered(false);
          }}
        >
          <div className="flex items-baseline gap-1.5 select-none">
            <span
              className="text-[21px] sm:text-[26px] tracking-tight text-[#F4F5F2] font-medium group-hover:text-[#7CCBFF] transition-colors duration-200"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              RUDEUS
            </span>
            <span className="text-[11px] sm:text-[13px] tracking-[0.2em] text-[#A7B2BE] font-normal uppercase group-hover:text-white transition-colors duration-200">
              GREYRAT
            </span>
          </div>

          {/* Subtle magical symbol */}
          <span
            className="flex items-center justify-center text-[#7CCBFF]/80 select-none ml-0.5 group-hover:rotate-45 group-hover:scale-110 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]"
            aria-hidden="true"
            title="Arcane Magic Seal"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-5 sm:h-5 opacity-80"
            >
              <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="0.8" />
              <polygon points="10,2 17,14 3,14" stroke="currentColor" strokeWidth="0.6" />
              <polygon points="10,18 17,6 3,6" stroke="currentColor" strokeWidth="0.6" />
              <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            </svg>
          </span>
        </div>

        {/* Desktop nav links with Instant Click Response & Rolling Typography */}
        <nav
          aria-label="Character Navigation"
          className="hidden md:flex items-center text-[21px] lg:text-[23px] text-[#F4F5F2] font-normal tracking-wide"
        >
          <MagneticElement
            strength={10}
            textStrength={1.25}
            onClick={(e) => openModalImmediate('ABOUT', e)}
            onMouseEnter={() => {
              setCursorText('READ');
              setCursorHovered(true);
            }}
            onMouseLeave={() => {
              setCursorText(null);
              setCursorHovered(false);
            }}
          >
            <RollingText text="ABOUT" />
          </MagneticElement>
          <span className="text-[#A7B2BE] select-none mx-0.5">,&nbsp;</span>

          <MagneticElement
            strength={10}
            textStrength={1.25}
            onClick={(e) => openModalImmediate('ABILITIES', e)}
            onMouseEnter={() => {
              setCursorText('MAGIC');
              setCursorHovered(true);
            }}
            onMouseLeave={() => {
              setCursorText(null);
              setCursorHovered(false);
            }}
          >
            <RollingText text="ABILITIES" />
          </MagneticElement>
          <span className="text-[#A7B2BE] select-none mx-0.5">,&nbsp;</span>

          <MagneticElement
            strength={10}
            textStrength={1.25}
            onClick={(e) => openModalImmediate('JOURNEY', e)}
            onMouseEnter={() => {
              setCursorText('MAP');
              setCursorHovered(true);
            }}
            onMouseLeave={() => {
              setCursorText(null);
              setCursorHovered(false);
            }}
          >
            <RollingText text="JOURNEY" />
          </MagneticElement>
          <span className="text-[#A7B2BE] select-none mx-0.5">,&nbsp;</span>

          <MagneticElement
            strength={10}
            textStrength={1.25}
            onClick={(e) => openModalImmediate('ARCHIVE', e)}
            onMouseEnter={() => {
              setCursorText('CODEX');
              setCursorHovered(true);
            }}
            onMouseLeave={() => {
              setCursorText(null);
              setCursorHovered(false);
            }}
          >
            <RollingText text="ARCHIVE" />
          </MagneticElement>
        </nav>

        {/* Desktop CTA (right): ENTER THE WORLD */}
        <MagneticElement
          strength={12}
          textStrength={1.3}
          onClick={(e) => openModalImmediate('WORLD', e)}
          onMouseEnter={() => {
            setCursorText('ENTER');
            setCursorHovered(true);
          }}
          onMouseLeave={() => {
            setCursorText(null);
            setCursorHovered(false);
          }}
        >
          <span className="hidden md:inline-block relative text-[21px] lg:text-[23px] text-[#F4F5F2] font-normal tracking-wide cursor-pointer py-1 group">
            <span className="group-hover:text-[#7CCBFF] transition-colors duration-200">
              ENTER THE WORLD
            </span>
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#7CCBFF] origin-left transform scale-x-75 group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" />
          </span>
        </MagneticElement>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden relative z-20 flex flex-col justify-center items-center w-8 h-8 gap-[5px] cursor-pointer bg-transparent border-0 p-0"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          <span
            className={`w-6 h-[2px] bg-[#F4F5F2] transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px] bg-[#7CCBFF]' : ''
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-[#F4F5F2] transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`w-6 h-[2px] bg-[#F4F5F2] transition-all duration-300 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px] bg-[#7CCBFF]' : ''
            }`}
          />
        </button>
      </header>

      {/* MOBILE OVERLAY (z-index: 9) */}
      <div
        className={`fixed inset-0 z-[9] bg-[#07111F]/95 backdrop-blur-md flex flex-col justify-center items-start px-8 gap-7 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="text-xs uppercase tracking-[0.25em] text-[#7CCBFF]/70 mb-1 font-mono">
          Rudeus Greyrat // Codex
        </div>
        <button
          type="button"
          onClick={(e) => {
            setMobileMenuOpen(false);
            openModalImmediate('ABOUT', e);
          }}
          className="text-[32px] font-medium text-[#F4F5F2] hover:text-[#7CCBFF] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
        >
          ABOUT
        </button>
        <button
          type="button"
          onClick={(e) => {
            setMobileMenuOpen(false);
            openModalImmediate('ABILITIES', e);
          }}
          className="text-[32px] font-medium text-[#F4F5F2] hover:text-[#7CCBFF] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
        >
          ABILITIES
        </button>
        <button
          type="button"
          onClick={(e) => {
            setMobileMenuOpen(false);
            openModalImmediate('JOURNEY', e);
          }}
          className="text-[32px] font-medium text-[#F4F5F2] hover:text-[#7CCBFF] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
        >
          JOURNEY
        </button>
        <button
          type="button"
          onClick={(e) => {
            setMobileMenuOpen(false);
            openModalImmediate('ARCHIVE', e);
          }}
          className="text-[32px] font-medium text-[#F4F5F2] hover:text-[#7CCBFF] transition-colors text-left bg-transparent border-0 p-0 cursor-pointer"
        >
          ARCHIVE
        </button>
        <button
          type="button"
          onClick={(e) => {
            setMobileMenuOpen(false);
            openModalImmediate('WORLD', e);
          }}
          className="text-[32px] font-medium text-[#7CCBFF] underline underline-offset-4 decoration-[#7CCBFF]/60 hover:text-white transition-colors text-left bg-transparent border-0 p-0 cursor-pointer pt-2"
        >
          ENTER THE WORLD
        </button>
      </div>

      {/* HERO SECTION (z-index: 2) */}
      <main className="relative z-[2] w-full h-screen flex flex-col px-5 sm:px-8 md:px-10 overflow-hidden justify-end pb-16 sm:pb-14 md:justify-center md:pb-0">
        <div className="max-w-xl relative z-10">
          {/* Subtle Editorial Metadata Line */}
          <div className="flex items-center gap-2 mb-3 text-[11px] sm:text-[12px] tracking-[0.2em] text-[#A7B2BE] font-mono select-none">
            <span className="text-[#7CCBFF] animate-pulse">◆</span>
            <span>FITTOA REGION</span>
            <span className="text-[#A7B2BE]/40">/</span>
            <span>SHARIA</span>
            <span className="text-[#A7B2BE]/40">/</span>
            <span>MAGIC UNIVERSITY</span>
          </div>

          {/* Isolated Hero Title (zero parent re-render during mousemove) */}
          <HeroTitle displayed={displayed} done={done} />

          {/* Action Pill Buttons (reveals at 400ms independently) */}
          <div
            className={`flex flex-wrap gap-y-1 transition-all ease-out ${
              showButtons
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            style={{
              transitionDuration: '0.4s',
            }}
          >
            {/* 4 White pill buttons */}
            <HeroPillButton
              label="Explore his story"
              onClick={(e) => openModalImmediate('STORY', e)}
              onHoverStart={() => {
                setCursorText('STORY');
                setCursorHovered(true);
              }}
              onHoverEnd={() => {
                setCursorText(null);
                setCursorHovered(false);
              }}
            />

            <HeroPillButton
              label="Magic & abilities"
              onClick={(e) => openModalImmediate('ABILITIES', e)}
              onHoverStart={() => {
                setCursorText('MAGIC');
                setCursorHovered(true);
              }}
              onHoverEnd={() => {
                setCursorText(null);
                setCursorHovered(false);
              }}
            />

            <HeroPillButton
              label="Character archive"
              onClick={(e) => openModalImmediate('ARCHIVE', e)}
              onHoverStart={() => {
                setCursorText('CODEX');
                setCursorHovered(true);
              }}
              onHoverEnd={() => {
                setCursorText(null);
                setCursorHovered(false);
              }}
            />

            <HeroPillButton
              label="Timeline"
              onClick={(e) => openModalImmediate('TIMELINE', e)}
              onHoverStart={() => {
                setCursorText('YEARS');
                setCursorHovered(true);
              }}
              onHoverEnd={() => {
                setCursorText(null);
                setCursorHovered(false);
              }}
            />

            {/* 1 Outline pill button */}
            <HeroPillButton
              label="Mana: Unlimited Potential"
              isOutline
              onClick={handleManaClick}
              onHoverStart={() => {
                setCursorText('COPY');
                setCursorHovered(true);
              }}
              onHoverEnd={() => {
                setCursorText(null);
                setCursorHovered(false);
              }}
              icon={
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <rect x="3.5" y="0.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" />
                  <rect x="0.5" y="3.5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1" />
                </svg>
              }
            />
          </div>

          {/* Ability Micro-interaction (MAGIC // WATER · EARTH · FIRE · WIND) */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-[12px] tracking-[0.18em] font-mono text-[#A7B2BE]">
            <span className="text-[#7CCBFF]/80 select-none">MAGIC //</span>
            {(['WATER', 'EARTH', 'FIRE', 'WIND'] as const).map((elem) => (
              <MagneticElement
                key={elem}
                strength={6}
                textStrength={1.2}
                onClick={(e) => openModalImmediate(`MAGIC_${elem}` as ModalType, e)}
                onMouseEnter={() => {
                  setSelectedMagic(elem);
                  setCursorText(elem);
                  setCursorHovered(true);
                }}
                onMouseLeave={() => {
                  setSelectedMagic(null);
                  setCursorText(null);
                  setCursorHovered(false);
                }}
              >
                <span className="relative py-0.5 cursor-pointer text-[#A7B2BE] hover:text-[#7CCBFF] transition-colors duration-200">
                  {elem}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#7CCBFF] transition-all duration-300 ${
                      selectedMagic === elem ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </span>
              </MagneticElement>
            ))}
          </div>
        </div>
      </main>

      {/* AWWWARDS INFINITE BOTTOM TEXT MARQUEE */}
      <BottomMarquee
        onItemClick={(modal, e) => openModalImmediate(modal as ModalType, e)}
        onHoverItem={(label) => {
          if (label) {
            setCursorText('OPEN');
            setCursorHovered(true);
          } else {
            setCursorText(null);
            setCursorHovered(false);
          }
        }}
      />

      {/* COPIED / RESONANCE TOAST NOTIFICATION */}
      <div
        className={`fixed bottom-14 right-6 z-50 bg-[#0B1D32] border border-[#7CCBFF]/40 text-[#F4F5F2] px-4 py-2.5 rounded-full text-xs font-mono tracking-wide flex items-center gap-2.5 shadow-2xl transition-all duration-300 ${
          copiedToast
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#7CCBFF] animate-ping" />
        <span>{toastMessage}</span>
      </div>

      {/* EDITORIAL CINEMATIC MODAL (Pre-rendered, zero mounting delay, 60fps GPU animation) */}
      <CinematicModal
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        originPoint={modalOrigin}
        sectionCode={
          displayModal === 'ABOUT'
            ? '01 / IDENTITY'
            : displayModal === 'ABILITIES'
            ? '02 / ARCANUM'
            : displayModal === 'JOURNEY'
            ? '03 / TRAVERSAL'
            : displayModal === 'ARCHIVE'
            ? '04 / RELIQUARY'
            : displayModal === 'STORY'
            ? '05 / CHRONICLE'
            : displayModal === 'TIMELINE'
            ? '06 / EPOCH'
            : displayModal === 'WORLD'
            ? '07 / COSMOS'
            : `ELEMENT // ${displayModal?.replace('MAGIC_', '') || 'ARCANE'}`
        }
        headline={
          displayModal === 'ABOUT'
            ? 'The Quiet Prodigy of Buena'
            : displayModal === 'ABILITIES'
            ? 'Master of Combined Magic'
            : displayModal === 'JOURNEY'
            ? 'Odyssey of the Six-Faced World'
            : displayModal === 'ARCHIVE'
            ? 'Artifacts & Bound Destinies'
            : displayModal === 'STORY'
            ? 'Living Without Regret'
            : displayModal === 'TIMELINE'
            ? 'Milestones Across the Epoch'
            : displayModal === 'WORLD'
            ? 'The Six-Faced World'
            : displayModal === 'MAGIC_WATER'
            ? 'Water & Atmospheric Mastery'
            : displayModal === 'MAGIC_EARTH'
            ? 'Kinetic Densification & Rifling'
            : displayModal === 'MAGIC_FIRE'
            ? 'Thermal Shock & Compression'
            : 'Aerodynamic Acceleration'
        }
        category={
          displayModal?.startsWith('MAGIC_')
            ? 'ARCANE DISCIPLINE'
            : 'CHARACTER RECORD'
        }
        largeDisplayWord={
          displayModal === 'ABOUT'
            ? 'RUDEUS'
            : displayModal === 'ABILITIES'
            ? 'MAGIC'
            : displayModal === 'JOURNEY'
            ? 'ODYSSEY'
            : displayModal === 'ARCHIVE'
            ? 'CODEX'
            : displayModal === 'STORY'
            ? 'VOYAGE'
            : displayModal === 'TIMELINE'
            ? 'YEARS'
            : displayModal === 'WORLD'
            ? 'COSMOS'
            : displayModal?.replace('MAGIC_', '') || 'MANA'
        }
      >
        {displayModal === 'ABOUT' && (
          <div className="space-y-4">
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              Born as the eldest son of Paul and Zenith Greyrat in the rural village of Buena, Rudeus was granted a rare second chance at life. Having experienced helplessness and seclusion in his previous existence, he committed himself from earliest infancy to understand the principles of mana and master silent casting.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-colors">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7CCBFF]">Laplace Factor</div>
                <div className="text-sm text-[#F4F5F2] mt-1 font-medium">Boundless Mana Reserve</div>
                <div className="text-[11px] text-[#A7B2BE] mt-0.5">Mana capacity rivaling divine and god-class entities.</div>
              </div>
              <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-colors">
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#7CCBFF]">Silent Incantation</div>
                <div className="text-sm text-[#F4F5F2] mt-1 font-medium">Chantless Flow Control</div>
                <div className="text-[11px] text-[#A7B2BE] mt-0.5">Direct mana shaping without invocation delay or audible warnings.</div>
              </div>
            </div>
          </div>
        )}

        {displayModal === 'STORY' && (
          <div className="space-y-4">
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              From tutoring the fiery noble Eris Boreas Greyrat in the citadel of Roa to surviving the sudden Fittoa Teleportation Incident, Rudeus chose to protect those he loved rather than retreat into fear.
            </p>
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              Through the deadly hazards of the Demon Continent alongside the Spurd warrior Ruijerd, and later wandering the northern tundra as the renowned solo adventurer "Quagmire," every battle forged his determination to build an honorable legacy.
            </p>
            <div className="p-4 bg-[#07111F]/80 border-l-2 border-[#7CCBFF] rounded-r-xl text-xs font-mono text-[#A8E6FF] leading-relaxed">
              "Even if I make mistakes, I will keep moving forward. I will not let despair paralyze me again."
            </div>
          </div>
        )}

        {displayModal === 'ABILITIES' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-all">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[#F4F5F2] text-sm">The Quagmire (Signature Mud Bog)</span>
                <span className="text-[10px] font-mono text-[#7CCBFF]">Water + Earth</span>
              </div>
              <p className="text-xs text-[#A7B2BE] mt-1 leading-relaxed">
                Liquefies solid terrain beneath approaching adversaries into an inescapable mud mire, immediately solidifying it again to trap armored beasts.
              </p>
            </div>
            <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-all">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[#F4F5F2] text-sm">Rifled Stone Cannon</span>
                <span className="text-[10px] font-mono text-[#7CCBFF]">Hyper-kinetic Ballistics</span>
              </div>
              <p className="text-xs text-[#A7B2BE] mt-1 leading-relaxed">
                Compresses stone to diamond hardness while imparting supersonic rifling rotation, penetrating dragon-scale armor and heavy barriers.
              </p>
            </div>
            <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-all">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[#F4F5F2] text-sm">Demon Eye of Foresight</span>
                <span className="text-[10px] font-mono text-[#7CCBFF]">Ocular Relic</span>
              </div>
              <p className="text-xs text-[#A7B2BE] mt-1 leading-relaxed">
                Endowed by Demon Emperor Kishirika Kishirisu. Reveals future ghost trajectories seconds ahead in combat.
              </p>
            </div>
            <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-all">
              <div className="flex justify-between items-baseline">
                <span className="font-medium text-[#F4F5F2] text-sm">Magic Armor (MK.I & MK.II)</span>
                <span className="text-[10px] font-mono text-[#7CCBFF]">Mechanized Mana Exoskeleton</span>
              </div>
              <p className="text-xs text-[#A7B2BE] mt-1 leading-relaxed">
                Forged with Zanoba Shirone and Cliff Grimoire, channeling Rudeus's immense mana pool to stand toe-to-toe with the Seven Great World Powers.
              </p>
            </div>
          </div>
        )}

        {displayModal === 'JOURNEY' && (
          <div className="space-y-3">
            <div className="border-l-2 border-[#7CCBFF]/50 pl-3.5 py-1">
              <div className="text-xs font-mono text-[#7CCBFF]">Buena Village & Roa (Kingdom of Asura)</div>
              <p className="text-xs text-[#A7B2BE] mt-0.5">Foundational training under Water Saint Roxy Migurdia; tutor to Eris Boreas Greyrat.</p>
            </div>
            <div className="border-l-2 border-[#7CCBFF]/50 pl-3.5 py-1">
              <div className="text-xs font-mono text-[#7CCBFF]">The Demon Continent & Dead End</div>
              <p className="text-xs text-[#A7B2BE] mt-0.5">Surviving the teleportation cataclysm; crossing the Great Forest and ocean with Ruijerd Superdia.</p>
            </div>
            <div className="border-l-2 border-[#7CCBFF]/50 pl-3.5 py-1">
              <div className="text-xs font-mono text-[#7CCBFF]">Sharia & Ranoa Magic University</div>
              <p className="text-xs text-[#A7B2BE] mt-0.5">Reunion with Silent Fitz (Sylphiette); research into teleportation anomalies, magic devices, and automated armor.</p>
            </div>
            <div className="border-l-2 border-[#7CCBFF]/50 pl-3.5 py-1">
              <div className="text-xs font-mono text-[#7CCBFF]">The Begaritt Continent & Dragon God Clash</div>
              <p className="text-xs text-[#A7B2BE] mt-0.5">Labyrinth expedition and fateful confrontation with Orsted, cementing his allegiance as Dragon God's subordinate.</p>
            </div>
          </div>
        )}

        {displayModal === 'TIMELINE' && (
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-3 bg-[#07111F]/60 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-colors">
              <span className="text-[#7CCBFF]">K.D. 407</span>
              <span className="text-[#F4F5F2]">Rebirth into the Greyrat household, Asura Kingdom</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#07111F]/60 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-colors">
              <span className="text-[#7CCBFF]">K.D. 410</span>
              <span className="text-[#F4F5F2]">Attains Water Saint tier under Roxy Migurdia</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#07111F]/60 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-colors">
              <span className="text-[#7CCBFF]">K.D. 417</span>
              <span className="text-[#F4F5F2]">Fittoa Teleportation Incident; formation of 'Dead End'</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#07111F]/60 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-colors">
              <span className="text-[#7CCBFF]">K.D. 422</span>
              <span className="text-[#F4F5F2]">Special Student enrolment at Ranoa Magic Academy</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#07111F]/60 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-colors">
              <span className="text-[#7CCBFF]">K.D. 425</span>
              <span className="text-[#F4F5F2]">Dragon God Orsted alliance & Office installation</span>
            </div>
          </div>
        )}

        {displayModal === 'ARCHIVE' && (
          <div className="space-y-3 text-sm text-[#A7B2BE]">
            <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-all">
              <div className="text-xs font-medium text-[#F4F5F2]">Aqua Heartia (Wand of the Water God)</div>
              <div className="text-xs text-[#A7B2BE] mt-0.5">Carved from Elder Treant wood with high-purity water mana crystal; triples casting magnification.</div>
            </div>
            <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-all">
              <div className="text-xs font-medium text-[#F4F5F2]">Robe of the Holy Maiden</div>
              <div className="text-xs text-[#A7B2BE] mt-0.5">Enchanted cloak bestowing superior thermal dispersion, physical slashing dampening, and mana resistance.</div>
            </div>
            <div className="p-3.5 bg-[#07111F]/70 rounded-xl border border-white/5 hover:border-[#7CCBFF]/30 transition-all">
              <div className="text-xs font-medium text-[#F4F5F2]">Office of the Dragon God</div>
              <div className="text-xs text-[#A7B2BE] mt-0.5">Primary liaison and strategist supporting Orsted in the multidimensional campaign against Hitogami.</div>
            </div>
          </div>
        )}

        {displayModal === 'WORLD' && (
          <div className="space-y-4">
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              A polyhedral cube cosmos composed of six unified dimensions. Governed by primordial dragon gods, demon kings, and intricate mana leylines connecting realms across the great rift.
            </p>
            <div className="p-4 bg-[#07111F]/80 rounded-xl border border-[#7CCBFF]/25 space-y-2">
              <div className="text-xs font-mono text-[#7CCBFF]">MANA CORE FLUIDITY DYNAMICS</div>
              <div className="text-xs text-[#A7B2BE] leading-relaxed">
                Horizontal mouse movement actively scrubs the temporal timeline of the cinematic archive. Feel the physical interaction of mana across each quadrant.
              </div>
            </div>
          </div>
        )}

        {/* Magic Element Specific Modals */}
        {displayModal === 'MAGIC_WATER' && (
          <div className="space-y-4">
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              Taught by Roxy Migurdia. By visualizing molecular thermodynamics and condensation, Rudeus achieved Saint and King-tier masteries, commanding the continent-spanning cyclone <span className="text-[#F4F5F2] font-medium">Cumulonimbus</span>.
            </p>
          </div>
        )}

        {displayModal === 'MAGIC_EARTH' && (
          <div className="space-y-4">
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              His signature school of combat. Applying principles of structural physics, kinetic energy equations, and rotational rifling, simple earth is turned into impenetrable defensive bulwarks or hypersonic kinetic ammunition.
            </p>
          </div>
        )}

        {displayModal === 'MAGIC_FIRE' && (
          <div className="space-y-4">
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              Employed in thermal pairings with wind for sudden atmospheric pressure depression and thermobaric flash explosions, disorienting high-ranking swordsmen and beast champions.
            </p>
          </div>
        )}

        {displayModal === 'MAGIC_WIND' && (
          <div className="space-y-4">
            <p className="text-[#A7B2BE] text-sm leading-relaxed">
              Leveraged for sonic displacement, acoustic detection of subterranean movement, and ballistic trajectory correction for projectile spells over kilometer-range engagements.
            </p>
          </div>
        )}
      </CinematicModal>
    </div>
  );
}
