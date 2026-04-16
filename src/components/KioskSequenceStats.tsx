import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Helper to generate image sequence
const FRAME_COUNT = 179;
const getFrameSrc = (index: number) => {
  const paddedIndex = (index + 1).toString().padStart(4, '0');
  return `/assets/kiosk-results-sequence/FOOD IMIN_letrero superior_Paneo_inferior_${paddedIndex}.webp`;
};

export function KioskSequenceStats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for texts & overlays
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const blackCircleRef = useRef<HTMLDivElement>(null);
  
  const giantTextIntro = useRef<HTMLDivElement>(null);
  const standardTitle = useRef<HTMLDivElement>(null);

  const giantText1 = useRef<HTMLDivElement>(null);
  const kpiBox1 = useRef<HTMLDivElement>(null);

  const giantText2 = useRef<HTMLDivElement>(null);
  const kpiBox2 = useRef<HTMLDivElement>(null);

  const giantText3 = useRef<HTMLDivElement>(null);
  const kpiBox3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed aspect ratio handling for sequence rendering
    const renderImage = (img: HTMLImageElement) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      }

      // Draw background (Transparent) to allow CSS DOM background to show
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    // Preload images
    const images: HTMLImageElement[] = [];
    let loadedImages = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFrameSrc(i);
        images.push(img);
        
        img.onload = () => {
            loadedImages++;
            if (loadedImages === 1 && i === 0) {
                renderImage(img); 
            }
        };
    }

    const state = { frame: 0 };

    // Set up GSAP context
    const gsctx = gsap.context(() => {
      // Setup initial visibility
      gsap.set([giantText1.current, giantText2.current, giantText3.current], { xPercent: 150, opacity: 0 });
      gsap.set([kpiBox1.current, kpiBox2.current, kpiBox3.current], { opacity: 0, y: 50, scale: 0.95 });
      gsap.set(giantTextIntro.current, { xPercent: 120 });
      gsap.set(standardTitle.current, { opacity: 0 });
      gsap.set(blackCircleRef.current, { scale: 0 });
      gsap.set(contentWrapperRef.current, { opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=900%', // Increased scroll duration to make pauses feel significant
          scrub: 1, 
          pin: true,
          onUpdate: self => {
             if (images[state.frame] && images[state.frame].complete) {
                renderImage(images[state.frame]);
             }
          }
        }
      });

      // Distribute frames dynamically: TRUE FREEZE during KPIs, fast transitions between them
      // Intro ends at time: 12. Frame arrives at 40 and completely freezes.
      tl.to(state, { frame: 40, snap: "frame", ease: "power1.out", duration: 12 }, 0); 
      
      // Between time 12 and 21, ZERO animations happen to state.frame (TRUE FREEZE)
      
      // At time 21, KPI leaves and fast transition begins to frame 100
      tl.to(state, { frame: 100, snap: "frame", ease: "power1.inOut", duration: 5 }, 21);
      
      // Between time 26 and 35, ZERO animations happen to state.frame (TRUE FREEZE)
      
      // At time 35, KPI 2 leaves and fast transition begins to frame 150
      tl.to(state, { frame: 150, snap: "frame", ease: "power1.inOut", duration: 5 }, 35);
      
      // Between time 40 and 45, ZERO animations happen to state.frame (TRUE FREEZE)
      
      // At time 45, the Outro plays and we finish the sequence frames
      tl.to(state, { frame: FRAME_COUNT - 1, snap: "frame", ease: "none", duration: 11 }, 45);

      // Phase 0: Intro Title passing right to left over white background
      tl.to(giantTextIntro.current, { xPercent: -120, duration: 10, ease: "none" }, 0);
      
      // Right before the text completely exits left (approx time 6 to 8), circle expands
      tl.to(blackCircleRef.current, { scale: 50, duration: 4, ease: "power2.inOut" }, 6);
      
      // Standard title fades in after transition to black 
      tl.to(standardTitle.current, { opacity: 1, duration: 2 }, 10);

      // Phase 1: KPI 1
      tl.to(giantText1.current, { xPercent: 0, opacity: 1, duration: 3, ease: "power2.out" }, 12)
        .to(kpiBox1.current, { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'back.out(1.5)' }, 13)
        // Pause (hold position) between 15 and 21
        .to(giantText1.current, { xPercent: -150, opacity: 0, duration: 3, ease: "power2.in" }, 21)
        .to(kpiBox1.current, { opacity: 0, scale: 0.9, y: 50, duration: 2, ease: "power2.in" }, 21);

      // Phase 2: KPI 2
      tl.to(giantText2.current, { xPercent: 0, opacity: 1, duration: 3, ease: "power2.out" }, 26)
        .to(kpiBox2.current, { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'back.out(1.5)' }, 27)
        // Pause (hold position) between 29 and 35
        .to(giantText2.current, { xPercent: -150, opacity: 0, duration: 3, ease: "power2.in" }, 35)
        .to(kpiBox2.current, { opacity: 0, scale: 0.9, y: 50, duration: 2, ease: "power2.in" }, 35);

      // Phase 3: KPI 3
      tl.to(giantText3.current, { xPercent: 0, opacity: 1, duration: 3, ease: "power2.out" }, 40)
        .to(kpiBox3.current, { opacity: 1, y: 0, scale: 1, duration: 2, ease: 'back.out(1.5)' }, 41);
        // This last KPI holds until the section fades out!
      
      // Phase 4 (Outro): Fade out everything except the black background wrapper
      tl.to(contentWrapperRef.current, { opacity: 0, duration: 4, ease: "power2.inOut" }, 56);

      window.addEventListener('resize', () => {
         if (images[state.frame] && images[state.frame].complete) {
             renderImage(images[state.frame]);
         }
      });
    }, sectionRef);

    return () => gsctx.revert();
  }, []);

  return (
    <section id="resultados" ref={sectionRef} className="relative h-screen bg-white overflow-hidden flex items-center justify-center">
      
      {/* Layer 0: Giant Intro Text (Black text, white bg) */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0 pointer-events-none">
        <div 
          ref={giantTextIntro}
          className="absolute whitespace-nowrap text-[15vw] font-display font-bold text-ink tracking-tighter"
        >
          Resultados que hablan por sí solos
        </div>
      </div>

      {/* Layer 1: Expanding Black Circle */}
      <div 
        ref={blackCircleRef} 
        className="absolute top-1/2 left-1/2 w-[10vmax] h-[10vmax] bg-black rounded-full -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none"
      />

      {/* Main Wrapper that fades out at the end */}
      <div ref={contentWrapperRef} className="absolute inset-0 w-full h-full z-20 pointer-events-none">
        
        {/* Layer 2: Giant KPI Texts (behind Canvas, in front of black circle) */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-20 pointer-events-none">
          <div 
            ref={giantText1}
            className="absolute whitespace-nowrap text-[18vw] font-display font-bold text-white/5 tracking-tighter"
          >
            +40% Revenue Lift
          </div>
          <div 
            ref={giantText2}
            className="absolute whitespace-nowrap text-[18vw] font-display font-bold text-white/5 tracking-tighter"
          >
            -70% Labor Costs
          </div>
          <div 
            ref={giantText3}
            className="absolute whitespace-nowrap text-[18vw] font-display font-bold text-white/5 tracking-tighter"
          >
            95% Autonomy
          </div>
        </div>

        {/* Layer 3: Underlying Canvas Sequence */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-auto"
        />

        {/* Layer 4: Interactive Overlays Context */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-40 pointer-events-none">
          
          <div
            ref={standardTitle}
            className="absolute top-12 left-0 right-0 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-white">
              Resultados que hablan por sí solos
            </h2>
          </div>

          {/* KPI 1 Box */}
          <div
            ref={kpiBox1}
            className="absolute right-[5%] md:right-[10%] w-[300px] md:w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl pointer-events-auto"
          >
            <h3 className="text-6xl md:text-8xl font-display font-bold text-[#FF4500] mb-2">+40%</h3>
            <p className="text-3xl font-bold text-white mb-3">Revenue Lift</p>
            <p className="text-white/60 font-medium">Through automated smart-pairing and upsell suggestions.</p>
          </div>

          {/* KPI 2 Box */}
          <div
            ref={kpiBox2}
            className="absolute left-[5%] md:left-[10%] w-[300px] md:w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl pointer-events-auto"
          >
            <h3 className="text-6xl md:text-8xl font-display font-bold text-[#FF4500] mb-2">-70%</h3>
            <p className="text-3xl font-bold text-white mb-3">Labor Costs</p>
            <p className="text-white/60 font-medium">Efficiency gains in ordering and transactional operations.</p>
          </div>

          {/* KPI 3 Box */}
          <div
            ref={kpiBox3}
            className="absolute right-[5%] md:right-[10%] w-[300px] md:w-[400px] bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl pointer-events-auto"
          >
            <h3 className="text-6xl md:text-8xl font-display font-bold text-[#FF4500] mb-2">95%</h3>
            <p className="text-3xl font-bold text-white mb-3">Autonomy</p>
            <p className="text-white/60 font-medium">Customers prefer to order themselves at their own pace.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
