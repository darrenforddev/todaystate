type WhySectionProps = {
  reasons: string[];
};

export default function WhySection({ reasons }: WhySectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">Why TodayState Likes This Theme</h2>

      <div className="mt-6 space-y-4">
        {reasons.map((reason) => (
          <div
            key={reason}
            className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-4"
          >
            <span className="text-xl text-emerald-400">✓</span>

            <p className="text-slate-300">{reason}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
