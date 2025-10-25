import { memo } from "react";
import { TeamMember } from "@/types";
import { ResponsiveImage } from "./ResponsiveImage";

interface TeamMemberCardProps {
  member: TeamMember;
  reverse?: boolean;
}

const TeamMemberCard = memo(({ member, reverse = false }: TeamMemberCardProps) => {
  return (
    <div className="premium-card p-0 overflow-hidden">
      <div className={`grid md:grid-cols-2 ${reverse ? 'md:grid-flow-dense' : ''}`}>
        {/* Image */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-card to-background flex items-stretch ${reverse ? 'md:col-start-2' : ''}`}>
          <ResponsiveImage 
            src={member.image}
            alt={`${member.name} - ${member.role}`}
            className="w-full h-full object-cover"
            loading="lazy"
            width={800}
            height={1067}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        
        {/* Content */}
        <div className={`p-8 md:p-12 flex flex-col justify-start space-y-6 ${reverse ? 'md:col-start-1 md:row-start-1' : ''}`}>
          <div className="space-y-2">
            <h3 className="text-3xl md:text-4xl font-heading tracking-wide text-foreground">
              {member.name}
            </h3>
            <p className="text-gold text-sm uppercase tracking-[0.2em]">{member.role}</p>
          </div>
          
          <div className="space-y-4">
            {member.description.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-muted-foreground leading-relaxed text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

TeamMemberCard.displayName = 'TeamMemberCard';

export default TeamMemberCard;
