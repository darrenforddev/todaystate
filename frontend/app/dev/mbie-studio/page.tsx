import StudioHeader from "@/components/mbie/StudioHeader";
import { getThemeIntelligence } from "@/engine/themeEngine";

export default function MBIEStudio() {
  const industrialRecovery = getThemeIntelligence("industrial-recovery");

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <StudioHeader version="0.1" />

      <section className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-6 text-2xl font-semibold">Theme Intelligence</h2>

        <pre className="overflow-auto text-sm">
          {JSON.stringify(industrialRecovery, null, 2)}
        </pre>
      </section>
    </main>
  );
}
