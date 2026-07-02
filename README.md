# Portfolio Website

Personal portfolio of David Lasslberger — Interaction & UX Designer.

Static site, no build step. Three files do the work:

| File | Purpose |
| :--- | :--- |
| [index.html](index.html) | Homepage — hero, project grid, about, footer. |
| [project.html](project.html) | Case-study template. Renders one project's full page from `projects.json`. |
| [projects.json](projects.json) | Content for every case-study page (the `sections` you build each project from). |

Each project also gets a small `assets/projects/<slug>/project_info.json` file — that one only feeds the **title/category text on the homepage card**, it has no effect on the case-study page itself.

> **Layout reference:** [demos/demo-layouts.html](demos/demo-layouts.html) is a live, visual reference for the four `image-text` / `image-centered` / `statement` patterns described below — open it in a browser (served, not `file://`) before writing a new section to see what each option actually looks like.

---

## Quick Configuration

`IS_DEMO_MODE` and `ENABLE_CUSTOM_CURSOR` live at the top of the main `<script>` block in [index.html](index.html) (around line 709):

```js
// index.html ~line 709
const IS_DEMO_MODE = false;         // Show grid overlay + test project card
const ENABLE_CUSTOM_CURSOR = false; // Replace system cursor with dot cursor
```

| Flag | `false` (default) | `true` |
| :--- | :--- | :--- |
| `IS_DEMO_MODE` | Only real projects shown; no grid overlay button | Reveals the grid toggle button and an extra "Layout Grid Demo" project card |
| `ENABLE_CUSTOM_CURSOR` | System cursor used | Custom white dot cursor with mix-blend-mode:difference and hover-expand effect |

> The custom cursor is automatically hidden on touch devices regardless of this flag.

[project.html](project.html) has its own separate `ENABLE_CUSTOM_CURSOR` flag (near the top of its `<script>` block) that controls the same cursor effect on case-study pages — the two are independent, so enabling it on the homepage doesn't carry over to project pages and vice versa.

---

## Adding a New Project

A project needs two things: a homepage card, and a case-study page.

**1. Add the project's images**

```
assets/projects/<your-project-slug>/
    0.png, 1.png, 2.png, ...
    project_info.json
```

**2. Create `project_info.json`** — only used to label the homepage card:

```json
{
    "id": "your-project-slug",
    "title": { "en": "Project Title", "de": "Projekttitel" },
    "category": { "en": "Interaction Design", "de": "Interaktionsdesign" }
}
```

**3. Register that path in [index.html](index.html)**, inside `loadProjectData`'s `sources` array (around line 775):

```js
const sources = [
    'assets/projects/portfolio_machine/project_info.json',
    // ... existing projects ...
    'assets/projects/<your-project-slug>/project_info.json', // ← add here
];
```

**4. Add the card markup** to `#projectGrid` (first 3 cards, always visible) or `#moreProjects` (revealed by "View All Projects") in [index.html](index.html):

```html
<div class="reveal-on-scroll group" data-project-id="your-project-slug">
    <div class="hover-target relative aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
        <img src="assets/projects/your-project-slug/0.png"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Project Title">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
    </div>
    <div class="flex justify-between items-start">
        <div>
            <h3 class="text-lg font-semibold">Project Title</h3>
            <p class="text-sm text-gray-500 project-role"></p>
        </div>
    </div>
</div>
```

`data-project-id` must match `id` in both `project_info.json` and the entry you add to `projects.json` next — that's what links the card to `project.html?id=your-project-slug`.

**5. Add the full case-study content** to `projects.json` (see below) — this is what actually renders on `project.html?id=your-project-slug`.

---

## Case-Study Page Reference (`projects.json`)

`projects.json` has a single `"projects"` array. Each entry is one project's root metadata plus its `sections` (the ordered content blocks that make up the page body).

### Root object

