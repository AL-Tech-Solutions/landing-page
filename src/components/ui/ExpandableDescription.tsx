"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useId, useState } from "react";
import { useReduceEffects } from "@/components/providers/ReduceEffectsProvider";
import {
	softSpringTransition as springTransition,
	instantTransition,
} from "@/lib/animations";
import {
	getAdditionalListItems,
	getAdditionalPlainHtml,
	truncateListHtml,
	truncatePlainText,
} from "@/lib/truncate-description";

interface ExpandableDescriptionProps {
	html: string;
	maxBullets?: number;
	maxChars?: number;
	className?: string;
}

export function ExpandableDescription({
	html,
	maxBullets = 4,
	maxChars = 300,
	className = "",
}: ExpandableDescriptionProps) {
	const [isOpen, setIsOpen] = useState(false);
	const prefersReducedMotion = useReducedMotion();
	const { reduceEffects } = useReduceEffects();
	const skipAnimations = reduceEffects || prefersReducedMotion;
	const contentId = useId();
	const triggerId = useId();

	const isList = /<ul>[\s\S]*<\/ul>/.test(html);
	const { truncated, needsExpand } = isList
		? truncateListHtml(html, maxBullets)
		: truncatePlainText(html, maxChars);

	const additionalListItems = isList
		? getAdditionalListItems(html, maxBullets)
		: [];
	const additionalPlainHtml = !isList
		? getAdditionalPlainHtml(html, maxChars)
		: null;
	const hasAdditional =
		additionalListItems.length > 0 || additionalPlainHtml !== null;

	if (!html.trim()) return null;

	const proseClass =
		"prose prose-sm dark:prose-invert max-w-none text-muted [&_ul]:list-disc [&_ul]:pl-6 [&_li]:mb-1 [&_a]:text-accent [&_a]:underline [&_a]:transition-colors hover:[&_a]:text-accent-dark dark:hover:[&_a]:text-accent-light";

	return (
		<div className={className}>
			<div id={contentId}>
				<div
					className={proseClass}
					dangerouslySetInnerHTML={{ __html: truncated }}
				/>
				<AnimatePresence initial={false}>
					{needsExpand && hasAdditional && isOpen && (
						<motion.div
							id={`${contentId}-additional`}
							initial={skipAnimations ? false : { height: 0, opacity: 0 }}
							animate={{
								height: "auto",
								opacity: 1,
								transition: skipAnimations
									? instantTransition
									: {
											height: springTransition,
											opacity: { duration: 0.35 },
										},
							}}
							exit={
								skipAnimations
									? { height: 0, opacity: 0, transition: instantTransition }
									: {
											height: 0,
											opacity: 0,
											transition: {
												height: { ...springTransition, stiffness: 350 },
												opacity: { duration: 0.25 },
											},
										}
							}
							className="overflow-hidden"
						>
							{isList ? (
								<div className={proseClass}>
									<motion.ul
										className="mt-0 list-disc pl-6 [&_li]:mb-1"
										initial="hidden"
										animate="visible"
										variants={{
											visible: {
												transition: skipAnimations
													? {}
													: {
															staggerChildren: 0.065,
															delayChildren: 0.12,
														},
											},
											hidden: {},
										}}
									>
										{additionalListItems.map((itemHtml, index) => (
											<motion.li
												key={`${itemHtml}-${index}`}
												className="mb-1"
												variants={{
													visible: {
														opacity: 1,
														scale: 1,
														y: 0,
													},
													hidden: skipAnimations
														? { opacity: 1, scale: 1, y: 0 }
														: {
																opacity: 0,
																scale: 0.85,
																y: 4,
															},
												}}
												transition={
													skipAnimations ? instantTransition : springTransition
												}
												dangerouslySetInnerHTML={{ __html: itemHtml }}
											/>
										))}
									</motion.ul>
								</div>
							) : (
								<motion.div
									className={proseClass}
									initial={skipAnimations ? false : { opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={
										skipAnimations ? instantTransition : { duration: 0.35 }
									}
									dangerouslySetInnerHTML={{
										__html: additionalPlainHtml ?? "",
									}}
								/>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
			<AnimatePresence initial={false}>
				{needsExpand && (
					<motion.div
						initial={false}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="mt-2"
					>
						<button
							type="button"
							onClick={() => setIsOpen(!isOpen)}
							aria-expanded={isOpen}
							aria-controls={contentId}
							aria-label={isOpen ? "Show less" : "Show more"}
							id={triggerId}
							className="group flex min-h-[44px] min-w-[44px] cursor-pointer items-center gap-2 rounded-lg py-2 font-medium text-foreground transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
						>
							<span>{isOpen ? "Show less" : "Show more"}</span>
							<motion.span
								className="inline-block text-muted transition-colors group-hover:text-accent"
								animate={{ rotate: isOpen ? 180 : 0 }}
								transition={
									skipAnimations ? instantTransition : springTransition
								}
								aria-hidden
							>
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									aria-hidden
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</motion.span>
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
