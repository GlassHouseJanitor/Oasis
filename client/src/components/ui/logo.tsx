import { HTMLAttributes } from "react";

// Import the logo
import LogoImage from "@/assets/logo.png";

interface LogoProps extends HTMLAttributes<HTMLImageElement> {
  className?: string;
  isWhite?: boolean;
}

export function Logo({ className = "", isWhite = false, ...props }: LogoProps) {
  // The logo is already white on a transparent background, so we don't need
  // to handle the isWhite prop specifically for the image
  return (
    <img 
      src={LogoImage}
      alt="Oasis Homes Logo"
      className={className}
      {...props}
    />
  );
}

export default Logo;
