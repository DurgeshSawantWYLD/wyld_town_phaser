import { useRef } from 'react';
import { useCityStore } from '@/features/city';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/**
 * TitleOverlay component displays the WYLD Town splash screen.
 * It animates in on load and fades out when entering the town.
 */
export default function TitleOverlay() {
  const setIntroActive = useCityStore((s) => s.setIntroActive);
  const containerRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleEnter = contextSafe(() => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        setIntroActive(false);
      },
    });
  });

  return (
    <div id="title-overlay" ref={containerRef}>
      <div className="overlay-content">
        <h1 className="overlay-title">WYLD TOWN</h1>
        <p className="overlay-sub">BRAND-SPONSORED CREATOR JOURNEYS</p>
        <button id="btn-enter" onClick={handleEnter}>
          Enter WYLD Town
        </button>
      </div>
    </div>
  );
}
