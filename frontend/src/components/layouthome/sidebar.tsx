import {ScrollArea} from "@/components/ui/scroll-area";
import Anchor from "../anchor";
import Logo from "./logo";
import Icon from "../icon";
import {Badge} from "../ui/badge";

type SidebarNavLinkProps = {
  item: {
    title: string;
    href: string;
    icon?: string;
    isComing?: boolean;
  };
};

export const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({item}: SidebarNavLinkProps) => {
  return (
      <Anchor
          href={item.href}
          key={item.title + item.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-muted"
          activeClassName="!bg-primary text-primary-foreground">
        {item.icon && <Icon name={item.icon} className="h-4 w-4"/>}
        {item.title}
        {item.isComing && (
            <Badge className="ms-auto opacity-50" variant="outline">
              Coming
            </Badge>
        )}
      </Anchor>
  );
};

export default function Sidebar() {
  return (
      <div className="hidden h-screen w-[--sidebar-width] lg:block border-r">
        <ScrollArea className="h-full w-full bg-background px-4">
          <Logo/>
          <div className="px-2 py-4 font-medium">Menu</div>

          <div className="space-y-1">

            <SidebarNavLink
                item={{
                  title: "Dashboard",
                  href: "/dashboard",
                  icon: "LayoutDashboard",
                }}
            />

            <SidebarNavLink
                item={{
                  title: "My Courses",
                  href: "/dashboard/pages/courses",
                  icon: "BookOpen",
                }}
            />

            <SidebarNavLink
                item={{
                  title: "Practice",
                  href: "/dashboard/pages/practice",
                  icon: "Dumbbell",
                }}
            />

            <SidebarNavLink
                item={{
                  title: "Translate",
                  href: "/dashboard/pages/translate",
                  icon: "Globe",
                }}
            />

            <SidebarNavLink
                item={{
                  title: "Dictionary",
                  href: "/dashboard/pages/dictionary",
                  icon: "NotebookText",
                }}
            />
          </div>
        </ScrollArea>
      </div>
  );
}
