import { useId } from "react";

// Original vector hardware. 300:628 follows the 71.5 × 149.6 mm body;
// the live picture remains a separate interactive layer, never baked into art.
export default function IPhoneHardware() {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      className="iphone-hardware"
      viewBox="-4 -2 308 632"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${id}-edge`}
          x1="0"
          y1="0"
          x2="300"
          y2="628"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d5d2c9" />
          <stop offset=".12" stopColor="#77766f" />
          <stop offset=".3" stopColor="#b2b0a8" />
          <stop offset=".51" stopColor="#4e504e" />
          <stop offset=".76" stopColor="#99998f" />
          <stop offset="1" stopColor="#d6d4ca" />
        </linearGradient>
        <linearGradient
          id={`${id}-bevel`}
          x1="0"
          y1="314"
          x2="300"
          y2="314"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#d4d2c8" />
          <stop offset=".018" stopColor="#656762" />
          <stop offset=".04" stopColor="#262927" />
          <stop offset=".96" stopColor="#1b1e1c" />
          <stop offset=".982" stopColor="#a5a69c" />
          <stop offset="1" stopColor="#4d504c" />
        </linearGradient>
        <linearGradient
          id={`${id}-button`}
          x1="-3"
          y1="0"
          x2="3"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#454946" />
          <stop offset=".5" stopColor="#c3c2b7" />
          <stop offset="1" stopColor="#535750" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id}-button)`} stroke="#1b211e" strokeWidth=".5">
        <rect x="-2.8" y="91" width="4" height="23" rx="1.7" />
        <rect x="-2.8" y="140" width="4" height="43" rx="1.7" />
        <rect x="-2.8" y="196" width="4" height="43" rx="1.7" />
        <rect x="298.8" y="152" width="4" height="71" rx="1.7" />
        <rect x="299" y="363" width="3" height="37" rx="1.4" />
      </g>
      <path
        fill={`url(#${id}-edge)`}
        fillRule="evenodd"
        d="M48 0H252Q300 0 300 48V580Q300 628 252 628H48Q0 628 0 580V48Q0 0 48 0ZM48 5Q5 5 5 48V580Q5 623 48 623H252Q295 623 295 580V48Q295 5 252 5Z"
      />
      <rect
        x="2.2"
        y="2.2"
        width="295.6"
        height="623.6"
        rx="46"
        stroke={`url(#${id}-bevel)`}
        strokeWidth="3.3"
      />
      <rect
        x="6.3"
        y="6.3"
        width="287.4"
        height="615.4"
        rx="42"
        stroke="#050707"
        strokeWidth="8.5"
      />
      <rect
        x="10.7"
        y="11.4"
        width="278.6"
        height="605.2"
        rx="37.5"
        stroke="#d3dcda"
        strokeOpacity=".17"
        strokeWidth=".65"
      />
      <path
        d="M1 76H4M296 76H299M1 552H4M296 552H299"
        stroke="#222823"
        strokeWidth="2"
      />
      <path
        d="M28 8Q38 3 53 3H246M2 120V480"
        stroke="#f4f2e9"
        strokeOpacity=".45"
        strokeWidth=".6"
      />
    </svg>
  );
}
