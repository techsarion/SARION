export interface TeamMember {
  name: string;
  initials: string;
  title: string;
  bio: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Sara Siddiqui",
    initials: "SS",
    title: "Founder & CEO",
    bio: "Focused on building software that helps agencies operate more efficiently.",
  },
  {
    name: "Alia Siddiqui",
    initials: "AS",
    title: "Co-Founder & Marketing Officer",
    bio: "Leads marketing strategy and ensures Sarion reaches the agencies that need it most.",
  },
  {
    name: "Ubayy Salman",
    initials: "US",
    title: "Co-Founder & Managing Director",
    bio: "Oversees operations and keeps the business running smoothly day to day.",
  },
];
