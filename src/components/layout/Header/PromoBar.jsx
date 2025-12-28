'use client';

export default function PromoBar({ isVisible = true, text = '', bgColor = '#C3FF8A' }) {
  if (!isVisible) return null;

  return (
    <div
      className="group w-full py-2 flex justify-center cursor-pointer"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="
          text-center font-raleway font-bold
          text-[clamp(10px,1.5vw,19px)]
          max-w-[500px] md:max-w-[700px]
          lg:max-w-[960px] xl:max-w-[1440px]
          px-4
        "
      >
        <a
          href="/"
          className="
            inline-block
            transition-colors
            group-hover:animate-[pulse.9s_ease-out_1]
            focus-visible:animate-[pulse.9s_ease-out_1]
          "
        >
          BLACK FRIDAY: fino al -30% 🔥 Il prezzo più basso dell’anno – non lasciartelo scappare!{' '}
          {text}
        </a>
      </div>
    </div>
  );
}
