import { useEffect, useState } from "react";

/**
 * Coverflow-style certificate carousel.
 *  - certificates are shown as square cards
 *  - the active one sits in the centre, fully opaque and largest
 *  - the neighbours sit left / right, smaller and faded
 *  - the first certificate (display/sort order) starts in front
 *  - < and > buttons rotate the ring
 */
export default function CertCarousel({
  items,
  imageFor,
}: {
  items: any[];
  imageFor: (c: any) => string;
}) {
  const n = items.length;

  // Start with the first certificate in the list (display/sort order),
  // so the front card matches the leftmost dot (index 0).
  const [active, setActive] = useState(0);

  // Track the viewport width so the side-cards spread stays inside the screen
  // on small phones instead of overflowing and creating a horizontal scrollbar.
  const [viewport, setViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );

  useEffect(() => {
    const onResize = () => setViewport(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (!n) return null;

  // How far the neighbouring cards are pushed sideways from the centre.
  // Smaller on narrow screens so the faded side cards stay (mostly) on screen.
  const spread = viewport < 420 ? 112 : viewport < 640 ? 140 : 190;

  // shortest signed distance around the ring
  const offset = (i: number) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  const go = (dir: number) => setActive((a) => (a + dir + n) % n);
  const current = items[active];

  const arrow =
    "absolute top-1/2 z-[60] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 font-mono text-lg text-primary shadow-lg backdrop-blur transition-all duration-200 hover:scale-110 hover:border-primary/60 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

  return (
    <div className="select-none">
      <div className="relative mx-auto h-[330px] w-full max-w-3xl">
        {/* prev / next — pinned to the left & right sides, centred on the ring.
            Kept outside the overflow-clipped ring below so they can still sit
            outside the cards on wide screens. */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous certificate"
          className={`${arrow} left-1 sm:-left-2 lg:-left-20`}
        >
          &lt;
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next certificate"
          className={`${arrow} right-1 sm:-right-2 lg:-right-20`}
        >
          &gt;
        </button>

        {/* The ring is overflow-clipped so the faded side cards never extend
            beyond the viewport (no horizontal scrollbar / blank space on the
            right) — they simply fade at the screen edges. */}
        <div className="relative h-full w-full overflow-hidden" style={{ perspective: "1200px" }}>
          {items.map((c, i) => {
            const d = offset(i);
            const abs = Math.abs(d);
            const hidden = abs > 2;
            const img = imageFor(c);
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => setActive(i)}
                aria-label={c.name}
                aria-hidden={hidden}
                tabIndex={hidden ? -1 : 0}
                className="absolute left-1/2 top-1/2 rounded-[22px] transition-all duration-500 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{
                  transform: `translate(-50%, -50%) translateX(${d * spread}px) scale(${1 - abs * 0.22})`,
                  opacity: hidden ? 0 : abs === 0 ? 1 : abs === 1 ? 0.45 : 0.18,
                  filter: abs === 0 ? "none" : `blur(${abs}px)`,
                  zIndex: 50 - abs,
                  pointerEvents: hidden ? "none" : "auto",
                  cursor: abs === 0 ? "default" : "pointer",
                }}
              >
                <span
                  className={`block h-[260px] w-[260px] overflow-hidden rounded-[22px] border-2 bg-secondary shadow-[0_24px_60px_-24px_rgba(0,0,0,0.85)] ${
                    abs === 0 ? "border-primary/70" : "border-border"
                  }`}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={`${c.name} certificate issued by ${c.issuer}`}
                      loading="lazy"
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center px-6 text-center font-mono text-xs text-muted-foreground">
                      {c.issuer}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* details of the front certificate */}
      <div className="mx-auto mt-6 max-w-xl text-center">
        <p className="font-mono text-xs text-muted-foreground">{current.year}</p>
        <h3 className="mt-1 text-base font-semibold leading-snug">{current.name}</h3>
        <p className="font-mono text-sm text-primary">{current.issuer}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.detail}</p>
      </div>

      {/* dots — the < / > arrows live on the sides of the ring */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((c, i) => (
          <button
            key={`dot-${c.name}`}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show ${c.name}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
