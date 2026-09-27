import Image from "next/image";

type InkArtProps = { variant?: "hero" | "wash" | "fragment"; className?: string };

/** Decorative, shared ink artwork; it never covers interactive content. */
export function InkArt({ variant = "wash", className = "" }: InkArtProps) {
  const hero = variant === "hero";
  return <span aria-hidden="true" data-ink-art className={`ink-art ink-art--${variant} ${className}`}>
    <span className={`ink-art-motion${hero ? " ink-art-motion--hero" : ""}`}>
      <Image src={hero ? "/images/ink/taichi-1280.webp" : "/images/ink/brush-640.webp"} alt="" fill
        sizes={hero ? "(max-width: 767px) 320px, (max-width: 1599px) 48vw, 790px" : "(max-width: 767px) 200px, 400px"}
        preload={hero} className="ink-art-image" />
    </span>
  </span>;
}
