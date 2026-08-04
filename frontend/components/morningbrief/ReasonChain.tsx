import Link from "next/link";
import { getReasonChain } from "@/engine/reasonChain";

export default function ReasonChain() {
  const chain = getReasonChain();

  const items = [chain.market, chain.theme, chain.evidence, chain.company];

  return (
    <div className="rounded-3xl border border-cyan-400/20 bg-[#0a1626] p-8">
      <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
        MBIE Reason Chain
      </h3>

      <div className="mt-8 flex flex-col items-center">
        {items.map((item, index) => (
          <div key={item.title} className="flex flex-col items-center">
            <div className="w-72 rounded-2xl border border-white/10 bg-[#081320] p-5 text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                {item.title}
              </p>

              {item.title === "Theme" ? (
                <Link
                  href={`/themes/${chain.theme.value
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                  className="mt-2 block text-xl font-bold text-white transition hover:text-cyan-300"
                >
                  {item.value}
                </Link>
              ) : item.title === "Company" ? (
                <Link
                  href={`/companies/${chain.company.value.toLowerCase()}`}
                  className="mt-2 block text-xl font-bold text-white transition hover:text-cyan-300"
                >
                  {item.value}
                </Link>
              ) : (
                <p className="mt-2 text-xl font-bold text-white">
                  {item.value}
                </p>
              )}
            </div>

            {index < items.length - 1 && (
              <div className="py-3 text-3xl text-cyan-300">↓</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
