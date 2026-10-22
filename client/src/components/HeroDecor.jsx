import React from "react";

// Botanical + capsule decoration for the upload card (pure SVG/CSS, no image files needed).
const Leaf = ({ style, className = "" }) => (
  <svg viewBox="0 0 120 180" className={`absolute ${className}`} style={style} aria-hidden="true">
    <path d="M60 2 C112 42 122 124 60 178 C-2 124 8 42 60 2 Z" fill="url(#leafGrad)" />
    <path d="M60 10 L60 172" stroke="#c9ecd0" strokeWidth="2" strokeLinecap="round" opacity="0.7" fill="none" />
    <path
      d="M60 52 L30 34 M60 52 L90 34 M60 86 L24 64 M60 86 L96 64 M60 120 L30 98 M60 120 L90 98"
      stroke="#c9ecd0"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
      fill="none"
    />
  </svg>
);

const Capsule = ({ a, b, className = "", style }) => (
  <div
    className={`floaty absolute h-9 w-[78px] overflow-hidden rounded-full shadow-[0_8px_16px_-6px_rgba(0,0,0,0.35)] ${className}`}
    style={style}
  >
    <div className="flex h-full">
      <div className="w-1/2" style={{ background: a }} />
      <div className="w-1/2" style={{ background: b }} />
    </div>
    <div className="absolute inset-x-3 top-1 h-2 rounded-full bg-white/45" />
  </div>
);

const HeroDecor = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
    <svg width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5db56f" />
          <stop offset="100%" stopColor="#1b6b3b" />
        </linearGradient>
      </defs>
    </svg>

    {/* left foliage */}
    <Leaf className="-left-10 top-2 h-44 w-28 opacity-90" style={{ transform: "rotate(-28deg)" }} />
    <Leaf className="-left-12 top-36 h-52 w-32" style={{ transform: "rotate(-62deg)" }} />
    <Leaf className="-left-8 top-72 h-48 w-28 opacity-95" style={{ transform: "rotate(-95deg)" }} />
    <Leaf className="-left-6 bottom-10 h-40 w-24" style={{ transform: "rotate(-130deg)" }} />
    {/* right foliage */}
    <Leaf className="-right-10 top-24 h-48 w-28" style={{ transform: "rotate(30deg)" }} />
    <Leaf className="-right-12 top-72 h-52 w-32 opacity-95" style={{ transform: "rotate(68deg)" }} />
    <Leaf className="-right-8 bottom-4 h-44 w-28" style={{ transform: "rotate(115deg)" }} />

    {/* capsules */}
    <Capsule a="#f59b3a" b="#f0842a" className="right-6 top-6 hidden sm:block" style={{ "--r": "38deg", transform: "rotate(38deg)" }} />
    <Capsule a="#ffffff" b="#f59b3a" className="right-10 top-36 hidden sm:block" style={{ "--r": "-60deg", transform: "rotate(-60deg)" }} />
    <Capsule a="#f59b3a" b="#e8782a" className="left-3 top-[34%] hidden sm:block" style={{ "--r": "-25deg", transform: "rotate(-25deg)" }} />
    <Capsule a="#22a05b" b="#ffffff" className="left-14 top-[26%] hidden md:block" style={{ "--r": "50deg", transform: "rotate(50deg)" }} />
    <Capsule a="#f3e6cf" b="#f7efe0" className="right-4 top-[52%] hidden sm:block" style={{ "--r": "28deg", transform: "rotate(28deg)" }} />
    <Capsule a="#22a05b" b="#ffffff" className="bottom-24 right-4 hidden md:block" style={{ "--r": "-55deg", transform: "rotate(-55deg)" }} />
  </div>
);

export default HeroDecor;
