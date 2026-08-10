"use client";

import { useState } from "react";

type CompanyLogoSize = "small" | "large";

interface CompanyLogoProps {
  companyName: string;
  domain?: string;
  size?: CompanyLogoSize;
  className?: string;
}

const sizeStyles: Record<CompanyLogoSize, string> = {
  small: "h-11 w-11 rounded-xl text-xs",
  large: "h-20 w-20 rounded-2xl text-lg",
};

const imageSizes: Record<CompanyLogoSize, number> = {
  small: 44,
  large: 80,
};

function getInitials(companyName: string): string {
  const words = companyName
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function buildLogoSource(domain: string, clientId: string): string {
  const identifier = encodeURIComponent(domain.trim().toLowerCase());
  const credential = encodeURIComponent(clientId);

  return `https://cdn.brandfetch.io/domain/${identifier}?c=${credential}`;
}

export default function CompanyLogo({
  companyName,
  domain,
  size = "small",
  className = "",
}: CompanyLogoProps) {
  const [failedSource, setFailedSource] = useState<string>();
  const clientId = process.env.NEXT_PUBLIC_BRANDFETCH_CLIENT_ID?.trim();
  const logoSource = domain && clientId
    ? buildLogoSource(domain, clientId)
    : undefined;
  const imageFailed = logoSource === failedSource;
  const dimension = imageSizes[size];
  const sharedStyles = `${sizeStyles[size]} ${className}`;

  if (!logoSource || imageFailed) {
    return (
      <span
        aria-label={`${companyName} logo unavailable`}
        role="img"
        className={`inline-flex shrink-0 items-center justify-center border border-cyan-400/20 bg-gradient-to-br from-cyan-400/15 to-blue-500/10 font-black tracking-wide text-cyan-200 shadow-[0_10px_30px_rgba(6,182,212,0.08)] ${sharedStyles}`}
      >
        {getInitials(companyName)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white p-1.5 shadow-[0_10px_30px_rgba(2,8,23,0.28)] ${sharedStyles}`}
    >
      {/* Brandfetch requires direct browser hotlinking rather than image proxying. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSource}
        alt={`${companyName} logo`}
        width={dimension}
        height={dimension}
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
        referrerPolicy="strict-origin-when-cross-origin"
        onError={() => setFailedSource(logoSource)}
      />
    </span>
  );
}
