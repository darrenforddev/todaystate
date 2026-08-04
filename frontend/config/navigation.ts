export type NavigationItem = {
  label: string;
  href: string;
  icon: string;
};

export type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export const navigation: NavigationGroup[] = [
  {
    title: "Briefing",
    items: [
      {
        label: "Morning Brief",
        href: "/morning-brief",
        icon: "🌅",
      },
      {
        label: "Market Brain",
        href: "/market-brain",
        icon: "🌍",
      },
    ],
  },
  {
    title: "Intelligence",
    items: [
      {
        label: "Themes",
        href: "/themes/industrial-recovery",
        icon: "🧠",
      },
      {
        label: "Companies",
        href: "/companies/nvidia",
        icon: "🏢",
      },
      {
        label: "Evidence",
        href: "/evidence",
        icon: "📊",
      },
      {
        label: "ETFs",
        href: "/etfs",
        icon: "📈",
      },
    ],
  },
  {
    title: "Markets",
    items: [
      {
        label: "Live",
        href: "/live",
        icon: "⚡",
      },
    ],
  },
];