type CompanySectionProps = {
  companies: string[];
};

export default function CompanySection({ companies }: CompanySectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">Companies benefiting</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {companies.map((company) => (
          <div
            key={company}
            className="rounded-2xl bg-white/[0.03] px-4 py-3 text-slate-300"
          >
            {company}
          </div>
        ))}
      </div>
    </section>
  );
}
