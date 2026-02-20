import { memo } from "react";
import { teamMembers } from "@/data/castData";
import TeamMemberCard from "./TeamMemberCard";

const TeamSection = memo(() => {
  return (
    <section 
      className="py-24 px-6 bg-gradient-to-b from-card/20 to-background"
      aria-labelledby="team-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-24">
          <p className="text-gold text-sm uppercase tracking-[0.3em] mb-4 font-medium">Die Produktion</p>
          <h2 id="team-heading" className="text-4xl sm:text-6xl md:text-8xl font-heading tracking-wider text-foreground uppercase">
            Produktion
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {teamMembers.map((member) => (
            <TeamMemberCard 
              key={member.id} 
              member={member}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

TeamSection.displayName = 'TeamSection';

export default TeamSection;
