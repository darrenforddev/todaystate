import type { Theme } from "../../types/theme";
import EvidenceCard from "./EvidenceCard";

type WhySectionProps = {
  reasons: Theme["why"];
};

export default function WhySection({ reasons }: WhySectionProps) {
  return (
    <section className="mt-10 rounded-3xl border border-white/5 bg-[#0a1626] p-7">
      <h2 className="text-2xl font-bold">Why TodayState Likes This Theme</h2>

      <div className="mt-6 space-y-4">
        {reasons.map((item) => (
          <EvidenceCard key={item.reason} item={item} />
        ))}
      </div>
    </section>
  );
}
