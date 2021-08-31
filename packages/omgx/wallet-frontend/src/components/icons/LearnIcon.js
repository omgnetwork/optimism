import * as React from "react"

function LearnIcon({ color }) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.666 17.242l.334.167.335-.167L22 14.415v7.174l-5.107 2.21a2.25 2.25 0 01-1.786 0L10 21.588V14.42l5.666 2.822z"
        stroke={color}
        strokeWidth={1.5}
      />
      <path
        d="M6.427 12.625L16 7.839l9.573 4.786L16 17.412l-9.573-4.787z"
        stroke={color}
        strokeWidth={1.5}
      />
      <path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        d="M25.75 12.75v3.5"
      />
    </svg>
  )
}

export default LearnIcon
