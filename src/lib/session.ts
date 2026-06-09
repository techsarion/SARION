import { headers } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";

/**
 * Resolve the current Better Auth session on the server. Cached per request so
 * multiple calls within one render don't re-hit the database.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});
