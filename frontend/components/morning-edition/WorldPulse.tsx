const nodes = [
  { name: "New York", left: "18%", top: "42%" },
  { name: "Chicago", left: "24%", top: "38%" },
  { name: "London", left: "46%", top: "30%" },
  { name: "Frankfurt", left: "52%", top: "34%" },
  { name: "Dubai", left: "61%", top: "49%" },
  { name: "Singapore", left: "74%", top: "66%" },
  { name: "Shanghai", left: "78%", top: "43%" },
  { name: "Tokyo", left: "87%", top: "39%" },
  { name: "Sydney", left: "88%", top: "76%" },
];

const connections = [
  { left: "20%", top: "40%", width: "28%", rotate: "-8deg" },
  { left: "47%", top: "33%", width: "16%", rotate: "20deg" },
  { left: "60%", top: "48%", width: "18%", rotate: "24deg" },
  { left: "74%", top: "47%", width: "14%", rotate: "-4deg" },
  { left: "75%", top: "64%", width: "16%", rotate: "16deg" },
];

export default function WorldPulse() {
  return (
    <section className="relative mt-10 h-[320px] overflow-hidden rounded-3xl border border-cyan-400/15 bg-[#050b14]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),transparent_55%)]" />

      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      {connections.map((connection, index) => (
        <div
          key={index}
          className="absolute h-px origin-left bg-gradient-to-r from-cyan-300/10 via-cyan-300/45 to-cyan-300/10"
          style={{
            left: connection.left,
            top: connection.top,
            width: connection.width,
            transform: `rotate(${connection.rotate})`,
          }}
        />
      ))}

      {nodes.map((node) => (
        <div
          key={node.name}
          className="group absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: node.left, top: node.top }}
        >
          <div className="absolute inset-0 h-5 w-5 -translate-x-[6px] -translate-y-[6px] rounded-full bg-cyan-300/10 blur-sm" />

          <div className="relative h-2 w-2 animate-pulse rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.85)]" />

          <span className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-[0.2em] text-slate-500 opacity-0 transition group-hover:opacity-100">
            {node.name}
          </span>
        </div>
      ))}

      <div className="absolute bottom-8 left-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
          World Pulse
        </p>

        <p className="mt-2 text-sm text-slate-500">
          The global economy never sleeps.
        </p>
      </div>

      <div className="absolute bottom-8 right-8 text-right">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-600">
          Global activity network
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-400">
          Live visual prototype
        </p>
      </div>
    </section>
  );
}
