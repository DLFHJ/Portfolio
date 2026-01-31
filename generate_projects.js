const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\Projects\\Portfolio\\Portfolio';
const projectsDir = path.join(rootDir, 'assets', 'projects');

// Helper to find all project_info.txt files
function findProjectFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            // Skip the weird '0' directory in 'öbb' if it contains a project_info.txt that we want to ignore
            // But we actually walk everything and filter later based on content
            findProjectFiles(filePath, fileList);
        } else {
            if (file === 'project_info.txt') {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

const projectFiles = findProjectFiles(projectsDir);

const projects = [];

projectFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Parse Key-Values
    const lines = content.split(/\r?\n/);
    const data = {};
    let currentKey = null;
    let descriptionBuffer = [];
    let isDescription = false;

    lines.forEach(line => {
        const match = line.match(/^([A-Za-z ]+): ?(.*)$/);
        if (match && !isDescription) {
            const key = match[1].trim();
            const value = match[2].trim();
            if (key === 'Description') {
                isDescription = true;
                data[key] = value; // First line of description
            } else {
                data[key] = value;
            }
        } else if (isDescription) {
            descriptionBuffer.push(line);
        }
    });

    // Check if ID is valid
    if (!data['ID'] || data['ID'].trim() === '') {
        // Skip files without valid ID (like the one in öbb/0)
        return;
    }

    // Process Description
    const fullDescription = (data['Description'] || '') + '\n' + descriptionBuffer.join('\n');

    // Split by " - " (isolated dashes)
    // Regex to match - on its own line or surrounded by spaces
    const parts = fullDescription.split(/\n\s*-\s*\n/);

    // Clean parts
    const textBlocks = parts.map(p => p.trim()).filter(p => p.length > 0);

    // Find Images in the directory
    const dir = path.dirname(filePath);
    const files = fs.readdirSync(dir);

    // Helper to find image by number
    const findImage = (num) => {
        const exts = ['.jpg', '.png', '.jpeg', '.gif', '.webp'];
        for (const ext of exts) {
            const name = `${num}${ext}`;
            if (files.includes(name)) {
                // Return relative path for HTML
                // Path from d:\Projects\Portfolio\Portfolio\index.html to image
                // Image path: dir + name
                // Relative: Path.relative(rootDir, dir) + / + name
                let relPath = path.relative(rootDir, path.join(dir, name));
                return relPath.replace(/\\/g, '/');
            }
        }
        return null;
    };

    const heroImage = findImage(0); // Image 0
    // If no hero image found, use 1 or placeholder?
    // Sanolux has 0.jpg. ÖBB only has 1.png. 
    // We'll use 1.png as hero if 0 is missing, but prefer 0.
    // Wait, if I use 1.png as hero, I shouldn't use it in blocks?
    // Let's assume 0 is hero. If missing, we might leave it empty or default.
    // For ÖBB, we know 0 is missing. Let's see if we can find *any* image to use as hero if 0 is missing.
    // But be careful not to reuse it in blocks if possible, or maybe it's fine.

    let actualHero = heroImage;
    if (!actualHero) {
        // fallback
        const firstImg = findImage(1);
        if (firstImg) actualHero = firstImg;
    }

    // Build Blocks
    const blocks = [];
    textBlocks.forEach((text, index) => {
        // Description (first block) goes to main description field, so we skip it?
        // Wait, the main description is usually short. "Summary".
        // The text blocks are the detailed walkthrough.
        // Let's use the FIRST part as the main 'description' field.
        // And the rest as blocks.
        // BUT, we also need to include the first part in the blocks if we want it shown in the modal body?
        // The modal has a header description.
        // Usually the header description is a summary.
        // If the first block is long, maybe we should trunc it?
        // Let's use the entire first block as the summary description.
        // And for the modal body, we start with the *second* block?
        // Or maybe all blocks including the first one go into the body?
        // The modal design has a "Description" at the top.
        // If I put the same text in the body, it's duplicated.
        // So: Start blocks from index 0 or 1?
        // If I have Text A - Text B.
        // Description = Text A.
        // Blocks = Text B + Image 1?

        if (index === 0) return; // Skip first block as it's the main description

        // For subsequent blocks, we pair with images starting from 1
        // (If we used 1 as hero, we should start from 2? No, let's stick to 1-based indexing for content images)
        // Image index = index. (Block 1 uses Image 1, Block 2 uses Image 2...)
        const img = findImage(index);

        let block = {};
        if (img) {
            block = {
                type: 'image-text',
                image: img,
                text: {
                    en: text, de: text // Assuming text is English or mixed. We don't have translations in text file.
                }
            };
        } else {
            block = {
                type: 'text-only',
                text: text
            };
        }
        blocks.push(block);
    });

    projects.push({
        id: data['ID'],
        originalName: data['Project Name'],
        title: { en: data['Project Name'], de: data['Project Name'] },
        category: { en: data['Category'], de: data['Category'] },
        status: data['Status'],
        year: data['Key Dates'],
        tools: data['Technologies'],
        heroImage: actualHero,
        description: { en: textBlocks[0], de: textBlocks[0] }, // First block handles main description
        role: { en: "Designer", de: "Designer" }, // Role not always in file? 
        // Some files don't have Role. Use generic or empty.
        // Actually, some files have "My role focused on..." in text.
        blocks: blocks,
        // For sorting
        isMain: filePath.includes('assets\\projects\\main')
    });
});

// Sort Projects
// Move Main projects to top?
// And reassign IDs 1-N
projects.sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return a.originalName.localeCompare(b.originalName);
});

// Re-assign IDs
projects.forEach((p, i) => {
    p.newId = i + 1;
});

// Generate JSON
const jsonOutput = {};
projects.forEach(p => {
    jsonOutput[p.newId] = {
        title: p.title,
        category: p.category,
        heroImage: p.heroImage || "",
        description: p.description,
        role: p.role,
        year: p.year,
        tools: p.tools,
        blocks: p.blocks
    };
});

console.log("JSON OBJECT START");
console.log(JSON.stringify(jsonOutput, null, 2));
console.log("JSON OBJECT END");

// Generate HTML
// We need to generate the grid items.
// Using template based on index.html
/*
<div class="reveal-on-scroll group cursor-pointer" onclick="openModal(${newId})">
    <div class="hover-target relative aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
        <img src="${heroImage}"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="${title}">
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
    </div>
    <div class="flex justify-between items-start">
        <div>
            <h3 class="text-lg font-semibold">${title}</h3>
            <p class="text-sm text-gray-500">${category}</p>
        </div>
    </div>
</div>
*/

let visibleHtml = "";
let hiddenHtml = "";

projects.forEach((p, i) => {
    const html = `
    <!-- Project ${p.newId} -->
    <div class="reveal-on-scroll group cursor-pointer ${i >= 3 ? '' : ''}" onclick="openModal(${p.newId})">
        <div class="hover-target relative aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
            <img src="${p.heroImage || 'https://via.placeholder.com/800x600?text=No+Image'}"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="${p.title.en}"
                onerror="this.src='https://via.placeholder.com/800x600?text=Image+Unavailable'">
            <div
                class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300">
            </div>
        </div>
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-semibold">${p.title.en}</h3>
                <p class="text-sm text-gray-500">${p.category.en}</p>
            </div>
        </div>
    </div>`

    if (i < 3) {
        visibleHtml += html;
    } else {
        hiddenHtml += html;
    }
});

console.log("HTML VISIBLE START");
console.log(visibleHtml);
console.log("HTML VISIBLE END");

console.log("HTML HIDDEN START");
console.log(hiddenHtml);
console.log("HTML HIDDEN END");
