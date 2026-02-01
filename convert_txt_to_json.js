const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const projectsDir = path.join(rootDir, 'assets', 'projects');

// Helper to find all project_info.txt files
function findProjectFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            findProjectFiles(filePath, fileList);
        } else {
            if (file === 'project_info.txt') {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

const txtFiles = findProjectFiles(projectsDir);

txtFiles.forEach(txtPath => {
    const dir = path.dirname(txtPath);
    const jsonPath = path.join(dir, 'project_info.json');

    // Skip if JSON already exists (e.g. Sonolux)
    /*if (fs.existsSync(jsonPath)) {
        console.log(`Skipping ${dir} - JSON already exists`);
        return;
    }*/

    console.log(`Converting ${txtPath}...`);

    const content = fs.readFileSync(txtPath, 'utf-8').replace(/^\uFEFF/, '');
    const lines = content.split(/\r?\n/);
    const data = {};
    let isDescription = false;
    let descriptionBuffer = [];

    lines.forEach(line => {
        const match = line.match(/^([A-Za-z ]+): ?(.*)$/);
        if (match && !isDescription) {
            const key = match[1].trim();
            const value = match[2].trim();
            if (key === 'Description') {
                isDescription = true;
                data[key] = value;
            } else {
                data[key] = value;
            }
        } else if (isDescription) {
            descriptionBuffer.push(line);
        }
    });

    // Valid check
    if (!data['ID'] || data['ID'].trim() === '') {
        console.log(`Skipping ${dir} - No valid ID`);
        return;
    }

    const fullDescription = (data['Description'] || '') + '\n' + descriptionBuffer.join('\n');
    const parts = fullDescription.split(/\n\s*-\s*\n/); // Split by isolated dashes
    const textBlocks = parts.map(p => p.trim()).filter(p => p.length > 0);

    // Helpers for images
    const projectFiles = fs.readdirSync(dir);
    const findImageName = (num) => {
        const exts = ['.jpg', '.png', '.jpeg', '.gif', '.webp'];
        for (const ext of exts) {
            const name = `${num}${ext}`;
            if (projectFiles.includes(name)) {
                return name;
            }
        }
        return null;
    };

    const heroImage = findImageName(0) || findImageName(1) || "";

    // Build Blocks
    let maxImgNum = 0;
    while (true) {
        if (findImageName(maxImgNum + 1)) {
            maxImgNum++;
        } else {
            break;
        }
    }
    const maxIndex = Math.max(textBlocks.length - 1, maxImgNum);
    const blocks = [];

    for (let i = 1; i <= maxIndex; i++) {
        const text = textBlocks[i] || "";
        const img = findImageName(i);

        if (img) {
            blocks.push({
                type: "image-text",
                image: img,
                text: { en: text, de: text }
            });
        } else if (text) {
            blocks.push({
                type: "text-only", // Matching generate_projects.js internal type, though Sonolux uses mostly image-text. 
                // Sonolux example handles empty text in image-text blocks too.
                // If no image, generate_projects uses text-only.
                text: { en: text, de: text }
            });
        }
    }

    const json = {
        id: parseInt(data['ID']) || data['ID'], // Try to parse as int
        projectName: data['Project Name'],
        title: {
            en: data['Project Name'],
            de: data['Project Name']
        },
        category: {
            en: data['Category'],
            de: data['Category']
        },
        status: data['Status'] || "",
        year: data['Key Dates'] || "",
        technologies: data['Technologies'] || "",
        heroImage: heroImage,
        description: {
            en: textBlocks[0] || "",
            de: textBlocks[0] || ""
        },
        blocks: blocks
    };

    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
    console.log(`Created ${jsonPath}`);
});
