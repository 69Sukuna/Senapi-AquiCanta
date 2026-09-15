import Image from 'next/image';

const gradientBorderStyle = {
  borderBottom: '4px solid',
  borderImage: 'linear-gradient(to right, #e30613, #fcee21, #00873e) 1',
};

// Copy fija de la sección (no depende del trayecto activo) — ver mockup.
// El sello circular de la derecha usa el logo de la app como placeholder;
// se reemplaza por el arte final directamente en el <Image> de abajo.
export function SellosHero() {
  return (
      <section className="relative overflow-hidden bg-(--brand-crema)" style={gradientBorderStyle}>
        {/* Fondo de la sección */}
        <Image
          src="/images/FONDOS/FC_3.jpg"
          alt=""
          fill
          className="object-cover object-center"
        />

        {/* Contenedor principal con padding solo vertical para el texto */}
        <div className="relative mx-auto grid min-h-[95vh] max-w-6xl items-center gap-10 px-6 py-12 sm:grid-cols-2 sm:px-10 lg:px-12">

          {/* Columna Texto */}
          <div className="text-center sm:text-left z-10">
            <h2 className="font-bakbak text-2xl! leading-[0.88] tracking-tight text-(--brand-negro) sm:text-3xl! lg:text-4xl!">
              COLECCIONA
            </h2>
            <h2 className="font-bakbak text-6xl! leading-[0.88] tracking-tight text-(--brand-cafe) sm:text-7xl! lg:text-8xl!">
              SELLOS
            </h2>
            <h2 className="font-bakbak text-2xl! leading-[0.88] tracking-tight text-(--brand-negro) sm:text-3xl! lg:text-4xl!">
              EN DISTINTOS
            </h2>
            <h2 className="font-bakbak text-6xl! leading-[0.88] tracking-tight text-(--brand-cafe) sm:text-7xl! lg:text-9xl!">
              EVENTOS
            </h2>
            <p className="font-barlow mt-6 max-w-md text-base! font-medium leading-relaxed text-(--brand-cafe) sm:text-2xl!">
              Ahora cada evento te dará la posibilidad de
              coleccionar distintos sellos conmemorativos. ¿Puedes encontrarlos todos?
            </p>
          </div>

          {/* Columna Imagen Celular: Pegada arriba y abajo */}
          <div className="relative h-full w-full min-h-[450px] sm:absolute sm:right-6 sm:top-0 sm:bottom-0 sm:h-full sm:w-[45%] lg:right-12">
            <Image
              src="/sellos/B_ACB BADGE SELLO.png"
              alt="Sello de Aquí Canta Bolivia"
              fill
              className="object-cover object-center sm:object-contain sm:object-center drop-shadow-2xl"
            />
          </div>

        </div>
      </section>
  );
}
