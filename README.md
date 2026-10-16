# not6741.lol

Personal site for **not** — the best vibecoder ever.

A single static page: `index.html` plus `scratchblocks.svg` for the Scratch skill preview.
No build step, no dependencies — it's served as-is by GitHub Pages.

## Editing

- Projects live in the `projects` array inside the `<script>` block of `index.html`.
- Skills (and their snippets) live in the `SKILLS` object just below it.

## Hosting

Static page served by GitHub Pages, with the custom domain `not6741.lol`
(see the `CNAME` file). Pushing to `main` redeploys automatically.
