import { TeamMember } from "@/types";

interface TeamMemberCardProps {
  member: TeamMember;
  reverse?: boolean;
}

const TeamMemberCard = ({ member, reverse = false }: TeamMemberCardProps) => {
  return (
    <article className="premium-card p-0 overflow-hidden">
      <div className={`grid md:grid-cols-2 gap-0 ${reverse ? 'md:grid-flow-dense' : ''}`}>
        {/* Image */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-card to-background flex items-center justify-center ${reverse ? 'md:col-start-2' : ''}`}>
          <img 
            src={member.image}
            alt={`${member.name} - ${member.role}`}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
        
        {/* Content */}
        <div className={`p-8 md:p-12 flex flex-col justify-center space-y-6 ${reverse ? 'md:col-start-1 md:row-start-1' : ''}`}>
          <div className="space-y-2">
            <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground">
              {member.name}
            </h3>
            <p className="text-gold text-sm uppercase tracking-[0.2em]">{member.role}</p>
          </div>
          
          <p className="text-muted-foreground leading-relaxed text-lg">
            {member.description}
          </p>
        </div>
      </div>
    </article>
  );
};

export default TeamMemberCard;
