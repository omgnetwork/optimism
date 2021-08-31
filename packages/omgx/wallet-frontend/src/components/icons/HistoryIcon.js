import * as React from "react"

function HistoryIcon({ color }) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25 16a9 9 0 00-16.281-5.29m0 0h2.331m-2.331 0V8.35M7 16a9 9 0 0016.281 5.29m0 0H20.95m2.331 0v2.36"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 15.533a2.7 2.7 0 11-2.7 2.7h.9a1.8 1.8 0 101.8-1.8v-.9z"
        fill={color}
      />
      <path
        d="M16 16.434a2.7 2.7 0 112.7-2.7h-.895A1.806 1.806 0 1016 15.539v.895z"
        fill={color}
      />
      <rect
        x={15.491}
        y={10.133}
        width={1.018}
        height={1.8}
        rx={0.509}
        fill={color}
      />
      <rect
        x={15.448}
        y={20.033}
        width={1.104}
        height={1.8}
        rx={0.552}
        fill={color}
      />
    </svg>
  )
}

export default HistoryIcon
