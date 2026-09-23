import { AboutCard } from "./AboutCard";
import { HighlightsCard } from "./HighlightsCard";
import { SkillsCard } from "./SkillsCard";
import { CertificationsCard } from "./CertificationsCard";
import { EducationCard } from "./EducationCard";
import { ExperienceCard } from "./ExperienceCard";
import { ContactCard } from "./ContactCard";
import { WritingHomeSection } from "@/components/writing/WritingHomeSection";
import { getPublishedNotes } from "@/lib/writing";

export function BentoGrid() {
	const publishedNotes = getPublishedNotes();

	return (
		<div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
			<div className="flex flex-col gap-6">
				{/* About + Highlights - flex row, each 50%, same total width as Skills */}
				<section
					aria-label="About and highlights"
					className="flex w-full min-w-0 flex-col gap-6 md:flex-row md:items-stretch"
				>
					<div className="flex min-w-0 flex-1" id="about">
						<AboutCard />
					</div>
					<div className="flex min-w-0 flex-1">
						<HighlightsCard />
					</div>
				</section>

				{/* Skills - full width, identical to About+Highlights row above */}
				<section aria-label="Skills" className="flex w-full min-w-0">
					<SkillsCard />
				</section>

				{/* Certifications + Contact & Languages - equal height via grid */}
				<section
					aria-label="Certifications and contact"
					className="grid w-full min-w-0 grid-cols-1 gap-6 md:grid-cols-[2fr_1fr]"
				>
					<div className="flex min-h-0 min-w-0" id="certifications">
						<CertificationsCard />
					</div>
					<div className="flex min-h-0 min-w-0 flex-col" id="contact">
						<ContactCard />
					</div>
				</section>

				{/* Experience */}
				<section aria-label="Experience" className="w-full" id="experience">
					<ExperienceCard />
				</section>

				{/* Education */}
				<section aria-label="Education" className="w-full">
					<EducationCard />
				</section>

				{publishedNotes.length > 0 && (
					<section aria-label="Writing" className="w-full" id="writing">
						<WritingHomeSection notes={publishedNotes} />
					</section>
				)}
			</div>
		</div>
	);
}
