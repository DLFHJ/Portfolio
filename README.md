# Portfolio Website

Personal portfolio of David Lasslberger — Interaction & UX Designer.

---

## Quick Configuration

Both settings live at the top of the `<script>` block in [index.html](index.html) (around line 843):

```js
// index.html ~line 845
const IS_DEMO_MODE = false;       // Show grid overlay + test projects
const ENABLE_CUSTOM_CURSOR = false; // Replace system cursor with dot cursor
```

| Flag | `false` (default) | `true` |
| :--- | :--- | :--- |
| `IS_DEMO_MODE` | Only real projects shown; no grid overlay button | Reveals the grid toggle button and includes `assets/projects/demo/project_info.json` in the project list |
| `ENABLE_CUSTOM_CURSOR` | System cursor used | Custom white dot cursor with mix-blend-mode:difference and hover-expand effect |

> The custom cursor is automatically hidden on touch devices regardless of this flag.

---

## Adding a New Project

**1. Create the folder and JSON file:**

```
assets/projects/<your-project-slug>/
    project_info.json
    images/          ← put project images here (referenced in the JSON)
```

**2. Register the path in [index.html](index.html)** inside the `loadProjectData` sources array (around line 951):

```js
const sources = [
    'assets/projects/portfolio_machine/project_info.json',
    // ... existing projects ...
    'assets/projects/<your-project-slug>/project_info.json', // ← add here
];
```

---

## Project JSON Reference

Each project is defined by a single `project_info.json`. The file has two main parts: the **root object** (metadata) and a **sections array** (the content layout).

### Minimal example

```json
{
    "id": "my_project",
    "title": { "en": "My Project", "de": "Mein Projekt" },
    "category": { "en": "Interaction Design", "de": "Interaktionsdesign" },
    "year": "2025",
    "heroImage": "assets/projects/my_project/images/cover.jpg",
    "description": { "en": "A short summary shown in the project header." },
    "metadata": [
        { "label": { "en": "Tools" }, "value": { "en": "Figma, Protopie" } }
    ],
    "sections": []
}
```

All text fields that accept `string | object` can be either a plain string (`"My title"`) or a translation object (`{ "en": "My title", "de": "Mein Titel" }`).

---

### Root Object

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` | Yes | Unique key. Must match the folder name. |
| `title` | `string \| object` | Yes | Displayed project title. |
| `category` | `string \| object` | No | Label shown below the title (e.g. "Interaction Design"). |
| `year` | `string \| number` | No | Year shown in project metadata. |
| `heroImage` | `string` | Yes | Path to the cover image (shown at the top of the modal). |
| `description` | `string \| object` | No | Short intro text in the project header. |
| `metadata` | `array` | No | Key-value pairs shown in the info sidebar (see below). |
| `sections` | `array` | Yes | Ordered list of content sections (the main body). |

**Metadata item:**
```json
{ "label": { "en": "Role" }, "value": { "en": "UX Designer" } }
```

---

### Section Object

A section is one visual block of content. Sections stack vertically.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | — | `"text"`, `"image"`, `"gallery"`, `"content"` |
| `layout` | `string` | `"default"` | Controls how items inside are arranged. See layouts below. |
| `bgColor` | `string` | none | Tailwind color name: `"gray-50"`, `"gray-100"`, `"black"`, etc. Text auto-inverts to white on dark backgrounds. |
| `bgWidth` | `string` | full-width | `"grid"` — constrains the colored background to the column grid only. |
| `width` | `string` | — | `"full"` — makes the section break out of the grid entirely. |
| `columns` | `number` | `3` | *Gallery/grid only.* Number of columns: `2` or `3`. |
| `caption` | `string \| object` | — | Optional caption rendered below the section. |
| `items` | `array` | — | The actual content pieces inside this section. |

**Available layouts:**

| `layout` value | Behaviour |
| :--- | :--- |
| `"default"` | Items flow left-to-right, wrapping within the column grid. |
| `"centered"` | Items are centred horizontally. |
| `"editorial-split"` | Two-column asymmetrical split (left + right). |
| `"offset"` | Items start offset from the left edge. |
| `"full-bleed"` | Section breaks out of the grid and spans edge-to-edge of the modal. |
| `"grid"` | Used with `type: "gallery"` — equal-width columns. |

---

### Item Object

Items live inside `section.items`. Every item has a `role` that determines its type.

**Common properties (all roles):**

| Property | Type | Description |
| :--- | :--- | :--- |
| `role` | `string` | **Required.** `"image"`, `"text"`, or `"spacer"` |
| `width` | `string` | Column span. See width table below. |
| `align` | `string` | `"left"`, `"center"`, `"right"` |

**Width values:**

| `width` | Approx. columns | Notes |
| :--- | :--- | :--- |
| `"small"` | 3 cols | |
| `"medium"` | 4 cols | |
| `"five-cols"` | 5 cols | |
| `"6-cols"` | 6 cols | |
| `"large"` | 8 cols, touches left edge | |
| `"xlarge"` | 8 cols, indented | Best for body text |
| `"full"` | 10 cols (entire grid) | |
| `"full-bleed"` | Edge-to-edge of modal | Ignores grid |

---

#### Role: `"image"`

```json
{
    "role": "image",
    "width": "xlarge",
    "src": "assets/projects/my_project/images/screen1.jpg",
    "caption": { "en": "Optional caption text." },
    "className": "rounded-lg"
}
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `src` | `string` | Path to the image file. |
| `caption` | `string \| object` | Optional caption below the image. |
| `className` | `string` | Optional extra CSS classes. |

---

#### Role: `"text"`

```json
{
    "role": "text",
    "width": "xlarge",
    "content": { "en": "Body text. Supports <b>HTML</b> tags." }
}
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `content` | `string \| object` | Text content. HTML tags like `<b>`, `<br>`, `<code>` are supported. |

---

#### Role: `"spacer"`

Inserts vertical whitespace between items.

```json
{ "role": "spacer", "height": "medium" }
```

| `height` value | Size |
| :--- | :--- |
| `"small"` | Small gap |
| `"medium"` | Medium gap |
| `"large"` | Large gap |
| `"xlarge"` | Extra-large gap |

---

## External Libraries (CDN)

| Library | Purpose |
| :--- | :--- |
| [Tailwind CSS](https://cdn.tailwindcss.com) | All layout and styling |
| [Lucide Icons](https://unpkg.com/lucide) | UI icons (menu, arrows, external links) |
| [Google Fonts](https://fonts.google.com) | IBM Plex Sans (body) + Material Symbols |

**Local font:** `Aspekta-700.woff2` in `assets/fonts/` — used for all headings.
