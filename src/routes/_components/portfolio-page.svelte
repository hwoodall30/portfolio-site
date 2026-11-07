<script lang="ts">
	import { asset } from '$app/paths';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Github from '@lucide/svelte/icons/code-xml';
	import Linkedin from '@lucide/svelte/icons/briefcase-business';
	import Download from '@lucide/svelte/icons/download';
	import Mail from '@lucide/svelte/icons/mail';
	import ThemePicker from '#lib/components/app/theme-picker.svelte';
	import Ballpark from '#lib/components/app/ballpark.svelte';
	import RoleMatcher from './role-matcher.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	let easterEgg = $state(false);
	const skills = [
		{
			title: 'Leading teams',
			items: 'Solution architecture · Team mentorship · Cross-functional delivery'
		},
		{
			title: 'Frontend',
			items: 'TypeScript · SvelteKit · React / Next.js · Tailwind · Playwright'
		},
		{ title: 'Backend & AI', items: 'Agents · RAG · MCP · Go · Python · GraphQL · AWS' }
	];
</script>

<a class="skip-link" href="#main">Skip to content</a>
<div class="site-shell">
	<header class="site-header">
		<a href="#main" class="wordmark" aria-label="Hunter Woodall home"
			><span class="monogram">hw<span>.</span></span><span>HUNTER WOODALL</span></a
		>
		<div class="header-actions">
			<nav aria-label="Main navigation">
				<a href="#work">Work</a><a href="#about">About</a><a href="#contact" class="contact-nav"
					>Contact <ArrowUpRight size={14} /></a
				>
			</nav>
			<ThemePicker />
		</div>
	</header>
	<main id="main">
		<section class="hero" aria-labelledby="hero-title">
			<div class="hero-copy">
				<p class="eyebrow hero-eyebrow">Lead software engineer</p>
				<h1 id="hero-title">I’m a software engineer who likes figuring out how things work.</h1>
				<p class="hero-description">
					I build AI products, from agents and retrieval systems to the interfaces people use to
					work with them. I started in mechanical engineering and still like understanding how all
					the pieces fit together.
				</p>
				<div class="hero-actions">
					<Button href="#work" size="lg">See my work <ArrowDown data-icon="inline-end" /></Button><a
						class="text-link"
						href={asset('Hunter-Woodall-Resume.pdf')}
						target="_blank"
						rel="noreferrer">View résumé <ArrowUpRight size={14} /></a
					>
				</div>
			</div>
			<div class="hero-visual">
				<div class="visual-coordinate top-left">
					OFF THE CLOCK<br /><span>Usually thinking about baseball.</span>
				</div>
				<div class="hero-ballpark"><Ballpark /></div>
				<div class="park-caption">
					<span class="caption-line"></span><span>A small ballpark<br />for the homepage.</span>
				</div>
				<a class="hero-invitation" href="#role-match"
					><span class="invitation-icon"><ArrowUpRight size={20} /></span><span
						><strong>Hiring for your team?</strong><small>Compare a role with my experience</small
						></span
					><ArrowRight size={16} /></a
				>
			</div>
		</section>
		<div class="hero-footnote">
			<span>ZOOVU · PREVIOUSLY XGEN AI</span><span
				>Software, teams, and a bit of baseball <span>↘</span></span
			>
		</div>
		<section id="impact" class="impact" aria-label="Selected career accomplishments">
			<div class="impact-intro">
				<span class="eyebrow">A FEW NUMBERS</span>
				<p>From my work<br />at XGen AI and Zoovu.</p>
			</div>
			<div class="metric">
				<strong>10<span> engineers</span></strong>
				<p>Led and mentored across<br />experience levels</p>
			</div>
			<div class="metric">
				<strong>24<span>%</span></strong>
				<p>Reduction in LLM<br />spending in 2026</p>
			</div>
			<div class="metric">
				<strong>Millions<span> / day</span></strong>
				<p>Requests served by a filtering<br />and faceting engine I built</p>
			</div>
		</section>
		<section id="work" class="work-section">
			<div class="section-heading">
				<div>
					<p class="eyebrow">WORK</p>
					<h2>A few things I’ve worked on.</h2>
				</div>
				<p>
					A browser experiment and a project<br />from my work at XGen AI.
				</p>
			</div>
			<div id="role-match" class="project-intro">
				<div>
					<h3>Find the relevant experience</h3>
				</div>
				<span class="project-type">BROWSER EXPERIMENT</span>
			</div>
			<div class="project-description">
				<p>
					Paste a role to see which parts of my background are relevant. You can try an example
					first, or run the model on your device.
				</p>
			</div>
			<RoleMatcher />
			<article id="case-study" class="case-study" aria-labelledby="case-title">
				<div class="case-story">
					<p class="eyebrow">XGEN AI / CASE STUDY</p>
					<h3 id="case-title">
						Building product filters<br />in plain English.
					</h3>
					<p class="case-lede">
						Helping enterprise merchandisers build complex filters without an engineering handoff.
					</p>
					<div class="case-meta">
						<span>XGEN AI</span><span>PRODUCT DISCOVERY → ARCHITECTURE → IMPLEMENTATION</span>
					</div>
					<div class="stack-list">
						Go <span>/</span> Python <span>/</span> GraphQL <span>/</span> Generative AI
					</div>
				</div>
				<div class="case-details">
					<div>
						<span class="case-step">THE PROBLEM</span>
						<p>
							Merchandisers knew what they wanted. Translating “summer dresses under $150, in stock
							in most sizes, not on clearance” into rules took too many clicks—and often technical
							help. I joined customer calls to understand where the workflow broke down.
						</p>
					</div>
					<div>
						<span class="case-step">WHAT I BUILT</span>
						<p>
							I designed and built an agent grounded in each customer’s catalog schema. It wrote
							deterministic filters for our filtering engine. Merchandisers could inspect and adjust
							the rules before saving; the LLM never picked products itself.
						</p>
					</div>
					<div>
						<span class="case-step">THE OUTCOME</span>
						<p>
							Merchandisers could create complex filters independently in minutes. The feature also
							became part of our sales demos for other customers.
						</p>
					</div>
					<div class="case-takeaway">
						<span>WHY THIS APPROACH</span>
						<p>The model wrote the rules; merchandisers could check and edit them.</p>
					</div>
				</div>
			</article>
		</section>
		<section id="about" class="about-section">
			<div class="about-copy">
				<p class="eyebrow">ABOUT</p>
				<h2>How I got here.</h2>
				<p>
					I started in mechanical engineering, working on equipment, manufacturing processes, and
					the systems people rely on. Software became another way to solve those problems.
				</p>
				<p>
					Today, I lead a software engineering team at Zoovu, following its acquisition of XGen AI.
					My work spans product decisions, architecture, generative AI, and helping engineers do
					their best work.
				</p>
				<p>
					I’m drawn to products that help people find, understand, and act on information. Outside
					work, you’ll find me building PCs, self-hosting, or following baseball.
				</p>
				<a class="text-link" href={asset('Hunter-Woodall-Resume.pdf')} download
					>Get the full résumé <Download size={14} /></a
				>
			</div>
			<div class="about-detail">
				<div class="builder-note">
					<span class="eyebrow">AWAY FROM WORK</span>
					<p>Building PCs, running things on my own servers, and keeping up with baseball.</p>
				</div>
				<div class="skills-list">
					{#each skills as skill}<div>
							<h3>{skill.title}</h3>
							<p>{skill.items}</p>
						</div>{/each}
				</div>
			</div>
		</section>
		<section id="contact" class="contact-section">
			<div>
				<p class="eyebrow">CONTACT</p>
				<h2>Get in touch.</h2>
				<p>
					If you’re hiring or want to talk about a project,<br />send me an email.
				</p>
				<a class="email-link" href="mailto:hwoodall30@gmail.com"
					>hwoodall30@gmail.com <ArrowUpRight /></a
				>
			</div>
			<div class="contact-links">
				<a href="mailto:hwoodall30@gmail.com"><Mail size={17} />Email<ArrowUpRight size={14} /></a
				><a href="https://www.linkedin.com/in/hunterwoodall30" target="_blank" rel="noreferrer"
					><Linkedin size={17} />LinkedIn<ArrowUpRight size={14} /></a
				><a href="https://github.com/hwoodall30" target="_blank" rel="noreferrer"
					><Github size={17} />GitHub<ArrowUpRight size={14} /></a
				><a href={asset('Hunter-Woodall-Resume.pdf')} target="_blank" rel="noreferrer"
					><Download size={17} />Résumé<ArrowUpRight size={14} /></a
				>
			</div>
		</section>
	</main>
	<footer class="site-footer">
		<span>© {new Date().getFullYear()} HUNTER WOODALL</span><span class="footer-built"
			>SvelteKit, TypeScript, and a little Three.js.</span
		><button
			class="baseball-button"
			aria-label="Discover a baseball Easter egg"
			aria-expanded={easterEgg}
			onclick={() => (easterEgg = !easterEgg)}
			><svg viewBox="0 0 32 32" fill="none" aria-hidden="true"
				><circle cx="16" cy="16" r="13" stroke="currentColor" /><path
					d="M8 6c9 6 9 14 0 20M24 6c-9 6-9 14 0 20"
					stroke="#af6c56"
					stroke-dasharray="2 2"
				/></svg
			></button
		>
	</footer>
	{#if easterEgg}<div class="easter-egg" role="status">
			<span class="eyebrow">THE SEVENTH-INNING STRETCH</span>
			<p>Time for a stretch. Baseball can wait through a rain delay; so can this.</p>
			<span class="tiny-mono">Thanks for stopping by.</span><Button
				variant="ghost"
				size="sm"
				onclick={() => (easterEgg = false)}
				>Back to the game <ArrowRight data-icon="inline-end" /></Button
			>
		</div>{/if}
</div>
