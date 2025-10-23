import { teamMembers } from "@/data/castData";
import TeamMemberCard from "./TeamMemberCard";

const TeamSection = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-card/20">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-heading text-center mb-4 tracking-wider text-foreground">
          Das Team
        </h2>
        <div className="divider-gold mb-16" />
        
        <div className="space-y-12">
          {teamMembers.map((member, index) => (
            <TeamMemberCard 
              key={member.id} 
              member={member} 
              reverse={index % 2 !== 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
