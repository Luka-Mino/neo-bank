// A slim, continuously-scrolling value strip. Pure CSS (pauses on hover, still
// under reduced-motion) — no client JS. The row is duplicated so the -50%
// translate loops seamlessly.

const ITEMS = [
  "USD",
  "EUR",
  "GBP",
  "Settles in ~2s",
  "$0 hidden fees",
  "Backed 1:1",
  "Regulated rails",
  "On-chain · 24/7",
];

export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee-wrap overflow-hidden border-y border-white/[0.07] bg-[#0a1c1c] py-4">
      <div className="marquee-track flex w-max items-center">
        {row.map((item, i) => (
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
    </div>
  );
}
