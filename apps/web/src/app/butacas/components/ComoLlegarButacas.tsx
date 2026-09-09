import Image from 'next/image';

const MAPS_EMBED_URL = 'https://www.google.com/maps?q=Teatro+Internacional+de+Oruro,+Bolivia&output=embed';
const MAPS_DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=Teatro+Internacional+de+Oruro,+Bolivia';

const gradientBorderStyle = {
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

export default function ComoLlegarButacas() {
  return (
    <section className="relative overflow-hidden bg-(--brand-blanco)" style={gradientBorderStyle}>
      <div className="relative mx-auto max-w-7xl">
        {/* Bloque superior: foto con corte diagonal + texto centrado */}
        <div className="grid grid-cols-1 items-center md:grid-cols-2">
          <div className="relative h-72 w-full overflow-hidden sm:h-96 md:h-[420px] md:[clip-path:polygon(0_0,100%_0,82%_100%,0_100%)]">
            <Image src="/images/palco.jpg" alt="Teatro Internacional de Oruro" fill className="object-cover object-center" />
          </div>

          <div className="flex flex-col items-start justify-start p-8 text-start md:items-center md:p-12">
            <h2 className="font-bakbak text-5xl! font-black text-(--brand-negro)! lg:text-6xl!">¿Cómo llegar?</h2>
            <p className="font-barlow mt-4 max-w-md text-xl! leading-relaxed text-(--brand-cafe) lg:text-xl!">
              Aquí Canta Bolivia tendrá como sede oficial el
              <br />
              Teatro Internacional de la ciudad de Oruro,
              <br />
              aquí te explicamos cómo puedes llegar allá.
            </p>
            <a
              href={MAPS_DIRECTIONS_URL}
              target="_blank"
              rel="noreferrer"
              className="font-bakbak mt-6 inline-block rounded-full border border-(--brand-negro) bg-transparent px-8 py-2 text-base font-bold text-(--brand-negro)! transition-all duration-200 hover:bg-(--brand-negro) hover:text-(--brand-blanco)!"
            >
              Google Maps
            </a>
          </div>
        </div>

        {/* Mapa embebido */}
        <div className="relative h-80 w-full overflow-hidden border-t border-neutral-200 sm:h-[400px]">
          <iframe
            src={MAPS_EMBED_URL}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación del Teatro Internacional de Oruro"
          />
        </div>
      </div>
    </section>
  );
}
