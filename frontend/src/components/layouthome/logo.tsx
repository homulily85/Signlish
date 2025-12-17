import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import originLogo from "@/assets/logo.svg";
import darkLogo from "@/assets/logo-dark.svg";

type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      to="/"
      className={cn("flex items-center gap-2 px-5 py-4 font-bold", className)}
    >
      <img src={isDark ? darkLogo : originLogo} className="h-9 w-30" alt="logo" />
    </Link>
  );
}
