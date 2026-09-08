import Image from 'next/image';

const gradientBorderStyle = {
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

export default function HeroButacas() {
  return (
    <section
      className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden bg-(--brand-crema) py-16 sm:py-24"
      style={gradientBorderStyle}
    >
      <Image src="/images/FONDOS/FC_1.jpg" alt="" fill className="object-cover object-center" />

      {/* Versión Mobile: centrada, mismo criterio que HeroInscripcion */}
      <div className="relative mx-auto max-w-xl px-6 text-center md:hidden">
        <h2 className="font-bakbak text-2xl! font-black text-(--brand-negro)">NO TE QUEDES SIN</h2>
        <h4 className="font-bakbak text-3xl! font-black text-(--brand-cafe)">TUS PROPIAS</h4>
        <h5 className="font-bakbak text-4xl! font-black text-(--brand-cafe)">BUTACAS</h5>
        <p className="font-barlow mt-3 text-sm! leading-relaxed text-(--brand-cafe)">
          El festival es GRATIS, pero puedes reservar tus propias butacas con antelación.
        </p>
      </div>

      {/* Versión Desktop */}
      <div className="relative mx-auto hidden max-w-6xl items-center gap-12 pr-8 pl-24 md:grid md:grid-cols-1 lg:pr-12 lg:pl-40">
        <div>
          <h2 className="font-bakbak text-4xl! font-black text-(--brand-negro) lg:text-6xl!">NO TE QUEDES SIN</h2>
          <h4 className="font-bakbak text-6xl! font-black text-(--brand-cafe) lg:text-8xl!">TUS PROPIAS</h4>
          <h5 className="font-bakbak text-7xl! font-black text-(--brand-cafe) lg:text-9xl!">BUTACAS</h5>
          <p className="font-barlow mt-3 max-w-lg text-2xl! leading-relaxed text-(--brand-cafe)">
            El festival es GRATIS, pero puedes reservar tus propias
            <br />
            butacas con antelación.
          </p>
        </div>
      </div>
    </section>
  );
}
