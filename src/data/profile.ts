export interface Highlight {
	number: string;
	label: string;
}

export interface SkillCategory {
	title: string;
	icon: string;
	skills: string[];
	primary?: string[];
}

export interface SocialLink {
	name: string;
	url: string;
	icon: string;
	ariaLabel: string;
}

export interface Language {
	flag: string;
	name: string;
	level: string;
	native?: boolean;
}

export const profile = {
	name: "Andrii Lytvynenko",
	title: "Senior DevOps & Cloud Engineer",
	headline: "Cloud infrastructure that costs less and stays up.",
	subtitle:
		"Senior DevOps & Cloud Engineer — AWS & Kubernetes, B2B from the EU. Enterprise work via Luxoft (JPMorgan Chase / Mercedes-Benz): up to 50% cloud cost reduction, ~70% fewer incidents.",
	availability: "Available for Q2 2027 Projects",
	ctaPrimary: "Let’s talk",
	ctaSecondary: "Download resume",
	trustLine: "B2B · GDPR · Poland (EU)",
	contactDisclaimerBefore:
		"B2B inquiries only. I’ll use your message to reply and talk through a possible engagement (pre-contract). Details in the ",
	contactDisclaimerLink: "Privacy Policy",
	contactDisclaimerAfter: ". No obligation until we agree scope in writing.",
	profileImage: "/images/tm-easy-profile.webp",
	email: "a.v.lytvynenko2004@gmail.com",
	location: "Częstochowa, Poland (EU)",
	resumeUrl: "/pdf/resume.pdf",
	bio: {
		intro:
			"I'm a Senior DevOps & Cloud Engineer with 5+ years of experience designing, implementing, and optimizing cloud infrastructure for enterprise clients. I specialize in building scalable, secure, and cost-efficient solutions using AWS, Kubernetes, and Infrastructure as Code practices.",
		experience:
			"My experience includes enterprise client work via Luxoft — notably JPMorgan Chase and Mercedes-Benz — delivering infrastructure migrations, cutting cloud costs by up to 50%, and architecting high-availability systems that handle hundreds of thousands of requests per second.",
		passion:
			"I'm passionate about automation, continuous improvement, and mentoring teams. Whether it's a complex Terraform migration or using GenAI to speed up log analysis, I focus on delivering measurable business value.",
	},
	highlights: [
		{ number: "5+", label: "Years of Experience" },
		{ number: "5+", label: "Certifications" },
		{ number: "Up to 50%", label: "Cost reduction (Luxoft engagements)" },
		{ number: "~70%", label: "Fewer incidents (Mercedes-Benz / Luxoft)" },
	] as Highlight[],
	skills: [
		{
			title: "Cloud Platforms",
			icon: "cloud",
			skills: ["AWS", "Azure"],
			primary: ["AWS"],
		},
		{
			title: "Infrastructure as Code",
			icon: "cogs",
			skills: ["Terraform", "Terragrunt", "CloudFormation", "Ansible"],
			primary: ["Terraform"],
		},
		{
			title: "Containers & Orchestration",
			icon: "cubes",
			skills: ["Kubernetes", "Docker", "ECS", "Helm"],
			primary: ["Kubernetes", "Docker"],
		},
		{
			title: "Data streaming & GenAI",
			icon: "stream",
			skills: ["Amazon Kinesis", "Kafka", "AWS Bedrock"],
		},
		{
			title: "CI/CD & Automation",
			icon: "refresh",
			skills: ["Jenkins", "GitHub Actions", "GitLab CI", "Spinnaker"],
			primary: ["Jenkins"],
		},
		{
			title: "Monitoring & Observability",
			icon: "chart",
			skills: [
				"Grafana",
				"Prometheus",
				"CloudWatch",
				"InfluxDB",
				"Datadog",
				"Dynatrace",
			],
			primary: ["Grafana", "Prometheus"],
		},
		{
			title: "Programming & Scripting",
			icon: "code",
			skills: ["Python", "Bash", "Groovy", "Java", "PowerShell"],
			primary: ["Python", "Bash"],
		},
	] as SkillCategory[],
	socialLinks: [
		{
			name: "LinkedIn",
			url: "https://www.linkedin.com/in/andrii-fecton/",
			icon: "linkedin",
			ariaLabel: "LinkedIn profile (opens in new tab)",
		},
		{
			name: "GitHub",
			url: "https://github.com/fecton",
			icon: "github",
			ariaLabel: "GitHub profile (opens in new tab)",
		},
		{
			name: "Telegram",
			url: "https://t.me/fecton",
			icon: "telegram",
			ariaLabel: "Telegram profile (opens in new tab)",
		},
		{
			name: "WhatsApp",
			url: "https://wa.me/48451224798",
			icon: "whatsapp",
			ariaLabel: "WhatsApp contact (opens in new tab)",
		},
	] as SocialLink[],
	footerSocialLinks: [
		{
			name: "Facebook",
			url: "https://www.facebook.com/andrii.lytvynenko.official",
			icon: "facebook",
		},
		{
			name: "Instagram",
			url: "https://www.instagram.com/andrii.lytvynenko/",
			icon: "instagram",
		},
		{ name: "GitHub", url: "https://github.com/fecton", icon: "github" },
		{
			name: "LinkedIn",
			url: "https://www.linkedin.com/in/andrii-fecton/",
			icon: "linkedin",
		},
	],
	trustBadges: [
		{ title: "B2B", icon: "briefcase" },
		{ title: "GDPR", icon: "shield" },
		{ title: "Poland (EU)", icon: "map-marker" },
	],
	languages: [
		{ flag: "🇬🇧", name: "English", level: "Upper-Intermediate (B2)" },
		{ flag: "🇺🇦", name: "Ukrainian", level: "Native", native: true },
		{ flag: "🇷🇺", name: "Russian", level: "Native", native: true },
		{ flag: "🇵🇱", name: "Polish", level: "Upper-Intermediate (B2)" },
	] as Language[],
};
