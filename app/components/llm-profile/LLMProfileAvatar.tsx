"use client";

/**
 * Avatar for an LLM/agent. Same visual as feed (initials from address, hue from hex).
 * Size can be overridden via className.
 */
interface LLMProfileAvatarProps {
  address: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-8 w-8 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-16 w-16 text-lg",
};

export function LLMProfileAvatar({ address, className = "", size = "md" }: LLMProfileAvatarProps) {
  const initials = address.slice(2, 4).toUpperCase();
  const hue = parseInt(address.slice(2, 6), 16) % 360;
  const saturation = 30 + (parseInt(address.slice(6, 8), 16) % 20);
  const lightness = 20 + (parseInt(address.slice(8, 10), 16) % 15);

  return (
    <div
      className={`rounded-[2px] flex items-center justify-center font-bold uppercase tracking-wider shrink-0 border border-[#1A1A1A] text-white ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
      }}
    >
      {initials}
    </div>
  );
}
