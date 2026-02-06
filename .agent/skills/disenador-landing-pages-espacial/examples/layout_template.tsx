import React from 'react';

const SpaceHero = () => {
  return (
    <section className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Fondo de Estrellas (Simulado con gradiente radial sutil) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1)_0%,rgba(2,6,23,1)_100%)] opacity-80" />
      
      {/* Gran Arco de Luz Degradada */}
      <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[120%] h-[150%] rounded-[100%] bg-[radial-gradient(ellipse_at_top,rgba(147,51,234,0.15)_0%,rgba(59,130,246,0.05)_50%,transparent_100%)] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-4xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Explora la <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">Próxima Frontera</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Diseños de vanguardia para proyectos que miran hacia el futuro. Estética espacial, rendimiento neón y una experiencia de usuario estelar.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-full shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all">
            Comenzar Ahora
          </button>
          <button className="px-8 py-3 border border-slate-700 text-white hover:bg-white/5 font-semibold rounded-full transition-all">
            Saber Más
          </button>
        </div>
      </div>

      {/* Partner Logos */}
      <div className="absolute bottom-12 w-full max-w-6xl px-4 flex flex-wrap justify-between items-center gap-8 opacity-40 grayscale contrast-125">
        <div className="h-6 w-24 bg-white/20 rounded" /> {/* Logo Placeholder */}
        <div className="h-6 w-24 bg-white/20 rounded" />
        <div className="h-6 w-24 bg-white/20 rounded" />
        <div className="h-6 w-24 bg-white/20 rounded" />
        <div className="h-6 w-24 bg-white/20 rounded" />
      </div>
    </section>
  );
};

export default SpaceHero;
