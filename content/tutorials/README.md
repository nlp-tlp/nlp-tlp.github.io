---
permalink: false
eleventyExcludeFromCollections: true
---

# Tutorials

One markdown file per tutorial, course or workshop the group has given.
Front matter:

```yaml
---
name: Knowledge Graphs Demystified          # required
description: A half-day introduction to...   # required, one or two sentences
theme: knowledge-graphs-and-ontologies       # a slug from _data/themes.js
url: https://github.com/nlp-tlp/...          # optional, where to find it
venue: AJCAI 2023                            # optional, where it was given
---
```

`theme` decides which block of /research/ it appears in. Leave it out or use
a slug that no longer exists and the tutorial shows under "Other work" rather
than disappearing.
