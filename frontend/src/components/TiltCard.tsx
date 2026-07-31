import { useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Subtle 3D tilt-on-hover wrapper used by project cards.
 * The card follows the cursor a few degrees and settles back smoothly,
 * with a light sheen that sweeps across on hover.
 */
export function TiltCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});
  const [sheen, setSheen] = useState<CSSProperties>({ opacity: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setStyle({
      transform: `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translateY(-6px)`,
      transition: "transform 180ms linear",
    });
    setSheen({
      opacity: 1,
      background: `radial-gradient(420px circle at ${((px + 0.5) * 100).toFixed(1)}% ${((py + 0.5) * 100).toFixed(1)}%, color-mix(in oklab, var(--color-primary) 10%, transparent), transparent 65%)`,
    });
  };

  const onLeave = () => {
    setStyle({
      transform: "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)",
      transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
    });
    setSheen({ opacity: 0, transition: "opacity 400ms ease" });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ...style, transformStyle: "preserve-3d" }}
      className={`relative h-full will-change-transform ${className}`}
    >
      {children}
      {/* cursor-following sheen */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" style={sheen} />
    </div>
  );
}
