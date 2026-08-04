import Link from "next/link";

type ETFSectionProps = {
  etfs: string[];
};

export default function ETFSection({ etfs }: ETFSectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">ETF Exposure</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {etfs.map((ticker) => (
          <Link
            key={ticker}
            href={`/etfs/${ticker.toLowerCase()}`}
            className="rounded-2xl bg-white/[0.03] p-4 transition hover:bg-cyan-400/10"
          >
            <p className="font-semibold">{ticker}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
