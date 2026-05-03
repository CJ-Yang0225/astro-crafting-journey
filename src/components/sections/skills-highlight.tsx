import { motion } from "motion/react";
import type { SkillCategory } from "@/config/landing";

interface Props {
  skillGroups: SkillCategory[];
}

export default function SkillsHighlight({ skillGroups }: Props) {
  if (skillGroups.length === 0) return null;

  return (
    <section className="border-t border-border py-24 bg-background-200">
      <div className="container">
        <div className="mb-12">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Tech Stack
          </p>
          <h2 className="font-heading text-3xl leading-tight tracking-tight text-foreground sm:text-4xl">
            Skills & Tools
          </h2>
        </div>

        <div className="space-y-10">
          {skillGroups.map((group, groupIndex) => (
            <div key={group.category}>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: groupIndex * 0.12,
                }}
                className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
              >
                {group.label}
              </motion.h3>

              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill, skillIndex) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-20px" }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                      delay: groupIndex * 0.12 + skillIndex * 0.05,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="inline-flex cursor-default items-center gap-1.5 rounded border border-border bg-card px-3 py-1.5 font-sans text-sm font-medium text-card-foreground transition-colors hover:border-muted-foreground/30 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                      {skill.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
