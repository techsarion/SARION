import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";

interface HeaderProps {
  user: {
    name: string;
    email: string;
  };
  role: string;
  showUpgrade: boolean;
}

export function Header({ user, role, showUpgrade }: HeaderProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-card/80 px-4 backdrop-blur lg:px-6">
      {/* Mobile nav — renders hamburger button + drawer, hidden on lg+ */}
      <MobileNav role={role} showUpgrade={showUpgrade} />

      {/* Spacer pushes controls to the right */}
      <div className="flex-1" />

      <ThemeToggle />
      <UserMenu name={user.name} email={user.email} initials={initials} />
    </header>
  );
}
