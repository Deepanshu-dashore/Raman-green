import React from "react";
import { Icon } from "@iconify/react";
import { motion, type HTMLMotionProps } from "framer-motion";
// import { useSelector } from "react-redux";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "view" | "edit" | "delete" | "submit" | "outline" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  icon?: string;
  hideIcon?: boolean;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  color?: string; // Custom color override
  hoverColor?: string; // Custom hover color override
  fullWidth?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  hideIcon=false,
  iconPosition = "left",
  isLoading = false,
  color: customColor,
  hoverColor: customHoverColor,
  fullWidth = false,
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) => {
  // const { color: themeColor, mode } = useSelector((state: any) => state.theme);
  const themeColor = undefined;
  const mode = "light";

  // Size mappings
  const sizeClasses = {
    xs: "px-2.5 py-1 text-[11px] gap-1.5",
    sm: "px-3.5 py-1.5 text-xs gap-2",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-7 py-3 text-base gap-2.5",
  };

  // Base styles
  const baseStyles = `
    inline-flex items-center justify-center font-bold transition-all duration-200 
    rounded-lg cursor-pointer transform active:scale-95 
    disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:grayscale-[0.5]
    ${fullWidth ? "w-full" : "w-fit"}
  `;

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return `text-white shadow-md hover:brightness-110`;
      case "secondary":
        return mode === "light" 
          ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
          : "bg-gray-800 text-gray-300 hover:bg-gray-700";
      case "danger":
      case "delete":
        return "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-200";
      case "view":
        return "bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm shadow-indigo-200";
      case "edit":
        return "bg-gray-800 text-white hover:bg-gray-900 shadow-sm shadow-gray-200";
      case "submit":
        return "text-white shadow-lg hover:shadow-xl";
      case "outline":
        return mode === "light"
          ? "border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          : "border-2 border-gray-700 text-gray-300 hover:bg-gray-800";
      case "ghost":
        return mode === "light"
          ? "text-gray-600 hover:bg-gray-100"
          : "text-gray-400 hover:bg-gray-800";
      default:
        return "";
    }
  };

  const getBackgroundStyle = () => {
    const style: any = {};
    
    if (customColor) {
      style.backgroundColor = customColor;
    } else if (variant === "primary" || variant === "submit") {
      style.backgroundColor = themeColor || "#3b82f6";
    }

    if (customHoverColor) {
      style["--hover-bg"] = customHoverColor;
    }

    return style;
  };

  const buttonIcon = () => {
    if (isLoading) return <Icon icon="mdi:loading" className="animate-spin w-[1.3em] h-[1.3em]" />;
    const iconToUse = icon || (variant === "view" ? "mage:box-3d-scan-fill" : variant === "edit" ? "lets-icons:edit-fill" : variant === "delete" ? "solar:trash-bin-minimalistic-bold" : null);
    if (iconToUse) return <Icon icon={iconToUse} className="w-[1.3em] h-[1.3em]" />;
    return null;
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      type={type}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles} 
        ${sizeClasses[size]} 
        ${getVariantStyles()} 
        ${customHoverColor ? "hover:!bg-[var(--hover-bg)]" : ""} 
        ${className}
      `}
      style={getBackgroundStyle()}
      {...props}
    >
      {!hideIcon && iconPosition === "left" && buttonIcon()}
      {children}
      {!hideIcon && iconPosition === "right" && buttonIcon()}
    </motion.button>
  );
};
