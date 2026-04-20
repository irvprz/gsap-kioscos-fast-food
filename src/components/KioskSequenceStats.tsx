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
      // Configuraciones iniciales
      gsap.set([giantText1.current, giantText2.current, giantText3.current], { xPercent: 150, opacity: 0 });
      gsap.set([kpiBox1.current, kpiBox2.current, kpiBox3.current], { opacity: 0, y: 50, scale: 0.95 });
      gsap.set(giantTextIntro.current, { xPercent: 120 });
      gsap.set(standardTitle.current, { opacity: 0 }); // Inicia oculto
      gsap.set(blackCircleRef.current, { scale: 0 });
      gsap.set(contentWrapperRef.current, { opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=1000%', 
          scrub: 1.5,
          pin: true,
          snap: {
            snapTo: "labelsDirectional", // El directional previene retroceder accidentalmente y fuerza a ir al próximo KPI al hacer mínimo scroll
            duration: { min: 0.5, max: 1.5 }, 
            delay: 0.05, // Reduce el retraso para que el freno magnético se sienta inmediato
            ease: "power2.inOut"
          },
          onUpdate: self => {
             if (images[state.frame] && images[state.frame].complete) {
                renderImage(images[state.frame]);
             }
          }
        }
      });

      let t = 0;
      const TRANSITION_DUR = 10;
      
      tl.addLabel("start", t);

      // --- FASE 0: Inicio -> Mostrar el KPI 1 ---
      tl.to(state, { frame: 40, snap: "frame", duration: TRANSITION_DUR, ease: "power2.inOut" }, t);
      tl.to(giantTextIntro.current, { xPercent: -150, duration: TRANSITION_DUR, ease: "power1.out" }, t);
      tl.to(blackCircleRef.current, { scale: 50, duration: TRANSITION_DUR * 0.8, ease: "power2.inOut" }, t);
      tl.fromTo(standardTitle.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: TRANSITION_DUR * 0.3 }, t + TRANSITION_DUR * 0.7);

      // El KPI 1 entra a escena al final de esta transición (en su posición de lectura y se frena)
      tl.fromTo(giantText1.current, { xPercent: 120, opacity: 1 }, { xPercent: 0, duration: TRANSITION_DUR * 0.5, ease: "power2.out" }, t + TRANSITION_DUR * 0.5);
      tl.to(kpiBox1.current, { opacity: 1, y: 0, scale: 1, duration: TRANSITION_DUR * 0.5, ease: 'back.out(1.5)' }, t + TRANSITION_DUR * 0.5);

      t += TRANSITION_DUR; 
      
      // AQUÍ ES DONDE SE DETIENE (SNAP) - El usuario tiene ambas cajas visibles en pantalla y el kiosco al lado
      tl.addLabel("kpi1", t);
      
      // --- FASE 1: Salir KPI 1 -> Kiosco Gira -> Entra KPI 2 ---
      // Al hacer scroll, la caja 1 se va...
      tl.to(giantText1.current, { xPercent: -150, duration: TRANSITION_DUR * 0.5, ease: "power2.in" }, t);
      tl.to(kpiBox1.current, { opacity: 0, scale: 0.9, y: 50, duration: TRANSITION_DUR * 0.5, ease: 'power2.in' }, t);

      // Inmediatamente después, el kiosco gira
      tl.to(state, { frame: 100, snap: "frame", duration: TRANSITION_DUR * 0.8, ease: "power2.inOut" }, t + TRANSITION_DUR * 0.1);

      // Mientras el kiosco termina su giro, entra el KPI 2 a la pantalla
      tl.fromTo(giantText2.current, { xPercent: 120, opacity: 1 }, { xPercent: 0, duration: TRANSITION_DUR * 0.5, ease: "power2.out" }, t + TRANSITION_DUR * 0.5);
      tl.to(kpiBox2.current, { opacity: 1, y: 0, scale: 1, duration: TRANSITION_DUR * 0.5, ease: 'back.out(1.5)' }, t + TRANSITION_DUR * 0.5);

      t += TRANSITION_DUR;

      // El snap frena EXACTAMENTE aquí, con el segundo KPI para ser leído
      tl.addLabel("kpi2", t);

      // --- FASE 2: Salir KPI 2 -> Kiosco Gira al Máximo (Frontal) -> Entra KPI 3 ---
      tl.to(giantText2.current, { xPercent: -150, duration: TRANSITION_DUR * 0.5, ease: "power2.in" }, t);
      tl.to(kpiBox2.current, { opacity: 0, scale: 0.9, y: 50, duration: TRANSITION_DUR * 0.5, ease: 'power2.in' }, t);

      // Kiosco girando DIRECTAMENTE de frame 100 hasta que se posicione frontal enorme (FRAME_COUNT - 1)
      tl.to(state, { frame: FRAME_COUNT - 1, snap: "frame", duration: TRANSITION_DUR * 0.8, ease: "power2.inOut" }, t + TRANSITION_DUR * 0.1);

      // El KPI 3 asoma solo al final, apoyando al render final del Kiosco grande frontal
      tl.fromTo(giantText3.current, { xPercent: 120, opacity: 1 }, { xPercent: 0, duration: TRANSITION_DUR * 0.5, ease: "power2.out" }, t + TRANSITION_DUR * 0.5);
      tl.to(kpiBox3.current, { opacity: 1, y: 0, scale: 1, duration: TRANSITION_DUR * 0.5, ease: 'back.out(1.5)' }, t + TRANSITION_DUR * 0.5);

      t += TRANSITION_DUR;

      // Se detiene magnéticamente aquí
      tl.addLabel("kpi3", t);

      // --- FASE 3: OUTRO ---
      tl.to(giantText3.current, { xPercent: -150, duration: TRANSITION_DUR * 0.5, ease: "power2.in" }, t);
      tl.to(kpiBox3.current, { opacity: 0, scale: 0.9, y: 50, duration: TRANSITION_DUR * 0.5, ease: 'power2.in' }, t);
      
      // Limpieza general, despide todo el contenedor
      tl.to(contentWrapperRef.current, { opacity: 0, duration: TRANSITION_DUR * 0.5, ease: "power2.inOut" }, t + TRANSITION_DUR * 0.2);

      t += TRANSITION_DUR;
      tl.addLabel("end", t);

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
            className="absolute whitespace-nowrap text-[18vw] font-display font-bold text-white/15 tracking-tighter"
          >
            +40% Revenue Lift
          </div>
          <div 
            ref={giantText2}
            className="absolute whitespace-nowrap text-[18vw] font-display font-bold text-white/15 tracking-tighter"
          >
            -70% Labor Costs
          </div>
          <div 
            ref={giantText3}
            className="absolute whitespace-nowrap text-[18vw] font-display font-bold text-white/15 tracking-tighter"
          >
            95% Autonomy
          </div>
        </div>

        {/* Layer 3: Underlying Canvas Sequence */}
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full object-cover z-30 pointer-events-auto scale-95"
        />

        {/* Layer 4: Interactive Overlays Context */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-40 pointer-events-none">
          
          <div
            ref={standardTitle}
            className="absolute top-32 left-0 right-0 text-center z-[100]"
          >
            <h2 className="text-2xl md:text-4xl font-display font-medium text-white drop-shadow-xl" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
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
