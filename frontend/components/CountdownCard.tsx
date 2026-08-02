type CountdownCardProps = {
  title: string;
  event: string;
  countdown: string;
};

export default function CountdownCard({
  title,
  event,
  countdown,
}: CountdownCardProps) {
  return (
    <section className="rounded-3xl border border-cyan-400/15 bg-[#0a1626] p-6">
      <h2 className="text-xl font-bold">{title}</h2>

      <p className="mt-4 text-slate-400">{event}</p>

      <p className="mt-6 text-4xl font-black text-cyan-400">{countdown}</p>
    </section>
  );
}
