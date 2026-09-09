const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle");
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");

/** @param {import('@11ty/eleventy').UserConfig} eleventyConfig */
module.exports = function (eleventyConfig) {
	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	eleventyConfig.addPassthroughCopy({
		"./public/": "/",
		"./node_modules/prismjs/themes/prism-okaidia.css": "/css/prism-okaidia.css",
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Watch content images for the image pipeline.
	eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpeg}");

	// App plugins
	eleventyConfig.addPlugin(pluginDrafts);
	eleventyConfig.addPlugin(pluginImages);

	// Official plugins
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	eleventyConfig.addPlugin(pluginNavigation);
	eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
	eleventyConfig.addPlugin(pluginBundle);

	// Get base path (for use in nav bar)
	// https://github.com/11ty/eleventy-navigation/issues/3
	eleventyConfig.addFilter("getbase", function (value) {
		return "/" + value.split("/")[1] + "/";
	});

	eleventyConfig.addFilter("sortByOrder", (values) => {
		return values.sort(function (a, b) {
			let order_a = a.data.order || 999;
			let order_b = b.data.order || 999;
			return order_a - order_b;
		});
	});

	// eleventyConfig.addCollection("people_academics", function (collectionApi) {
	// 	return sortByOrder(collection.people_academics);
	// });

	// Parse a youtube link in the form e.g.
	// https://www.youtube.com/watch?v=ZEKAzNNfeSc and return the embed link
	eleventyConfig.addFilter("getYoutubeEmbedLink", (youtubeLink) => {
		return youtubeLink.replace(
			"https://www.youtube.com/watch?v=",
			"https://www.youtube.com/embed/",
		);
	});

	// Select the items of a collection whose legacy `group` belongs to a theme.
	// The theme -> group mapping lives in _data/themes.js.
	eleventyConfig.addFilter("inTheme", (items, groups) => {
		if (!Array.isArray(items)) return [];
		return items.filter((item) => (groups || []).includes(item.data.group));
	});

	// Items whose group belongs to no theme at all, so nothing is silently
	// dropped from the research page when a new group name appears.
	eleventyConfig.addFilter("notInAnyTheme", (items, themes) => {
		if (!Array.isArray(items)) return [];
		const claimed = new Set((themes || []).flatMap((t) => t.groups));
		return items.filter((item) => !claimed.has(item.data.group));
	});

	// The YouTube video id, so a talk can be shown as a thumbnail that links
	// out rather than an embedded player. Twenty-six embedded players on one
	// page is a slow page and a lot of third-party cookies.
	eleventyConfig.addFilter("getYoutubeId", (youtubeLink) => {
		const match = /[?&]v=([^&]+)/.exec(youtubeLink || "");
		return match ? match[1] : "";
	});

	// Current projects carry a `theme` slug in their front matter.
	eleventyConfig.addFilter("withTheme", (items, slug) => {
		if (!Array.isArray(items)) return [];
		return items.filter((item) => item.data.theme === slug);
	});
	eleventyConfig.addFilter("withoutAnyTheme", (items, themes) => {
		if (!Array.isArray(items)) return [];
		const slugs = new Set((themes || []).map((t) => t.slug));
		return items.filter((item) => !slugs.has(item.data.theme));
	});

	// The software systems belonging to a theme, matched by name.
	eleventyConfig.addFilter("demosOfTheme", (items, names) => {
		if (!Array.isArray(items)) return [];
		return items.filter((item) => (names || []).includes(item.data.name));
	});

	// Publications and talks carry their year inside a free-text venue string
	// rather than a date field, so pull the last plausible year out of it to
	// order them newest first. Anything with no year sorts to the end.
	const yearOf = (item) => {
		const text = `${item.data.venue || ""} ${item.data.presentation_date || ""}`;
		const years = (text.match(/\b(19|20)\d{2}\b/g) || []).map(Number);
		return years.length ? Math.max(...years) : 0;
	};
	eleventyConfig.addFilter("newestFirst", (items) =>
		Array.isArray(items) ? [...items].sort((a, b) => yearOf(b) - yearOf(a)) : [],
	);

	// Filters
	eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
		// Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
		return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
			format || "dd LLLL yyyy",
		);
	});

	eleventyConfig.addFilter("htmlDateString", (dateObj) => {
		// dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
		return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
	});

	// Get the first `n` elements of a collection.
	eleventyConfig.addFilter("head", (array, n) => {
		if (!Array.isArray(array) || array.length === 0) {
			return [];
		}
		if (n < 0) {
			return array.slice(n);
		}

		return array.slice(0, n);
	});

	// Return the smallest number argument
	eleventyConfig.addFilter("min", (...numbers) => {
		return Math.min.apply(null, numbers);
	});

	// Return all the tags used in a collection
	eleventyConfig.addFilter("getAllTags", (collection) => {
		let tagSet = new Set();
		for (let item of collection) {
			(item.data.tags || []).forEach((tag) => tagSet.add(tag));
		}
		return Array.from(tagSet);
	});

	eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
		return (tags || []).filter(
			(tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1,
		);
	});

	// Customize Markdown library settings:
	eleventyConfig.amendLibrary("md", (mdLib) => {
		mdLib.use(markdownItAnchor, {
			permalink: markdownItAnchor.permalink.ariaHidden({
				placement: "after",
				class: "header-anchor",
				symbol: "#",
				ariaHidden: false,
			}),
			level: [1, 2, 3, 4],
			slugify: eleventyConfig.getFilter("slugify"),
		});
	});

	eleventyConfig.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

	// The footer copyright year, so it can never go stale again.
	eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);

	// Add the CNAME file into the _site folder
	// (this allows GitHub pages to know about nlp-tlp.org)
	eleventyConfig.addPassthroughCopy("CNAME");

	eleventyConfig.addCollection("redirects", function (collectionApi) {
		// lets make a variable to hold our redirects
		let redirects = [
			["aquila", "https://aquila.nlp-tlp.org/"],
			["redcoat", "https://redcoat.nlp-tlp.org/"],
			["text2kg", "https://text2kg.nlp-tlp.org/"],
			["echidna", "https://echidna.nlp-tlp.org/"],
			["maintenance_kg", "https://echidna.nlp-tlp.org/"],

			// Pages the 2026 restructure folded into Research, Projects and
			// Contacts. Kept so existing inbound links and search results
			// still land somewhere useful instead of a 404.
			["publications/index", "/research/"],
			["presentations/index", "/research/"],
			["seminars/index", "/research/#seminars"],
			["current-research/index", "/research/"],
			["collaborations/index", "/#who-we-work-with"],
			["software_demos/index", "/projects/"],
			["software-demos/index", "/projects/"],
			["our-team/index", "/people/"],
			["contact-us/index", "/contacts/"],
			["phd-opportunities/index", "/contacts/#phd-and-honours-opportunities"],
			["news/index", "/"],
			["research/technical-language-processing/index", "/research/#technical-language-processing"],
			["research/knowledge-graphs-and-ontologies/index", "/research/#knowledge-graphs-and-ontologies"],
			["research/annotation-and-tools/index", "/research/#annotation-and-tools"],
			["research/language-and-reasoning/index", "/research/#language-and-reasoning"],
		];

		return redirects;
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// eleventyConfig.setServerPassthroughCopyBehavior("passthrough");

	return {
		// Control which files Eleventy will process
		// e.g.: *.md, *.njk, *.html, *.liquid
		templateFormats: ["md", "njk", "html", "liquid"],

		// Pre-process *.md files with: (default: `liquid`)
		markdownTemplateEngine: "njk",

		// Pre-process *.html files with: (default: `liquid`)
		htmlTemplateEngine: "njk",

		// These are all optional:
		dir: {
			input: "content", // default: "."
			includes: "../_includes", // default: "_includes"
			data: "../_data", // default: "_data"
			output: "_site",
		},

		// -----------------------------------------------------------------
		// Optional items:
		// -----------------------------------------------------------------

		// If your site deploys to a subdirectory, change `pathPrefix`.
		// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

		// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
		// it will transform any absolute URLs in your HTML to include this
		// folder name and does **not** affect where things go in the output folder.
		pathPrefix: "/",
	};
};
