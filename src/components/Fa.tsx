/**
 * Font Awesome Pro アイコンコンポーネント
 * style: "solid" | "regular" | "light" | "thin" | "brands"
 */
interface FaProps {
  icon: string;
  variant?: "solid" | "regular" | "light" | "thin" | "brands";
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

import React from "react";

export default function Fa({ icon, variant = "solid", size, className = "", style }: FaProps) {
  const prefix =
    variant === "brands" ? "fa-brands" :
    variant === "regular" ? "fa-regular" :
    variant === "light" ? "fa-light" :
    variant === "thin" ? "fa-thin" :
    "fa-solid";

  const inlineStyle: React.CSSProperties = {
    ...(size ? { fontSize: size } : {}),
    ...style,
  };

  return (
    <i
      className={`${prefix} fa-${icon} ${className}`}
      style={Object.keys(inlineStyle).length ? inlineStyle : undefined}
      aria-hidden="true"
    />
  );
}
