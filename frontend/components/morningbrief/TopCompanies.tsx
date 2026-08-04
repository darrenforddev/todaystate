import { getTopCompanies } from "@/engine/ranking";

export default function TopCompanies() {
  const companies = getTopCompanies(5);

  return (
    <div className="space-y-4">
      {companies.map((company, index) => (
        <div
          key={company.id}
          className="flex items-center justify-between rounded-2xl border border-white/5 bg-[#0a1626] p-5"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl">{index + 1}</span>

            <div>
              <h3 className="text-lg font-bold">{company.name}</h3>

              <p className="text-sm text-slate-400">
                Conviction {company.conviction}
              </p>
            </div>
          </div>

          <span className="text-3xl font-black text-cyan-300">
            {company.conviction}
          </span>
        </div>
      ))}
    </div>
  );
}
