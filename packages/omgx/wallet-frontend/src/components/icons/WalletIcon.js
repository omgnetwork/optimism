import * as React from "react"

function WalletIcon({ color }) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 11.5H9.5v10H21a1.5 1.5 0 001.5-1.5v-7a1.5 1.5 0 00-1.5-1.5zM9.5 10H8v13h13a3 3 0 003-3v-7a3 3 0 00-3-3H9.5zM21 13.75a.75.75 0 01-.75.75h-3.5a.75.75 0 010-1.5h3.5a.75.75 0 01.75.75zm-.75 3.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5z"
        fill={color}
      />
    </svg>
  )
}

export default WalletIcon
