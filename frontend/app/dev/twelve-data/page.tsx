import { connection } from "next/server";
import { notFound } from "next/navigation";

import TwelveDataDiagnostic from "@/components/todayScore/TwelveDataDiagnostic";
import { realCompanyUniverse } from "@/data/realCompanyUniverse";
import { hasTwelveDataApiKey } from "@/engine/todayScore/providers/twelveData";

export default async function TwelveDataDiagnosticPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  await connection();

  return (
    <main className="min-h-screen bg-[#050b14] px-5 py-10 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
          TodayScore data laboratory
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">
          Financial-provider diagnostics
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          Verify real provider coverage before any Quality, Value or Momentum
          factor is calculated.
        </p>

        <div className="mt-9">
          <TwelveDataDiagnostic
            companies={realCompanyUniverse}
            keyConfigured={hasTwelveDataApiKey()}
          />
        </div>
      </div>
    </main>
  );
}
