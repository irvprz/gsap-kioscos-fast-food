import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, SlidersHorizontal, PlaySquare, CreditCard, CheckCircle2, TrendingUp } from "lucide-react";
import { useState, useRef } from "react";
import { useGSAPInit } from "./hooks/useGSAP";
import { PreloadOverlay } from "./components/PreloadOverlay";
import { KioskSequenceStats } from "./components/KioskSequenceStats";
import { HeroSequence } from "./components/HeroSequence";

const EASE = [0.16, 1, 0.3, 1];

function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="font-display font-bold text-2xl tracking-tight text-ink">Kiosk<span className="text-brand">Food</span></div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink/70">
        <a href="#beneficios" className="hover:text-brand transition-colors">Beneficios</a>
        <a href="#features" className="hover:text-brand transition-colors">Funcionalidades</a>
        <a href="#galeria" className="hover:text-brand transition-colors">Galería</a>
      </div>
      <button className="bg-brand text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-dark transition-colors shadow-lg shadow-brand/20">
        Solicitar Demo
      </button>
    </motion.nav>
  );
}

// Hero is now HeroSequence — see src/components/HeroSequence.tsx

function ClientLogos() {
  return (
    <section className="py-16 border-b border-gray-100 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="text-center text-xs font-bold text-ink/40 uppercase tracking-[0.2em] mb-10"
        >
          Operando en las mejores cadenas
        </motion.p>
        
        {/* Usamos flex-wrap y justify-center para que se vea elegante sin importar si son 2 o 6 logos */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500"
        >
          {/* Placeholders tipográficos para los logos. Aquí irían tus etiquetas <img> con los SVGs reales */}
          <div className="font-display font-bold text-2xl tracking-tighter">BURGER<span className="font-light">CO.</span></div>
          <div className="font-display font-bold text-2xl tracking-widest uppercase">PizzaLab</div>
          <div className="font-sans font-black text-2xl italic tracking-tight">TACO<span className="text-brand">RUN</span></div>
          <div className="font-display font-medium text-2xl tracking-widest border-2 border-current px-2">SUSHI</div>
        </motion.div>
      </div>
    </section>
  );
}

function ParallaxImageBreak() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section ref={ref} className="h-[50vh] md:h-[70vh] w-full overflow-hidden relative">
      <motion.div style={{ y }} className="absolute inset-0 w-full h-[140%] -top-[20%]">
        <img 
          src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop" 
          alt="Restaurante" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/40"></div>
      </motion.div>
      <div className="absolute inset-0 flex items-center justify-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white max-w-4xl leading-tight">
          Diseñado para cafeterías, hamburgueserías y negocios de alto flujo.
        </h2>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-32 px-6 md:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-ink mb-6">
            Todo lo que necesitas para vender más
          </h2>
          <p className="text-xl text-ink/60 max-w-2xl mx-auto">
            Nuestro software está diseñado específicamente para maximizar el ticket promedio y mejorar la experiencia de tus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Feature 1: Upsell & Cross-sell */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="bg-surface rounded-3xl p-8 md:p-12 flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-8">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4">Upsell y Cross-sell Automático</h3>
            <p className="text-ink/70 text-lg mb-8 flex-grow">
              El sistema sugiere inteligentemente agrandar el combo, agregar postres o bebidas justo antes de pagar. Aumenta tus ventas sin esfuerzo adicional de tu personal.
            </p>
            {/* Placeholder para imagen de UI de Upsell */}
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1625869016774-3a92be2ae2cd?q=80&w=1000&auto=format&fit=crop" 
                alt="UI Upsell" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium">Reemplazar con captura de Upsell</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 2: Armar Platos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="bg-surface rounded-3xl p-8 md:p-12 flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-8">
              <SlidersHorizontal className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4">Personalización y Armado de Platos</h3>
            <p className="text-ink/70 text-lg mb-8 flex-grow">
              Permite a tus clientes quitar ingredientes, agregar extras o armar su plato desde cero. Interfaz visual e intuitiva que evita errores en cocina.
            </p>
            {/* Placeholder para imagen de UI de Personalización */}
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1586190848861-99aa4a171e90?q=80&w=1000&auto=format&fit=crop" 
                alt="UI Personalización" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium">Reemplazar con captura de Modificadores</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 3: Banners y Videos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="bg-surface rounded-3xl p-8 md:p-12 flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-8">
              <PlaySquare className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4">Banners y Videos Promocionales</h3>
            <p className="text-ink/70 text-lg mb-8 flex-grow">
              Cuando el kiosco está inactivo, se convierte en una pantalla publicitaria. Muestra videos atractivos y banners con tus mejores promociones para atraer clientes.
            </p>
            {/* Placeholder para imagen de UI de Banners */}
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden relative group">
              <img 
                src="https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=1000&auto=format&fit=crop" 
                alt="UI Banners" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium">Reemplazar con captura de Screensaver/Video</span>
              </div>
            </div>
          </motion.div>

          {/* Feature 4: POS Integrado */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="bg-ink text-white rounded-3xl p-8 md:p-12 flex flex-col h-full"
          >
            <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8">
              <CreditCard className="w-7 h-7" />
            </div>
            <h3 className="text-3xl font-display font-bold mb-4">POS y Pagos Integrados</h3>
            <p className="text-white/70 text-lg mb-8 flex-grow">
              Tarjetas de crédito, débito, billeteras digitales y códigos QR. Todo integrado en un solo flujo rápido y seguro. La orden va directo a cocina.
            </p>
            {/* Placeholder para imagen de UI de Pagos */}
            <div className="w-full aspect-[4/3] bg-white/5 rounded-xl overflow-hidden relative group border border-white/10">
              <img 
                src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=1000&auto=format&fit=crop" 
                alt="UI Pagos" 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-medium">Reemplazar con captura de Checkout</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

function InteractiveGallery() {
  const [active, setActive] = useState(0);

  const items = [
    { id: 0, title: "Cafeterías Boutique", img: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=800&h=1600&auto=format&fit=crop" },
    { id: 1, title: "Cadenas de Fast Food", img: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=800&h=1600&auto=format&fit=crop" },
    { id: 2, title: "Restaurantes Casuales", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&h=1600&auto=format&fit=crop" },
    { id: 3, title: "Food Courts", img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&h=1600&auto=format&fit=crop" },
  ];

  return (
    <section id="galeria" className="py-32 px-6 md:px-12 bg-surface overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            className="text-4xl md:text-6xl font-display font-bold tracking-tighter text-ink mb-6"
          >
            Nuestros kioscos en su <span className="text-brand">hábitat</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            className="text-xl text-ink/60 max-w-2xl mx-auto"
          >
            Diseño industrial que se adapta a la estética de cualquier local, desde cafeterías boutique hasta cadenas internacionales.
          </motion.p>
        </div>

        <div className="flex flex-col md:flex-row h-[800px] md:h-[600px] gap-4 w-full">
          {items.map((item, index) => {
            const isActive = active === index;
            return (
              <motion.div
                key={item.id}
                onMouseEnter={() => setActive(index)}
                onClick={() => setActive(index)}
                className={`relative overflow-hidden rounded-3xl cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isActive ? "flex-[3] md:flex-[4]" : "flex-1"
                }`}
              >
                <img 
                  src={item.img} 
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-60 md:opacity-40'}`} />
                
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full h-full flex flex-col justify-end">
                  <div className={`transition-all duration-700 transform ${isActive ? 'translate-y-0 opacity-100 delay-100' : 'translate-y-8 opacity-0 hidden md:block'}`}>
                    <div className="w-12 h-12 rounded-full bg-brand/90 backdrop-blur-sm flex items-center justify-center mb-4">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-display font-bold text-2xl md:text-3xl mb-2 whitespace-nowrap">
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-32 px-6 md:px-12 bg-ink text-white text-center">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tighter mb-8">
          Lleva la experiencia de tu restaurante al siguiente nivel
        </h2>
        <p className="text-xl text-white/60 mb-12">
          Te ayudamos a implementar un kiosco de autoatención moderno, visual y eficiente para tu negocio.
        </p>
        <button className="bg-brand text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-brand-dark transition-colors shadow-2xl hover:scale-105 duration-300">
          Hablar con un asesor
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-ink text-white/40 py-12 px-6 md:px-12 text-sm font-medium border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="font-display font-bold text-2xl text-white tracking-tight">Kiosk<span className="text-brand">Food</span></div>
        <div className="flex gap-8">
          <a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a>
          <a href="#galeria" className="hover:text-white transition-colors">Galería</a>
          <a href="#features" className="hover:text-white transition-colors">Funcionalidades</a>
          <a href="#" className="hover:text-white transition-colors">Contacto</a>
        </div>
        <div>© 2026 KioskFood. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}

export default function App() {
  // Initialise GSAP globally — registers plugins, sets defaults, cleans up on unmount
  useGSAPInit();

  return (
    <>
      <PreloadOverlay />
      <div data-animate className="bg-white min-h-screen selection:bg-brand selection:text-white font-sans">
      <Navbar />
      <HeroSequence />
      <ClientLogos />
      <ParallaxImageBreak />
      <Features />
      <InteractiveGallery />
      <KioskSequenceStats />
      <CTA />
      <Footer />
      </div>
    </>
  );
}
