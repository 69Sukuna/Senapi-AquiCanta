import Image from 'next/image';

const gradientBorderStyle = {
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

export default function BannerReservaLugares() {
  return (
    <section className="relative h-auto overflow-hidden py-12 sm:h-72 sm:py-16" style={gradientBorderStyle}>
      <Image src="/images/FONDOS/FRAV-06.jpg" alt="" fill className="object-cover object-center" />
      <div className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-black/10" />

      {/* Versión Mobile: alineada a la izquierda */}
      <div className="relative flex flex-col items-start gap-4 pl-6 md:hidden">
        <div>
          <span className="font-barlow block text-lg font-semibold tracking-wide text-white uppercase">Reserva los mejores</span>
          <span className="font-bakbak block text-3xl font-black text-white">LUGARES</span>
        </div>
      </div>

      {/* Versión Desktop: fila horizontal */}
      <div className="relative mx-auto hidden max-w-6xl items-center justify-start px-8 md:flex lg:px-12">
        <div>
          <span className="font-barlow text-2xl! font-semibold tracking-wide text-white uppercase lg:text-4xl!">
            Reserva los mejores
            <br />
          </span>
          <span className="font-bakbak text-4xl! font-black text-white lg:text-7xl!">LUGARES</span>
        </div>
      </div>
    </section>
  );
}
