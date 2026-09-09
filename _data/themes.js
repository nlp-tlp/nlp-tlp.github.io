// The research themes the site is organised around.
//
// Publications and presentations were tagged with two different, overlapping
// sets of `group` values. Rather than rewrite ~55 content files, each theme
// declares the legacy group names that belong to it, and the research page
// pulls items in through that mapping. To retag an item, change its `group`
// in its markdown file; to reshape the themes, edit this file alone.
module.exports = [
	{
		slug: "technical-language-processing",
		name: "Technical language processing",
		blurb:
			"Industry writes in shorthand. Maintenance work orders, inspection notes and drilling logs are terse, misspelt and full of site-specific jargon, which is exactly what general-purpose language models handle worst. We build methods that read this text as it is actually written.",
		groups: ["Technical Language Processing", "Maintenance"],
		demos: ["Aquila"],
	},
	{
		slug: "knowledge-graphs-and-ontologies",
		name: "Knowledge graphs and ontologies",
		blurb:
			"Once the text is readable, the knowledge inside it has to be given a shape that machines can reason over. We work on constructing knowledge graphs from technical text, and on the ontologies that keep those graphs consistent across an industry.",
		groups: ["Knowledge Graphs", "Ontologies"],
		demos: ["Text2KG", "Echidna"],
	},
	{
		slug: "annotation-and-tools",
		name: "Annotation and tooling",
		blurb:
			"Supervised methods need labelled data, and domain experts are the only people who can label technical text. Much of our research goes into annotation methods and the software that makes expert labelling fast enough to be worth doing.",
		groups: ["Annotation", "Software"],
		demos: ["Redcoat", "LexiClean", "QuickGraph"],
	},
	{
		slug: "language-and-reasoning",
		name: "Language models and reasoning",
		blurb:
			"Underlying all of it is the question of how language is represented and reasoned with: embeddings, query answering over incomplete knowledge, and where large language models help rather than hurt on specialist text.",
		groups: ["Natural Language Processing", "Conferences", "Invited talks"],
		demos: [],
	},
];
