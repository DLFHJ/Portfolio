# Portfolio Website

Hello, my name is David Lasslberger and I am a Interaction & UX Designer.

This README contains technical information about the portfolio website's structure and configuration.

## External Libraries (CDN)

*   **Tailwind CSS**: Used for all styling and layout (`cdn.tailwindcss.com`).
*   **Lucide Icons**: Used for icons like the menu, arrows, and external links (`unpkg.com/lucide`).
*   **Google Fonts**: Used for "IBM Plex Sans" and "Material Symbols".

## Project JSON Configuration

Each project description in `assets/projects/` is defined by a `project_info.json` file. This file controls the content and layout of the project detail modal.

### Root Object

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier. Must match the folder name/key. |
| `title` | `string` \| `object` | Project title. Use `{"en": "...", "de": "..."}` for translations. |
| `category` | `string` \| `object` | Project category (e.g., "Interaction Design"). |
| `role` | `string` \| `object` | Your role in the project. |
| `year` | `string` \| `number` | Year of the project. |
| `tools` | `array` | List of tools used (e.g., `["Figma", "TouchDesigner"]`). |
| `heroImage` | `string` | Path to the main cover image. |
| `description` | `string` \| `object` | Short description shown in the header. |
| `sections` | `array` | List of content sections (see below). |

### Section Object

Sections define the layout blocks of the project detail view.

| Property | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | `content` (generic), `gallery` (image grid) | The type of section. |
| `layout` | `string` | `grid`, `full-bleed`, `centered`, `editorial-split`, `offset` | Determines arrangement. |
| `width` | `string` | `full` | Optional. Forces section to be full-width. |
| `columns` | `number` | `2`, `3` | **(Grid only)** Number of columns. Default is 3. |
| `items` | `array` | - | List of items in the section. |

### Item Object

Items are the individual content pieces (images, text) within a section.

#### Common Properties
| Property | Type | Options | Description |
| :--- | :--- | :--- | :--- |
| `role` | `string` | `image`, `text`, `spacer` | Defines content type. |
| `width` | `string` | `small` (4 cols), `medium` (6 cols), `large` (9 cols), `xlarge` (10 cols), `full` (12 cols) | Item width. |
| `align` | `string` | `left`, `center`, `right` | Text/content alignment. |

#### Role: "image"
| Property | Type | Description |
| :--- | :--- | :--- |
| `src` | `string` | Path to the image file. |
| `caption` | `string` \| `object` | Optional caption text. |
| `className` | `string` | Optional custom CSS classes. |

#### Role: "text"
| Property | Type | Description |
| :--- | :--- | :--- |
| `content` | `string` \| `object` | The text content (supports HTML). |

#### Role: "spacer"
| Property | Type | Options |
| :--- | :--- | :--- |
| `height` | `string` | `small` (1rem), `medium` (3rem), `large` (6rem), `xlarge` (8rem). |
