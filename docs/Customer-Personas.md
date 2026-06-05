# Sarion — Customer Personas & Intelligence

## Phase 1: Customer Personas

### Persona 1 — "Marketing Maya," the Marketing Agency Owner

| Attribute | Detail |
|---|---|
| **Age range** | 32–45 |
| **Team size** | 4–12 (often a mix of FT + freelancers) |
| **Annual revenue** | $250K–$1.2M |
| **Current tools** | Monday.com or ClickUp for projects, HubSpot or a spreadsheet for leads, Slack, Google Workspace, QuickBooks/Stripe for invoicing, Loom |
| **Biggest frustrations** | Context lives in 6 tools; nobody knows the true status of a client; reporting to clients eats Friday afternoons; chasing unpaid invoices |
| **Purchase motivations** | Look professional to clients, stop tool-sprawl spend, free herself from "operations babysitting" so she can sell |
| **Objections** | "I already pay for ClickUp + HubSpot — do I really switch?"; migration pain; "will my team actually adopt it?" |
| **Decision process** | Self-serve trial → tests it on 1–2 live clients over a weekend → loops in ops lead → decides within 2–3 weeks |

### Persona 2 — "Dev-Shop Daniel," the Web Development Agency Owner

| Attribute | Detail |
|---|---|
| **Age range** | 28–42 |
| **Team size** | 3–15 |
| **Annual revenue** | $300K–$1.5M |
| **Current tools** | Jira/ClickUp/Trello, GitHub, Notion docs, Slack, Stripe, sometimes a half-built internal portal |
| **Biggest frustrations** | Clients email instead of using systems; scope creep with no paper trail; project status invisible to clients; billing milestones slip |
| **Purchase motivations** | A clean **client portal** so clients self-serve status/files; reduce "where are we?" emails; bill faster |
| **Objections** | "I could just build this myself" (dangerous — he can); needs it to not look generic; data export/ownership |
| **Decision process** | Technical evaluation, kicks the tires hard, reads docs, tries to break it. Buys if it saves him from building it. |

### Persona 3 — "SEO Sam," the SEO Agency Owner

