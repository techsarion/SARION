/**
 * Demo seed — realistic multi-tenant data for screenshots & demos.
 *
 * Creates 3 agencies, each with an owner + 5–10 login-able team members, plus
 * clients, projects, invoices (paid/unpaid/overdue), tasks, portal comments,
 * and an activity feed.
 *
 * Login-able users: passwords are hashed with Better Auth's OWN hasher
 * (auth.$context.password.hash) and stored as a `credential` Account, so every
 * seeded user can sign in at /login with the shared demo password below.
 *
 * Idempotent: re-running wipes and recreates the demo agencies (matched by the
 * owner emails) so the data set stays clean. Run with: npm run db:seed
 */
import { PrismaClient, type Prisma } from "@prisma/client";

import { auth } from "../src/lib/auth";

const prisma = new PrismaClient();

// Everyone shares this password for easy demoing. Meets the 8-char minimum.
const DEMO_PASSWORD = "Sarion!Demo123";

// ---------------------------------------------------------------------------
// Deterministic helpers (no Math.random → reproducible seeds)
// ---------------------------------------------------------------------------
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d;
};
const pick = <T>(arr: T[], i: number) => arr[i % arr.length];
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 20);

// ---------------------------------------------------------------------------
// Demo content pools
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Sara", "Daniel", "Amara", "Liam", "Noah", "Priya", "Marcus", "Elena",
  "Omar", "Hana", "Diego", "Aisha", "Tom", "Mei", "Jack", "Zara", "Leo",
  "Nadia", "Ravi", "Chloe",
];
const LAST_NAMES = [
  "Khan", "Reyes", "Okafor", "Bennett", "Walsh", "Patel", "Cole", "Ferro",
  "Haddad", "Sato", "Marin", "Yusuf", "Hughes", "Lin", "Doyle", "Novak",
];

const CLIENT_POOL = [
  { name: "Acme Marketing", company: "Acme Marketing", email: "hello@acme.com" },
  { name: "Brightside Co.", company: "Brightside Co.", email: "team@brightside.co" },
  { name: "Meridian Health", company: "Meridian Health", email: "ops@meridianhealth.com" },
  { name: "Orbit Labs", company: "Orbit Labs", email: "founders@orbitlabs.io" },
  { name: "Cedar & Co.", company: "Cedar & Co.", email: "hi@cedarandco.com" },
  { name: "Northwind Retail", company: "Northwind Retail", email: "contact@northwind.shop" },
];

const PROJECT_POOL: { name: string; status: Prisma.ProjectCreateInput["status"]; due: number }[] = [
  { name: "Website Redesign", status: "ACTIVE", due: 18 },
  { name: "SEO Campaign", status: "ACTIVE", due: 33 },
  { name: "Brand Refresh", status: "PLANNED", due: 60 },
  { name: "Q3 Retainer", status: "ON_HOLD", due: 45 },
  { name: "Launch Landing Page", status: "COMPLETED", due: -10 },
  { name: "Social Content Calendar", status: "ACTIVE", due: 7 },
];

const TASK_POOL = [
  "Kickoff call with client",
  "Draft wireframes",
  "Design review",
  "Copywriting pass",
  "Build out pages",
  "QA + accessibility check",
  "Client approval",
  "Deploy to production",
];

const PORTAL_COMMENTS = [
  "Loving the new direction — the homepage really pops.",
  "Can we tweak the hero copy slightly? Sent notes via email.",
  "Approved! Great work this sprint.",
  "When do you expect the next milestone to land?",
];

// ---------------------------------------------------------------------------
// Agencies to create
// ---------------------------------------------------------------------------
const AGENCIES = [
  { name: "Northbeam Studio", domain: "northbeam.studio", teamSize: 8, logoUrl: null },
  { name: "Lumen Creative", domain: "lumencreative.co", teamSize: 6, logoUrl: null },
  { name: "Pixelforge Agency", domain: "pixelforge.agency", teamSize: 10, logoUrl: null },
];

// ---------------------------------------------------------------------------
async function createUser(opts: {
  agencyId: string;
  name: string;
  email: string;
  role: "owner" | "member";
  passwordHash: string;
  createdAt: Date;
}) {
  const user = await prisma.user.create({
    data: {
      agencyId: opts.agencyId,
      name: opts.name,
      email: opts.email,
      emailVerified: true,
      role: opts.role,
      createdAt: opts.createdAt,
    },
  });
  // Better Auth email/password credential row.
  await prisma.account.create({
    data: {
      userId: user.id,
      accountId: user.id,
      providerId: "credential",
      password: opts.passwordHash,
    },
  });
  return user;
}

