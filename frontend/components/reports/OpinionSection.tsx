type OpinionSectionProps = {
  opinion: string;
  confidence: number;
};

export default function OpinionSection({
  opinion,
  confidence,
}: OpinionSectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/40 to-[#0a1626] p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-cyan-300">
          🧠 Market Brain Verdict
        </h2>

        <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-300">
          {confidence}% Confidence
        </span>
      </div>

      <p className="mt-6 text-lg leading-8 text-slate-300">{opinion}</p>
    </section>
  );
}
