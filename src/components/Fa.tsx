/**
 * Font Awesome Pro アイコンコンポーネント
 * style: "solid" | "regular" | "light" | "thin" | "brands"
 */
interface FaProps {
  icon: string;
  variant?: "solid" | "regular" | "light" | "thin" | "brands";
  sharp?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

import React from "react";

export default function Fa({ icon, variant = "solid", sharp = false, size, className = "", style }: FaProps) {
  const variantClass =
    variant === "brands" ? "fa-brands" :
    variant === "regular" ? "fa-regular" :
    variant === "light" ? "fa-light" :
    variant === "thin" ? "fa-thin" :
    "fa-solid";

  const prefix = sharp ? `fa-sharp ${variantClass}` : variantClass;

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
