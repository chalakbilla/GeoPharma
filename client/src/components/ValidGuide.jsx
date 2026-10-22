import React, { useEffect, useRef, useState } from "react";
import { FaCheckCircle } from "react-icons/fa";

// Annotated sample prescription ("What makes a valid prescription?").
// Drawn on a fixed 690x410 canvas and scaled to fit the panel width.
const W = 690;
const H = 410;

const Chip = ({ style, children }) => (
  <div
    style={style}
    className="absolute flex items-center gap-2 whitespace-nowrap rounded-xl border border-brand/25 bg-mint px-3 py-2 text-[14px] font-semibold text-brand-dark shadow-sm"
  >
    <FaCheckCircle className="text-[17px] text-brand" />
    {children}
  </div>
);

const ValidGuide = () => {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = () => setScale(Math.min(1, el.clientWidth / W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: H * scale }}>
      <div
        className="absolute left-0 top-0"
        style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {/* connectors */}
        <svg className="absolute inset-0" width={W} height={H} aria-hidden="true">
          <g stroke="#0e6b4c" strokeWidth="1.5" fill="none">
            <path d="M104 44 V62 H158" />
            <path d="M590 58 V104 H494" />
            <path d="M100 228 V252 H158" />
            <path d="M497 352 H530" />
          </g>
          <g fill="#0e6b4c">
            <circle cx="158" cy="62" r="4" />
            <circle cx="494" cy="104" r="4" />
            <circle cx="158" cy="252" r="4" />
            <circle cx="497" cy="352" r="4" />
          </g>
        </svg>

        <Chip style={{ left: 0, top: 8 }}>Doctor's details</Chip>
        <Chip style={{ left: 520, top: 22 }}>Patient's details</Chip>
        <Chip style={{ left: 0, top: 192 }}>Medicine details</Chip>
        <Chip style={{ left: 530, top: 334 }}>Doctor's sign + stamp</Chip>

        {/* sample prescription */}
        <div
          className="absolute rounded-2xl border border-line bg-white p-[18px] text-ink shadow-[0_12px_30px_-14px_rgba(15,36,56,0.35)]"
          style={{ left: 158 - 8, top: 4, width: 350, height: 400, fontSize: 13 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink text-[15px] font-bold text-white">
                Rx
              </div>
              <div className="leading-snug">
                <p className="font-bold">Dr. Varun, MBBS, MD</p>
                <p className="text-ink-soft">General Physician</p>
                <p className="text-ink-soft">City Hospital, Ranchi</p>
              </div>
            </div>
            <p className="pt-9 text-[12px] text-ink-soft">Reg. No. 12345</p>
          </div>

          <div className="my-3 border-t border-line" />

          <div className="flex justify-between text-[12.5px] leading-6">
            <div>
              <p>Patient Name : <span className="font-medium">Rohan Singh</span></p>
              <p>Age &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span className="font-medium">28 years</span></p>
              <p>Gender &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <span className="font-medium">Male</span></p>
            </div>
            <div className="pt-3 text-right">
              <p>Date : 14-10-2025</p>
              <p>OPD No. : 4587</p>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-lg border border-line text-[12.5px]">
            <div className="grid grid-cols-[1.5fr_0.9fr_0.7fr_0.9fr] gap-1 bg-[#f1f4f3] px-3 py-2 font-semibold">
              <span>Medicine Name</span>
              <span>Strength</span>
              <span>Dose</span>
              <span>Duration</span>
            </div>
            <div className="grid grid-cols-[1.5fr_0.9fr_0.7fr_0.9fr] gap-1 border-t border-line px-3 py-2">
              <span>Tab. Metformin</span>
              <span>500mg</span>
              <span>1-0-1</span>
              <span>6 months</span>
            </div>
            <div className="grid grid-cols-[1.5fr_0.9fr_0.7fr_0.9fr] gap-1 border-t border-line px-3 py-2">
              <span>Tab. Atorvastatin</span>
              <span>10mg</span>
              <span>0-1-0</span>
              <span>6 months</span>
            </div>
          </div>

          <div className="mt-4 flex justify-end pr-2">
            <div className="text-[12px] leading-snug">
              <svg width="92" height="34" viewBox="0 0 92 34" fill="none" aria-hidden="true">
                <path
                  d="M3 24 C10 4 16 2 18 14 C20 26 24 6 30 10 C36 14 30 26 40 18 C48 10 52 6 58 14 C62 20 70 22 88 12"
                  stroke="#0f2438"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              <p className="font-bold">Dr. Varun</p>
              <p>MBBS, MD</p>
              <p className="text-ink-soft">Reg. No. 12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidGuide;