| Attribute | Detail |
|---|---|
| **Age range** | 27–40 |
| **Team size** | 2–8 |
| **Annual revenue** | $120K–$600K |
| **Current tools** | Spreadsheets, ClickUp/Trello, Ahrefs/SEMrush, Looker Studio, Slack, PayPal/Stripe |
| **Biggest frustrations** | Retainer clients churn because they "don't see the value"; manual monthly reporting; recurring task management across many small clients |
| **Purchase motivations** | Demonstrate ongoing value to retain retainers; centralize recurring deliverables; reduce churn |
| **Objections** | Price sensitivity (smaller margins); "does it replace my reporting tool?" (it doesn't — manage this expectation) |
| **Decision process** | Cost-driven, fast trial, decides solo, low ceremony. Will leave just as fast if value isn't obvious in week 1. |

### Persona 4 — "Design Studio Dana," the Design/Branding Agency Owner

| Attribute | Detail |
|---|---|
| **Age range** | 30–45 |
| **Team size** | 2–10 |
| **Annual revenue** | $150K–$800K |
| **Current tools** | Notion, Trello, Figma, Dropbox/Drive, Slack, HoneyBook/Dubsado, Stripe |
| **Biggest frustrations** | Feedback/approvals scattered across email + Figma + Slack; version chaos; clients ghost on approvals; invoicing afterthought |
| **Purchase motivations** | Professional, branded client experience; organized approvals; getting paid on time |
| **Objections** | Aesthetics matter a lot ("is it ugly?"); already may use HoneyBook/Dubsado; switching cost |
| **Decision process** | Emotional + visual first impression, then practical. Brand polish of *your* product is part of the sale. |

### Persona 5 — "Consultant Chris," the Solo/Boutique Digital Consultant

| Attribute | Detail |
|---|---|
| **Age range** | 35–55 |
| **Team size** | 1–4 |
| **Annual revenue** | $100K–$400K |
| **Current tools** | Notion, Google Sheets, Calendly, Stripe, email |
| **Biggest frustrations** | Looks small/disorganized to enterprise clients; juggling everything alone; follow-ups slip; admin steals billable hours |
| **Purchase motivations** | Look bigger and more credible; one system to run the whole practice; reclaim time |
| **Objections** | "Is this overkill for just me?"; price vs. a free Notion setup |
| **Decision process** | Instant self-serve, decides alone in days, highly price- and simplicity-sensitive. |

**Cross-persona signal:** The two highest-intent, lowest-build personas are **Dev-Shop Daniel** (wants a client portal, will pay to avoid building it) and **Marketing Maya** (most acute tool-sprawl pain, biggest budget). Target these two for your first 10 customers.

---

## Phase 2: Pain Point Prioritization

Scored 1–10. **Priority Score = (Frequency + Severity + Willingness-to-Pay) / 3.**

| Problem | Frequency | Severity | Willingness to Pay | **Priority** |
|---|:---:|:---:|:---:|:---:|
| **Invoicing & getting paid** (manual invoices, unpaid tracking) | 9 | 9 | **10** | **9.3** |
| **Client management** (scattered info, lost comms history) | 10 | 8 | 8 | **8.7** |
| **Project visibility / status** (unclear status, missed deadlines) | 10 | 8 | 7 | **8.3** |
| **Client-facing portal** (clients can't self-serve, email overload) | 8 | 8 | 8 | **8.0** |
| **Follow-ups / lead management** (forgotten leads, missed deals) | 8 | 7 | 7 | **7.3** |
| **Team collaboration** (task confusion, accountability) | 8 | 6 | 5 | **6.3** |

### Top 3 problems Sarion should solve first

1. **Invoicing & getting paid** — highest willingness to pay because it's directly tied to *cash*. People pay fastest for things that get them paid faster.
2. **Centralized client management** — the core "one place for everything" promise; this is the wedge that justifies replacing the spreadsheet.
3. **Project visibility (with a client-facing view)** — collapses the #3 and #4 pains together; the client portal is your differentiator vs. generic PM tools.

> **Strategic note:** Invoicing scores highest on *willingness to pay* but is **not** the cheapest to build well (payments, taxes, edge cases). Pragmatic v1: build *client management + project visibility + a lightweight client portal* as the core, and ship **invoice creation + paid/unpaid status tracking** (manual mark-paid, no payment processing) to capture the cash-pain emotionally without a 3-week payments build.

---

## Phase 3: Customer Journey & Friction Points

| Stage | What's happening | **Friction points** | How Sarion wins |
|---|---|---|---|
| **Current situation** | Running the agency on Sheets + Trello + email + Stripe | Doesn't feel the pain as a single problem; "it's fine for now" | Marketing must *name the pain* ("Your agency runs on 6 tools and 0 of them talk") |
| **Problem awareness** | A late invoice, a churned client, or a dropped deliverable triggers "this is unsustainable" | Trigger is episodic, not constant — easy to forget by Monday | Content tied to trigger moments; "the Friday-report problem," "the unpaid-invoice problem" |
| **Solution research** | Googles "agency CRM," "client portal software," compares ClickUp/Monday/HubSpot | Overwhelm — incumbents are huge and generic; hard to tell what's *for agencies* | Crisp agency-specific positioning; comparison pages ("Sarion vs ClickUp for agencies") |
| **Trial signup** | Signs up, lands in empty product | **Empty-state death** — no data, no idea where to start; migration dread | Pre-loaded demo client + 60-second guided setup; CSV/sheet import of clients |
| **Activation (hidden but critical stage)** | First real use | Doesn't reach "aha" (first client added + first invoice sent + portal link shared) | Onboarding checklist forcing the 3 aha actions in <10 min |
| **Paying customer** | Trial ends, enters card | "Not sure it's worth $59 yet"; team hasn't adopted | Show time saved + a live client already using the portal = sunk-cost stickiness |
| **Long-term customer** | Daily driver | Churn if value invisible (esp. SEO Sam); feature gaps push power users back to ClickUp | Monthly "you saved X hours / collected $Y" value email; steady, agency-specific roadmap |

**The single biggest friction point is activation, not signup.** Most agency SaaS dies in the empty product. Your week-1 onboarding flow matters more than any feature.
