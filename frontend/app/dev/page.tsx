import { themes } from "@/data/themes";
import { companies } from "@/data/companies";
import { evidence } from "@/data/evidence";
import { etfs } from "@/data/etfs";

export default function DeveloperDashboard() {
  return (
    <main className="min-h-screen bg-[#050b14] text-white">
      <div className="mx-auto max-w-7xl px-8 py-12">
        <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
          Internal
        </p>

        <h1 className="mt-3 text-6xl font-black">Developer Dashboard</h1>

        <p className="mt-4 text-slate-400">
          Internal project statistics and build health.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Themes" value={themes.length} colour="cyan" />

          <StatCard
            title="Companies"
            value={companies.length}
            colour="emerald"
          />

          <StatCard title="Evidence" value={evidence.length} colour="amber" />

          <StatCard title="ETFs" value={etfs.length} colour="purple" />
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#0a1626] p-8">
          <h2 className="text-2xl font-bold">Build Status</h2>

          <div className="mt-6 space-y-3">
            <StatusRow label="Theme Engine" status="Healthy" />

            <StatusRow label="Company Engine" status="Healthy" />

            <StatusRow label="Evidence Engine" status="Healthy" />

            <StatusRow label="Search Engine" status="Healthy" />

            <StatusRow label="Application Shell" status="Healthy" />
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  colour,
}: {
  title: string;
  value: number;
  colour: string;
}) {
  const colours: Record<string, string> = {
    cyan: "text-cyan-300",
    emerald: "text-emerald-300",
    amber: "text-amber-300",
    purple: "text-violet-300",
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0a1626] p-8">
      <p className="text-sm uppercase tracking-[0.25em] text-slate-500">
        {title}
      </p>

      <p className={`mt-4 text-5xl font-black ${colours[colour]}`}>{value}</p>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#081320] p-4">
      <span>{label}</span>

      <span className="font-semibold text-emerald-300">● {status}</span>
    </div>
  );
}
