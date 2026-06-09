import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/layout/user-menu";

interface HeaderProps {
  user: {
    name: string;
    email: string;
  };
}

export function Header({ user }: HeaderProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur lg:px-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search clients, projects, invoices..."
          className="pl-9"
          aria-label="Search"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <UserMenu name={user.name} email={user.email} initials={initials} />
      </div>
    </header>
  );
}