async function main() {
  // Hash the demo password with Better Auth's own hasher so /login works.
  const ctx = await auth.$context;
  const passwordHash = await ctx.password.hash(DEMO_PASSWORD);

  const ownerEmails = AGENCIES.map((a) => `owner@${a.domain}`);

  // --- Clean previous demo agencies (cascade deletes everything under them) --
  const existingOwners = await prisma.user.findMany({
    where: { email: { in: ownerEmails } },
    select: { agencyId: true },
  });
  if (existingOwners.length) {
    await prisma.agency.deleteMany({
      where: { id: { in: existingOwners.map((u) => u.agencyId) } },
    });
    console.log(`Removed ${existingOwners.length} existing demo agencies.`);
  }

  let globalIdx = 0;

  for (const [aIdx, def] of AGENCIES.entries()) {
    const agency = await prisma.agency.create({
      data: {
        name: def.name,
        logoUrl: def.logoUrl,
        plan: pick(["starter", "growth", "agency"], aIdx),
        subscriptionStatus: aIdx === 0 ? "active" : "trialing",
        seeded: true,
      },
    });

    // --- Owner + team (5–10 members total) ---
    const teamCount = def.teamSize;
    for (let m = 0; m < teamCount; m++) {
      const first = pick(FIRST_NAMES, globalIdx);
      const last = pick(LAST_NAMES, globalIdx + aIdx);
      const isOwner = m === 0;
      const email = isOwner
        ? `owner@${def.domain}`
        : `${slug(first)}.${slug(last)}${globalIdx}@${def.domain}`;
      await createUser({
        agencyId: agency.id,
        name: `${first} ${last}`,
        email,
        role: isOwner ? "owner" : "member",
        passwordHash,
        createdAt: daysFromNow(-90 + m * 3),
      });
      globalIdx++;
    }

    await prisma.activity.create({
      data: {
        agencyId: agency.id,
        type: "Team Member Joined",
        description: `${teamCount} teammates are active in ${def.name}.`,
        createdAt: daysFromNow(-80),
      },
    });

    // --- Clients (4–6 per agency) ---
    const clientCount = 4 + (aIdx % 3); // 4,5,6
    let invoiceSeq = 1;

    for (let c = 0; c < clientCount; c++) {
      const cdata = pick(CLIENT_POOL, c + aIdx);
      const client = await prisma.client.create({
        data: {
          agencyId: agency.id,
          name: cdata.name,
          company: cdata.company,
          email: cdata.email,
          phone: `+1 (555) 0${aIdx}${c}-12${c}${aIdx}`,
          createdAt: daysFromNow(-70 + c * 4),
        },
      });
      await prisma.activity.create({
        data: {
          agencyId: agency.id,
          clientId: client.id,
          type: "Client Created",
          description: `Client "${client.name}" was created.`,
          createdAt: daysFromNow(-70 + c * 4),
        },
      });

      // --- Projects (1–2 per client) ---
      const projCount = 1 + ((c + aIdx) % 2);
      for (let p = 0; p < projCount; p++) {
        const pdata = pick(PROJECT_POOL, c + p + aIdx);
        const project = await prisma.project.create({
          data: {
            agencyId: agency.id,
            clientId: client.id,
            name: pdata.name,
            description: `${pdata.name} for ${client.company}.`,
            status: pdata.status,
            startDate: daysFromNow(-30),
            dueDate: daysFromNow(pdata.due),
            createdAt: daysFromNow(-30 + p),
          },
        });

        // Tasks
        await prisma.task.createMany({
          data: TASK_POOL.slice(0, 4 + (p % 3)).map((title, ti) => ({
            agencyId: agency.id,
            projectId: project.id,
            title,
            isDone: ti < 2,
            sortOrder: ti,
          })),
        });

        // Portal comments on the first project of each client
        if (p === 0) {
          await prisma.portalComment.create({
            data: {
              agencyId: agency.id,
              projectId: project.id,
              author: client.name,
              message: pick(PORTAL_COMMENTS, c),
              createdAt: daysFromNow(-3),
            },
          });
        }

        await prisma.activity.create({
          data: {
            agencyId: agency.id,
            clientId: client.id,
            projectId: project.id,
            type: "Project Created",
            description: `Project "${project.name}" was created.`,
            createdAt: daysFromNow(-29 + p),
          },
        });
      }

      // --- Invoices (1–2 per client: paid / unpaid / overdue mix) ---
      const invCount = 1 + (c % 2);
      for (let n = 0; n < invCount; n++) {
        // status cycle: paid, unpaid, overdue
        const statusCycle: Prisma.InvoiceCreateInput["status"][] = [
          "paid",
          "unpaid",
          "overdue",
        ];
        const status = pick(statusCycle, c + n);
        const items = [
          { description: "Design & UX", qty: 1, unitPrice: 2400 },
          { description: "Development", qty: 1, unitPrice: 1800 },
          { description: "Project management", qty: 3, unitPrice: 150 },
        ].slice(0, 2 + (n % 2));
        const total = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
        const number = `INV-${String(invoiceSeq).padStart(4, "0")}`;
        invoiceSeq++;

        await prisma.invoice.create({
          data: {
            agencyId: agency.id,
            clientId: client.id,
            number,
            status,
            total,
            issueDate: daysFromNow(-20 - n * 5),
            dueDate:
              status === "overdue" ? daysFromNow(-5) : daysFromNow(15 - n * 5),
            createdAt: daysFromNow(-20 - n * 5),
            items: {
              create: items.map((it) => ({
                agencyId: agency.id,
                description: it.description,
                qty: it.qty,
                unitPrice: it.unitPrice,
                lineTotal: it.qty * it.unitPrice,
              })),
            },
          },
        });
        await prisma.activity.create({
          data: {
            agencyId: agency.id,
            clientId: client.id,
            type: status === "paid" ? "Invoice Paid" : "Invoice Created",
            description: `Invoice ${number} ($${total.toLocaleString()}) — ${status}.`,
            createdAt: daysFromNow(-20 - n * 5),
          },
        });
      }
    }

    // Persist the next invoice number so app-created invoices continue the run.
    await prisma.agency.update({
      where: { id: agency.id },
      data: { invoiceSequence: invoiceSeq },
    });

    console.log(
      `✓ ${def.name}: ${teamCount} users, ${clientCount} clients — owner@${def.domain}`,
    );
  }

  console.log(`\nAll demo users log in with password: ${DEMO_PASSWORD}`);
  console.log("Owners:", ownerEmails.join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
