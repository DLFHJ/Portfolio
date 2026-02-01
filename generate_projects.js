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

// Helper to check if JSON exists for a directory
function getJsonPath(txtPath) {
    const dir = path.dirname(txtPath);
    const jsonPath = path.join(dir, 'project_info.json');
    if (fs.existsSync(jsonPath)) {
        return jsonPath;
    }
    return null;
}

// We might have duplicates if we list both txt and json, or if we stick to listing folders.
// The current findProjectFiles finds 'project_info.txt'.
// Let's change how we iterate. We have a list of txt files.
// For each txt file, check if there is a sibling json file.
// If yes, use JSON and SKIP the txt parsing.
// If no, parse txt.

projectFiles.forEach(txtFilePath => {
    const jsonFilePath = getJsonPath(txtFilePath);

    if (jsonFilePath) {
        // Parse JSON
        const content = fs.readFileSync(jsonFilePath, 'utf-8');
        try {
            const data = JSON.parse(content);

            // Resolve Images in Blocks
            // In JSON, user might specify "1.jpg". We need to resolve to relative path "assets/projects/..."
            const dir = path.dirname(jsonFilePath);

            const resolveImg = (imgName) => {
                if (!imgName) return "";
                const absolutePath = path.join(dir, imgName);
                if (fs.existsSync(absolutePath)) {
                    let relPath = path.relative(rootDir, absolutePath);
                    return relPath.replace(/\\/g, '/');
                }
                return ""; // Or placeholder
            };

            const heroImage = resolveImg(data.heroImage);

            const blocks = (data.blocks || []).map(b => {
                return {
                    type: b.type,
                    image: resolveImg(b.image),
                    text: b.text
                };
            });

            projects.push({
                id: data.id,
                originalName: data.projectName,
                title: data.title,
                category: data.category,
                status: data.status,
                year: data.year, // JSON uses "year" or "lines" uses "Key Dates"
                tools: data.technologies, // JSON "technologies", txt "Technologies"
                heroImage: heroImage,
                description: data.description,
                role: { en: "Designer", de: "Designer" }, // Could add to JSON
                blocks: blocks,
                isMain: jsonFilePath.includes('assets\\projects\\main')
            });

        } catch (e) {
            console.error("Error parsing JSON:", jsonFilePath, e);
        }

    } else {
        // Parse TXT (Legacy Logic)
        const filePath = txtFilePath;
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

        let actualHero = heroImage;
        if (!actualHero) {
            // fallback
            const firstImg = findImage(1);
            if (firstImg) actualHero = firstImg;
        }

        // Build Blocks
        // Verify how many images exist
        let maxImgNum = 0;
        while (true) {
            if (findImage(maxImgNum + 1)) {
                maxImgNum++;
            } else {
                break;
            }
        }

        const maxIndex = Math.max(textBlocks.length - 1, maxImgNum);

        const blocks = [];
        for (let i = 1; i <= maxIndex; i++) {
            const text = textBlocks[i] || "";
            const img = findImage(i);

            let block = {};
            if (img) {
                block = {
                    type: 'image-text',
                    image: img,
                    text: {
                        en: text, de: text
                    }
                };
            } else if (text) {
                block = {
                    type: 'text-only',
                    text: {
                        en: text, de: text
                    }
                };
            } else {
                continue;
            }
            blocks.push(block);
        }

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
            blocks: blocks,
            // For sorting
            isMain: filePath.includes('assets\\projects\\main')
        });
    }
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
