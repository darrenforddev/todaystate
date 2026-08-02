type BullBearCardProps = {
  probability: number;
  marketState: string;
  confidence: string;
  risk: string;
};

export default function BullBearCard({
  probability,
  marketState,
  confidence,
  risk,
}: BullBearCardProps) {
  return (
    <article className="rounded-3xl border border-cyan-400/15 bg-[#0a1626] p-7 shadow-2xl shadow-cyan-950/20">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm uppercase tracking-widest text-slate-500">
            Current Market State
          </p>

          <h3 className="mt-2 text-2xl font-bold">
            {marketState}
          </h3>
        </div>

        <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
          IMPROVING
        </div>

      </div>

      <div className="my-8 flex justify-center">

        <div className="flex h-52 w-52 items-center justify-center rounded-full border-[14px] border-emerald-400/15 bg-[#07111f]">

          <div className="text-center">

            <p className="text-6xl font-black text-emerald-400">
              {probability}%
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Bull Probability
            </p>

          </div>

        </div>

      </div>

      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-2xl bg-white/[0.03] p-4 text-center">

          <p className="text-xs text-slate-500">
            Confidence
          </p>

          <p className="mt-2 text-xl font-bold">
            {confidence}
          </p>

        </div>

        <div className="rounded-2xl bg-white/[0.03] p-4 text-center">

          <p className="text-xs text-slate-500">
            Risk
          </p>

          <p className="mt-2 text-xl font-bold text-amber-300">
            {risk}
          </p>

        </div>

      </div>

    </article>
  );
}