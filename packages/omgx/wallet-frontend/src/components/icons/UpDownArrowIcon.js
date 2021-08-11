import * as React from "react"

function SearchIcon({ color }) {
    return (
        <svg
            width="7"
            height="12"
            viewBox="0 0 7 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3.5 0.5L7 4.5H0L3.5 0.5Z"
                fill={color}
                fill-opacity="0.7"
            />
            <path
                d="M3.5 11.5L7 7.5H0L3.5 11.5Z"
                fill={color}
                fill-opacity="0.7"
            />
        </svg>
    )

}

export default SearchIcon
