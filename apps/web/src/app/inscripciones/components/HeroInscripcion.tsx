import Image from 'next/image';

const gradientBorderStyle = {
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1'
}

export default function HeroInscripcion() {
return (
      <section className="relative flex min-h-[72vh] flex-col items-center justify-center overflow-hidden bg-(--brand-crema) py-16 sm:py-24" style={gradientBorderStyle}>
        <Image
          src="/images/FONDOS/FC_2.jpg"
          alt=""
          fill
          className="object-cover object-center sm:w-full sm:h-auto sm:object-top"
        />

        {/* Versión Mobile: Centrada, exactamente como el mockup */}
        <div className="relative mx-auto max-w-xl px-6 text-center md:hidden">
          <h2 className="font-bakbak text-2xl! font-black text-(--brand-negro) [-webkit-text-stroke:1px_currentColor]">
            ESCRIBE
          </h2>
          <h4 className="font-bakbak text-3xl! font-black text-(--brand-cafe) [-webkit-text-stroke:1px_currentColor]">
            TU PROPIA
          </h4>
          <h5 className="font-bakbak text-4xl! font-black text-(--brand-cafe) [-webkit-text-stroke:1.5px_currentColor]">
            HISTORIA
          </h5>
          <p className="font-barlow mt-3 text-sm! leading-relaxed text-(--brand-cafe)">
            Podrías ser uno de los próximos artistas sensación de Bolívia. ¿Te
            animas?
          </p>
        </div>


        {/* Versión Desktop: 1 columna */}
        <div className="relative mx-auto hidden max-w-6xl items-center gap-12 pr-8 pl-24 md:grid md:grid-cols-1 lg:pr-12 lg:pl-40">
          <div>
            <h2 className="font-bakbak text-4xl! font-black text-(--brand-negro) [-webkit-text-stroke:1px_currentColor] lg:text-6xl!">
              ESCRIBE
            </h2>
            <h4 className="font-bakbak text-6xl! font-black text-(--brand-cafe) [-webkit-text-stroke:1px_currentColor] lg:text-8xl!">
              TU PROPIA
            </h4>
            <h5 className="font-bakbak text-7xl! font-black text-(--brand-cafe) [-webkit-text-stroke:1.5px_currentColor] lg:text-9xl!">
              HISTORIA
            </h5>
            <p className="font-barlow mt-3 max-w-lg text-2xl! leading-relaxed text-(--brand-cafe)">
             Podrías ser uno de los próximos artistas
             <br/>
             sensación de Bolívia. ¿Te animas?
            </p>
          </div>
        </div>
 
      </section>
  
);
}
