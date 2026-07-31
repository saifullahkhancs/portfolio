const ROW_A = [
  "Docker",
  "Kubernetes",
  "Azure",
  "Nginx",
  "Linux",
  "Git",
  "GitHub Actions",
  "Postman",
  "Celery",
  "Redis",
  "Kafka",
];

const ROW_B = [
  "PostgreSQL",
  "MongoDB",
  "Neo4j",
  "Elasticsearch",
  "Playwright",
  "Scrapy",
  "Swagger",
  "Supabase",
  "Vercel",
  "Cloud Run",
  "systemd",
];

function Strip({ items, reverse = false, duration = 32 }: { items: string[]; reverse?: boolean; duration?: number }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-strip marquee-mask overflow-hidden py-1">
      <div
        className="flex w-max items-center gap-3 animate-marquee-x"
        style={{
          ["--marquee-duration" as any]: `${duration}s`,
          animationDirection: reverse ? "reverse" : undefined,
        }}
      >
        {doubled.map((tool, i) => (
          <span
            key={`${tool}-${i}`}
            aria-hidden={i >= items.length}
            className="whitespace-nowrap rounded-lg border border-border bg-surface px-4 py-2 font-mono text-xs text-foreground/90 shadow transition-colors hover:border-primary/50 hover:text-primary"
          >
            {tool}
          </span>
        ))}
      </div>
    </div>
  );
}

/** two opposing infinite marquee strips of the tools & platforms I work with */
export function ToolStrips() {
  return (
    <div className="space-y-3">
      <Strip items={ROW_A} duration={34} />
      <Strip items={ROW_B} duration={42} reverse />
    </div>
  );
}
