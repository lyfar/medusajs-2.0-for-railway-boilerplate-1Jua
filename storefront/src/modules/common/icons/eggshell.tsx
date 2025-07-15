import React from "react"
import { IconProps } from "types/icon"

const EggShell: React.FC<IconProps> = ({ size = "20", color = "currentColor", ...attributes }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 6C11.1046 6 12 6.89543 12 8C12 9.10457 11.1046 10 10 10C8.89543 10 8 9.10457 8 8C8 6.89543 8.89543 6 10 6Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default EggShell 