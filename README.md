# Portfolio Website

Personal portfolio of David Lasslberger — Interaction & UX Designer.

Static site, no build step. Three files do the work:

| File | Purpose |
| :--- | :--- |
| [index.html](index.html) | Homepage — hero, project grid, about, footer. |
| [project.html](project.html) | Case-study template. Renders one project's full page from `projects.json`. |
| [projects.json](projects.json) | Content for every case-study page (the `sections` you build each project from). |

`projects.json` is the single source of truth — both the homepage card (title/category) and the case-study page are rendered from it. There's no separate per-project metadata file anymore.

---

## Quick Configuration

`IS_DEMO_MODE` and `ENABLE_CUSTOM_CURSOR` live at the top of the main `<script>` block in [index.html](index.html) (around lines 709 and 713):

```js
// index.html ~line 709
const IS_DEMO_MODE = false;        // Show grid overlay button

// index.html ~line 713
const ENABLE_CUSTOM_CURSOR = true; // Replace system cursor with dot cursor
```

| Flag | `false` (default) | `true` |
| :--- | :--- | :--- |
| `IS_DEMO_MODE` | No grid overlay button | Reveals the grid toggle button |
| `ENABLE_CUSTOM_CURSOR` | System cursor used | Custom white dot cursor with mix-blend-mode:difference and hover-expand effect |

> The custom cursor is automatically hidden on touch devices regardless of this flag.

[project.html](project.html) has its own separate `ENABLE_CUSTOM_CURSOR` flag (near the top of its `<script>` block) that controls the same cursor effect on case-study pages — the two are independent, so enabling it on the homepage doesn't carry over to project pages and vice versa.

---

## Adding a New Project

A project needs two things: a homepage card, and a case-study page. Both are driven by a single entry in `projects.json`.

**1. Add the project's images**

```
assets/projects/<your-project-slug>/
    0.png, 1.png, 2.png, ...
```

**2. Add the card markup** to `#projectGrid` (first 3 cards, always visible) or `#moreProjects` (revealed by "View All Projects") in [index.html](index.html):

```html
<div class="reveal-on-scroll group" data-project-id="your-project-slug">
    <div class="hover-target relative aspect-[4/3] bg-gray-100 overflow-hidden mb-4 rounded-none transition-[border-radius] duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:rounded-[3rem]">
        <img src="assets/projects/your-project-slug/0.png"
            class="w-full h-full object-cover"
            alt="Project Title"
            onerror="this.src='https://via.placeholder.com/800x600?text=Image+Unavailable'">
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

`data-project-id` must match the `id` you give the entry in `projects.json` next — `loadProjectData()` fills in the `<h3>` title and `.project-role` category text from that entry at runtime, and the id is what links the card to `project.html?id=your-project-slug`.

**3. Add the full case-study content** to `projects.json` (see below) — this feeds both the card text above and everything that renders on `project.html?id=your-project-slug`.

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
| `image-text` | Image + text pair — layouts A & B below. |
| `image-centered` | Single image centered on the page axis, with an optional centered caption. |
| `statement` | Large bold centered text, no image, bounded by top/bottom rules. |

Every image-displaying block type above (all except `section` and `statement`) accepts an optional `"shadow"` property: `true` for a default `drop-shadow`, or a Tailwind shadow scale value (`"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"`) for `drop-shadow-{value}`. Uses the `drop-shadow` filter rather than `box-shadow`, so with `fit: "contain"` the shadow hugs the visible image instead of outlining the full letterboxed box.

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
    "caption": { "en": "Optional caption below both images." },
    "fit": "auto",
    "maxWidth": "900px",
    "gap": "32px"
}
```
`images-3col` is identical, just with 3 paths and square crops instead of 2 with 4:3 crops.

| Property | Values | Description |
| :--- | :--- | :--- |
| `fit` | `"cover"` (default), `"contain"`, or `"auto"` | `cover`/`contain` crop or letterbox images into a fixed box (4:3 for `images-2col`, square for `images-3col`). `auto` skips the box entirely and renders each image at its natural aspect ratio — use it for tall screenshots or gifs that shouldn't be cropped. |
| `maxWidth` | CSS length, e.g. `"900px"` | `images-2col` only. Optional — caps and centers the width of the whole image row. Useful with `fit: "auto"` to keep naturally tall/narrow images from spanning the full column width. |
| `gap` | CSS length, e.g. `"32px"` | `images-2col` only. Optional — overrides the default spacing between images. |
| `mobileGap` | `boolean` | `images-2col` only. Optional — set `true` to add breathing room between the two images when they stack on mobile. |

#### `image-wide`

```json
{
    "type": "image-wide",
    "src": "assets/projects/slug/5.png",
    "bg": "#f3f4f6",
    "caption": { "en": "Optional caption." }
}
```
`bg` is optional — set it to pad the image on a colored band (used for screenshots that need breathing room). `alt` is also optional (empty by default).

#### `image-highlight`

```json
{ "type": "image-highlight", "src": "assets/projects/slug/6.png", "caption": { "en": "..." } }
```
Same as `image-wide` (including optional `alt`), but always full-bleed on a gray-50 band — use it to punctuate a section with one standout shot.

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
| `fit` | `"cover"` (default), `"contain"`, or `"auto"` | The image sits in a fixed 4:3 box. `cover` crops to fill it; `contain` letterboxes instead, for images that aren't already 4:3. `auto` skips the box and renders the image at its natural aspect ratio. |
| `number` | `string` | Optional — draws the numbered divider rule, same as `section`. |
| `image` | `string` | **Required.** |
| `label`, `heading`, `body` | `string \| object` | All optional. |
| `alt` | `string` | Optional — overrides the image `alt` text (empty by default). |

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
`label`/`heading`/`body` are all optional — omit all three for a bare centered image with no caption. `fit` is optional (`"cover"` default, `"contain"`, or `"auto"`), same meaning as on `image-text`: the image sits in a fixed 16:9 box, `contain` letterboxes instead of cropping, and `auto` skips the box for the image's natural aspect ratio.

#### `statement` — Pattern D

```json
{
    "type": "statement",
    "label": { "en": "Statement" },
    "text": { "en": "Great design is <strong>invisible</strong> — it simply feels right." },
    "noRules": false
}
```
Use sparingly, as a pull-quote or a transition between denser sections. `text` supports inline HTML. `noRules` is optional — set `true` to drop the top/bottom divider rules.

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

- `assets/images/`, `assets/misc/` — site chrome (favicon, profile photo) and downloadable files (CV, diploma). Not part of the project-content workflow above.
- `styles/main.css` — currently empty and unreferenced by either page; all styling is Tailwind utility classes inline in the HTML.
