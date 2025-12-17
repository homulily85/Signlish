import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandIcon, SearchIcon, icons } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const SEARCH_ITEMS = [
  {
    group: "Menu",
    items: [
      { title: "Dashboard", href: "/dashboard/default", icon: "LayoutDashboard" },
      { title: "My Courses", href: "/dashboard/pages/courses", icon: "BookOpen" },
      { title: "Practice", href: "/dashboard/pages/practice", icon: "Dumbbell" },
      { title: "Translate", href: "/dashboard/pages/translate", icon: "Globe" },
      { title: "Dictionary", href: "/dictionary", icon: "NotebookText" },
    ],
  },
];

export default function Search() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search..."
          className="pl-10"
          readOnly
          onFocus={() => setOpen(true)}
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {SEARCH_ITEMS.map((group) => (
            <CommandGroup key={group.group} heading={group.group}>
              {group.items.map((item) => {
                // @ts-expect-error
                const IconComp = icons[item.icon];
                return (
                  <CommandItem
                    key={item.title}
                    onSelect={() => {
                      setOpen(false);
                      navigate(item.href);
                    }}
                  >
                    <IconComp className="mr-2 h-4 w-4" />
                    {item.title}
                  </CommandItem>
                );
              })}
              <CommandSeparator />
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
