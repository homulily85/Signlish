import { useState, useEffect } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Logo from "./logo";
import Search from "./search";
import Icon from "../icon";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();

    const savedTheme = localStorage.getItem(
      "vite-ui-theme"
    ) as "light" | "dark" | "system" | null;

    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const setThemeMode = (newTheme: "light" | "dark" | "system") => {
    const html = document.documentElement;
    localStorage.setItem("vite-ui-theme", newTheme);
    setTheme(newTheme);

    if (newTheme === "system") {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      if (systemDark) {
        html.classList.add("dark");
        setIsDark(true);
      } else {
        html.classList.remove("dark");
        setIsDark(false);
      }
    } else if (newTheme === "dark") {
      html.classList.add("dark");
      setIsDark(true);
    } else {
      html.classList.remove("dark");
      setIsDark(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left">
          <Logo />

          <nav className="mt-4 space-y-1">
            {[
              { to: "/dashboard", label: "Dashboard", icon: "PieChart" },
              { to: "/courses", label: "My Courses", icon: "Book" },
              { to: "/practice", label: "Practice", icon: "Dumbbell" },
              { to: "/translate", label: "Translate", icon: "Globe" },
              { to: "/dictionary", label: "Dictionary", icon: "NotebookText" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted"
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setThemeMode("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setThemeMode("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setThemeMode("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <img
              src="/images/avatars/1.png"
              className="h-10 w-10 cursor-pointer rounded-full"
              alt="avatar"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
