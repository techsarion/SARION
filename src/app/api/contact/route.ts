import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { sendContactEmail } from "@/lib/email";
import { rateLimit, clientIpFromHeaders } from "@/lib/rate-limit";

// Contact form submissions are delivered to the Sarion inbox via Resend.
const bodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("A valid email is required").max(200),
  agency: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(5000),
});

export async function POST(req: NextRequest) {
  // Coarse abuse guard: 5 submissions per day per IP.
  const ip = clientIpFromHeaders(req.headers);
  const limit = await rateLimit(`contact:${ip}`, 5, 24 * 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many messages. Please try again later or email us directly." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) } },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid submission" },
      { status: 400 },
    );
  }

  const { name, email, agency, message } = parsed.data;

  try {
    await sendContactEmail({
      name,
      email,
      agency: agency || undefined,
      message,
    });
  } catch (err) {
    console.error("[contact] failed to send enquiry:", err);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again or email us directly." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
