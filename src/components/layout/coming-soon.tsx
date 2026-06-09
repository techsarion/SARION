import { Construction } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Construction className="h-6 w-6" />
        </span>
        <p className="text-lg font-semibold">{feature} is coming soon</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This area is part of the Sarion roadmap. The Day 2 foundation ships
          the dashboard, auth, and design system first.
        </p>
      </CardContent>
    </Card>
  );
}
