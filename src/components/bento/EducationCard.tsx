"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { ExpandableDescription } from "@/components/ui/ExpandableDescription";
import { CategorizedTagList } from "@/components/ui/CategorizedTagList";
import { educations } from "@/data/education";
import { getIconForDiscipline } from "@/data/skillIcons";
import { viewerHrefForPdf } from "@/data/viewer-documents";

export function EducationCard() {
	return (
		<GlassCard>
			<h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">
				Education
			</h2>
			<div className="space-y-6">
				{educations.map((edu) => {
					const diplomaHref = viewerHrefForPdf(edu.diploma_pdf);
					const supplementHref = viewerHrefForPdf(edu.diploma_supplement_pdf);
					return (
						<article
							key={edu.university_title + edu.specialty_title}
							className="rounded-xl border border-border bg-surface p-6"
						>
							<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
								<h3 className="font-semibold text-foreground">
									{edu.specialty_title}
								</h3>
								<span className="rounded-full bg-accent/25 px-2 py-0.5 text-xs text-accent-dark dark:bg-accent/90 dark:text-white">
									{edu.badge ?? "Graduated"}
								</span>
							</div>
							<div className="mb-2 flex items-center gap-2">
								{edu.university_logo && (
									<img
										src={`/images/education/${edu.university_logo}`}
										alt={`${edu.university_title} logo`}
										width={40}
										height={40}
										loading="lazy"
										className="shrink-0 rounded-lg"
									/>
								)}
								{edu.university_link ? (
									<a
										href={edu.university_link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-muted hover:text-accent"
									>
										{edu.university_title}
									</a>
								) : (
									<span className="text-muted">{edu.university_title}</span>
								)}
							</div>
							<p className="mb-4 text-sm text-muted">{edu.dates}</p>
							{(edu.diploma_pdf || edu.diploma_supplement_pdf) && (
								<div className="mb-4 flex gap-4">
									{edu.diploma_pdf &&
										(diplomaHref ? (
											<Link
												href={diplomaHref}
												className="text-sm text-accent hover:underline"
											>
												View Diploma
											</Link>
										) : (
											<a
												href={edu.diploma_pdf}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-accent hover:underline"
											>
												View Diploma
											</a>
										))}
									{edu.diploma_supplement_pdf &&
										(supplementHref ? (
											<Link
												href={supplementHref}
												className="text-sm text-accent hover:underline"
											>
												View Diploma Supplement
											</Link>
										) : (
											<a
												href={edu.diploma_supplement_pdf}
												target="_blank"
												rel="noopener noreferrer"
												className="text-sm text-accent hover:underline"
											>
												View Diploma Supplement
											</a>
										))}
								</div>
							)}
							<ExpandableDescription html={edu.description} />
							{edu.disciplines && (
								<CategorizedTagList
									title="Courses & Disciplines"
									items={[edu.disciplines]}
									getIcon={getIconForDiscipline}
								/>
							)}
						</article>
					);
				})}
			</div>
		</GlassCard>
	);
}
