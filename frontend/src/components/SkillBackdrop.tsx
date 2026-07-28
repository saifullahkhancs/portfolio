import { Boxes, Database, Lock, Mail, MessageSquare, Server, Shield, Workflow } from "lucide-react";

const codeSnippets: Record<string, string[]> = {
  "Programming Languages": [
    "def greet(name):",
    '    print(f"Hello, {name}!")',
    'greet("World")',
    "# Hello, World!",
    "for i in range(3):",
    "    print(i * i)",
  ],
  "Backend Frameworks": [
    "@app.post('/items')",
    "def create(item: Item):",
    "    db.add(item); db.commit()",
    "    return item",
    "@app.get('/items/{id}')",
    "def read(id: int): return get(id)",
  ],
  Frontend: [
    "const [data, setData] = useState([])",
    "useEffect(() => {",
    "  fetch('/api/items')",
    "    .then(r => r.json())",
    "    .then(setData)",
    "}, [])",
  ],
};

function CodeRain({ lines }: { lines: string[] }) {
  const doubled = [...lines, ...lines];
  return (
    <div className="skill-backdrop">
      <div className="animate-code-scroll space-y-1 px-4 pt-3 font-mono text-[0.6rem] leading-4 text-primary">
        {doubled.map((l, i) => (
          <div key={i} className="whitespace-pre">
            <span className="text-muted-foreground">{(i % lines.length) + 1} </span>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

function RowFlow() {
  const rows = ["1  user_42   active", "2  order_88  shipped", "3  node_07   synced", "4  log_215   ok"];
  return (
    <div className="skill-backdrop">
      <div className="animate-code-scroll space-y-1.5 px-4 pt-3 font-mono text-[0.6rem] text-accent">
        {[...rows, ...rows, ...rows].map((r, i) => (
          <div key={i} className="flex items-center gap-2 whitespace-pre">
            <Database size={9} />
            {r}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageFlow() {
  return (
    <div className="skill-backdrop flex items-center justify-center">
      <div className="relative flex w-full items-center justify-between px-6 font-mono text-[0.55rem] text-primary">
        <span className="flex items-center gap-1">
          <Server size={12} /> producer
        </span>
        <span className="absolute left-1/2 h-px w-[38%] -translate-x-1/2 bg-primary/40" />
        <MessageSquare size={11} className="animate-msg-flow absolute left-[24%] text-accent" />
        <MessageSquare
          size={11}
          className="animate-msg-flow absolute left-[24%] text-accent"
          style={{ animationDelay: "1.2s" }}
        />
        <span className="flex items-center gap-1">
          consumer <Server size={12} />
        </span>
      </div>
    </div>
  );
}

function NodeMesh({ icon: Icon = Boxes }: { icon?: typeof Boxes }) {
  return (
    <div className="skill-backdrop flex items-center justify-center gap-6 text-primary">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className="animate-node-pulse relative" style={{ animationDelay: `${i * 0.35}s` }}>
          <Icon size={20} />
          {i < 3 && <span className="absolute top-1/2 left-full h-px w-6 bg-primary/40" />}
        </span>
      ))}
    </div>
  );
}

function ShieldFlow() {
  return (
    <div className="skill-backdrop flex items-center justify-center gap-5 text-primary">
      <Lock size={18} className="animate-node-pulse" />
      <div className="animate-code-scroll font-mono text-[0.6rem] text-accent">
        <div>Authorization: Bearer •••</div>
        <div>role: admin ✓</div>
        <div>429 rate limited</div>
        <div>Authorization: Bearer •••</div>
        <div>role: admin ✓</div>
        <div>429 rate limited</div>
      </div>
      <Shield size={18} className="animate-node-pulse" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

export function SkillBackdrop({ group }: { group: string }) {
  if (codeSnippets[group]) return <CodeRain lines={codeSnippets[group]} />;
  if (group === "Databases") return <RowFlow />;
  if (group === "Messaging & Realtime") return <MessageFlow />;
  if (group === "Architecture") return <NodeMesh icon={Workflow} />;
  if (group === "Auth & Security") return <ShieldFlow />;
  return <NodeMesh icon={Mail} />;
}
