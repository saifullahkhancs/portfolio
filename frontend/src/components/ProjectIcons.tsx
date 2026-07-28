import { Bot, Calendar, CheckCircle2, Clock, Database, Linkedin, Mail, Network, Send, Shield, Users } from "lucide-react";

const map: Record<string, { icon: typeof Mail; label: string }[]> = {
  LinkeFlow: [
    { icon: Linkedin, label: "LinkedIn" },
    { icon: Users, label: "Connections" },
    { icon: Calendar, label: "Scheduling" },
    { icon: Bot, label: "Automation" },
    { icon: Shield, label: "Encrypted auth" },
    { icon: Clock, label: "Rate limiting" },
  ],
  "Job Easy": [
    { icon: Mail, label: "Email automation" },
    { icon: Send, label: "Auto apply" },
    { icon: CheckCircle2, label: "Approval workflow" },
    { icon: Database, label: "Application tracking" },
  ],
  "Strike Ready": [
    { icon: Shield, label: "Threat intel" },
    { icon: Network, label: "Pipelines" },
    { icon: Database, label: "Elasticsearch" },
  ],
};

export function ProjectIcons({ name }: { name: string }) {
  const items = map[name];
  if (!items) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map(({ icon: Icon, label }) => (
        <li
          key={label}
          title={label}
          className="flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-1 font-mono text-[0.65rem] text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Icon size={12} className="text-primary" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}
