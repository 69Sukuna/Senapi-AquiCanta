// Sección de bienvenida antes del formulario ("Escribe tu propia historia").
// TODO: maquetar según el diseño acordado.
export default function HeroInscripcion() {
return (
  <section>
    <div className="text-left">
      <h1 className="text-[42px] md:text-[58px] font-extrabold leading-none tracking-tight text-black">
        ESCRIBE
      </h1>

      <div className="font-extrabold leading-[0.82] tracking-tight text-[#514640]">
        <h6 className="text-[58px] md:text-[82px]">
          TU PROPIA
        </h6>

        <h6 className="text-[82px] md:text-[120px]">
          HISTORIA
        </h6>
      </div>

      <p className="mt-5 text-[18px] md:text-[24px] leading-tight text-[#514640]">
        Podrías ser uno de los próximos artistas
        <br />
        sensación de Bolivia. ¿Te animas?
      </p>
    </div>
  </section>
);
}