```json
{
    "id": "your-project-slug",
    "title": "Project Title",
    "year": "2025",
    "category": { "en": "Interaction Design", "de": "Interaktionsdesign" },
    "role": { "en": "UX Designer", "de": "UX-Designer" },
    "tools": "Figma, Protopie",
    "hero": "assets/projects/your-project-slug/0.png",
    "sections": []
}
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Must match the homepage card's `data-project-id`. |
| `title` | `string \| object` | Shown as the page's large `<h1>`. |
| `year` | `string` | Shown in the metadata row. |
| `category`, `role`, `tools` | `string \| object` | Shown in the metadata row. |
| `hero` | `string` | Full-width image under the title. |
| `sections` | `array` | Ordered content blocks — see below. |

Any field marked `string \| object` accepts a plain string, or `{ "en": "...", "de": "..." }` for a translated version.

Projects don't need explicit prev/next links — `project.html` wraps around the array order in `projects.json` automatically.

### Section blocks

Every entry in `sections` has a `type`. Blocks stack top to bottom.

| `type` | What it renders |
| :--- | :--- |
| `section` | Heading + body paragraphs, no image (4/7-column split). |
| `images-2col` | Two images side by side, with an optional caption. |
| `images-3col` | Three images in a row, with an optional caption. |
| `image-wide` | One full-width image, with an optional caption and background color. |
| `image-highlight` | One image on a full-bleed gray-50 band, with an optional caption. |
| `image-text` | Image + text pair — the four layouts from `demos/demo-layouts.html`. |
| `image-centered` | Single image centered on the page axis, with an optional centered caption. |
| `statement` | Large bold centered text, no image, bounded by top/bottom rules. |

#### `section`

```json
{
    "type": "section",
    "number": "01",
    "heading": { "en": "The Thesis", "de": "Die Masterarbeit" },
    "body": {
        "en": ["First paragraph.", "Second paragraph."],
        "de": ["Erster Absatz.", "Zweiter Absatz."]
    }
}
```
`number` draws the numbered divider rule above the heading (e.g. `01`, `02`) — omit it to skip the rule. `body` paragraphs support inline HTML (`<strong>`, `<em>`).

#### `images-2col` / `images-3col`

```json
{
    "type": "images-2col",
    "images": ["assets/projects/slug/1.png", "assets/projects/slug/2.png"],
    "caption": { "en": "Optional caption below both images." }
}
```
`images-3col` is identical, just with 3 paths and square crops instead of 2 with 4:3 crops.

#### `image-wide`

```json
{
    "type": "image-wide",
    "src": "assets/projects/slug/5.png",
    "bg": "#f3f4f6",
    "caption": { "en": "Optional caption." }
}
```
`bg` is optional — set it to pad the image on a colored band (used for screenshots that need breathing room).

#### `image-highlight`

```json
{ "type": "image-highlight", "src": "assets/projects/slug/6.png", "caption": { "en": "..." } }
```
Same as `image-wide`, but always full-bleed on a gray-50 band — use it to punctuate a section with one standout shot.

#### `image-text` — Patterns A & B (image + text pair)

```json
{
    "type": "image-text",
    "number": "02",
    "layout": "contained",
    "side": "left",
    "fit": "contain",
    "image": "assets/projects/slug/3.png",
    "label": { "en": "Optional eyebrow" },
    "heading": { "en": "Optional heading" },
    "body": { "en": ["Paragraph text."] }
}
```

| Property | Values | Description |
| :--- | :--- | :--- |
| `layout` | `"contained"` (default) or `"bleed"` | `contained` keeps the image inside its own half. `bleed` widens the image past the center so it overlaps into the text's half. |
| `side` | `"left"` (default) or `"right"` | Which half the image sits in. |
| `fit` | `"cover"` (default) or `"contain"` | The image sits in a fixed 4:3 box. `cover` crops to fill it; `contain` letterboxes instead, for images that aren't already 4:3. |
| `number` | `string` | Optional — draws the numbered divider rule, same as `section`. |
| `image` | `string` | **Required.** |
| `label`, `heading`, `body` | `string \| object` | All optional. |

#### `image-centered` — Pattern C

```json
{
    "type": "image-centered",
    "image": "assets/projects/slug/4.png",
    "fit": "contain",
    "label": { "en": "Optional eyebrow" },
    "heading": { "en": "Optional heading" },
    "body": { "en": ["Optional caption paragraph."] }
}
```
`label`/`heading`/`body` are all optional — omit all three for a bare centered image with no caption. `fit` is optional (`"cover"` default, or `"contain"`), same meaning as on `image-text`: the image sits in a fixed 16:9 box, and `contain` letterboxes instead of cropping.

#### `statement` — Pattern D

```json
{
    "type": "statement",
    "label": { "en": "Statement" },
    "text": { "en": "Great design is <strong>invisible</strong> — it simply feels right." }
}
```
Use sparingly, as a pull-quote or a transition between denser sections. `text` supports inline HTML.

---

## External Libraries (CDN)

| Library | Purpose |
| :--- | :--- |
| [Tailwind CSS](https://cdn.tailwindcss.com) | All layout and styling |
| [Lucide Icons](https://unpkg.com/lucide) | UI icons (menu, arrows, external links) |
| [Google Fonts](https://fonts.google.com) | IBM Plex Sans (body) + Material Symbols (index.html only) |

**Local font:** `Aspekta-700.woff2` in `assets/fonts/` — used for all headings on every page.

---

## Other Folders

- `demos/` — standalone reference/prototype pages, not linked from the live site. `demo-layouts.html` documents the `image-text` / `image-centered` / `statement` patterns above.
- `backups/` — old/unused files (a prior `index.html`, notes from an earlier data model). Not part of the live site.
