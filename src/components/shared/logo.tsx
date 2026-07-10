import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoVariant = "icon" | "wordmark" | "full";
type LogoTone = "turquoise" | "reverse" | "forest";

interface LogoProps {
  variant?: LogoVariant;
  tone?: LogoTone;
  size?: number;
  className?: string;
  priority?: boolean;
}

const sources: Record<LogoTone, Record<LogoVariant, string>> = {
  turquoise: {
    icon: "/brand/moneta-icon-turquoise.svg",
    wordmark: "/brand/moneta-type-turquoise.svg",
    full: "/brand/moneta-full-turquoise.svg",
  },
  reverse: {
    icon: "/brand/moneta-icon-reverse.svg",
    wordmark: "/brand/moneta-type-reverse.svg",
    full: "/brand/moneta-full-reverse.svg",
  },
  forest: {
    icon: "/brand/moneta-icon-forest.svg",
    wordmark: "/brand/moneta-type-turquoise.svg",
    full: "/brand/moneta-full-forest.svg",
  },
};

const aspect: Record<LogoVariant, number> = {
  icon: 1,
  wordmark: 3.4,
  full: 3.0,
};

export function Logo({
  variant = "icon",
  tone = "turquoise",
  size = 28,
  className,
  priority,
}: LogoProps) {
  const ratio = aspect[variant];
  const width = Math.round(size * ratio);
  const height = size;

  return (
    <Image
      src={sources[tone][variant]}
      alt="Moneta"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
      style={{ height: size, width: width }}
    />
  );
}
