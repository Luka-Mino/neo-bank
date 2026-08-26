// A slim, continuously-scrolling strip. Two identical sets — each repeated wide
// enough to exceed any viewport — animate -50% for a seamless, gapless loop.
// Pure CSS: pauses on hover, still under reduced-motion.

const ITEMS = [
  "Real-time settlement",
  "No hidden fees",
  "Regulated rails",
  "Available 24/7",
  "Money, made simple",
];

function MarqueeSet({ ariaHidden = false }: { ariaHidden?: boolean }) {
  // Repeat so a single set is wider than the widest screen; -50% then never
  // reveals empty space.
  const items = Array.from({ length: 4 }).flatMap(() => ITEMS);
  return (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {items.map((item, i) => (
        <span
          key={i}
          className="flex items-center whitespace-nowrap text-sm font-medium text-white/45"
        >
          {item}
          <span
            aria-hidden
            className="mx-6 inline-block h-1 w-1 rounded-full bg-[#4ac280]/70"
          />
        </span>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <div className="marquee-wrap overflow-hidden border-y border-white/[0.07] bg-[#0a1c1c] py-4">
      <div className="marquee-track flex w-max items-center">
        <MarqueeSet />
        <MarqueeSet ariaHidden />
      </div>
    </div>
  );
}
