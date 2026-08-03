type ETFSectionProps = {
  etfs: string[];
};

export default function ETFSection({ etfs }: ETFSectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">Related ETFs</h2>

      <div className="mt-6 flex flex-wrap gap-3">
        {etfs.map((etf) => (
          <span
            key={etf}
            className="rounded-full bg-cyan-400/10 px-4 py-2 font-semibold text-cyan-300"
          >
            {etf}
          </span>
        ))}
      </div>
    </section>
  );
}
