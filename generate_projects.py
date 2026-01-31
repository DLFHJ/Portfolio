import os
import re
import json

root_dir = r"d:\Projects\Portfolio\Portfolio"
projects_dir = os.path.join(root_dir, "assets", "projects")

project_list = []

def find_project_files(dir_path):
    files = []
    for root, dirnames, filenames in os.walk(dir_path):
        if "project_info.txt" in filenames:
            if os.path.basename(root) == '0' and 'öbb' in root:
                 continue
            files.append(os.path.join(root, "project_info.txt"))
    return files

project_files = find_project_files(projects_dir)

def find_image(root, num):
    try:
        image_files = [f for f in os.listdir(root) if f.lower().endswith(('.jpg', '.png', '.jpeg', '.gif', '.webp', '.mp4'))]
    except OSError:
        return None

    for ext in ['.jpg', '.png', '.jpeg', '.gif', '.webp', '.mp4']:
        name = f"{num}{ext}"
        if name in image_files:
            path_rel = os.path.relpath(os.path.join(root, name), root_dir).replace("\\", "/")
            return path_rel

    for suffix in ['a', 'b', 'c', 'd', 'e']:
        for ext in ['.jpg', '.png', '.jpeg', '.gif', '.webp', '.mp4']:
            name = f"{num}{suffix}{ext}"
            for f in image_files:
                if f.lower() == name.lower():
                     path_rel = os.path.relpath(os.path.join(root, f), root_dir).replace("\\", "/")
                     return path_rel
    return None

for file_path in project_files:
    root = os.path.dirname(file_path)
    content = ""
    try:
        with open(file_path, "r", encoding="utf-8-sig") as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, "r", encoding="latin-1") as f:
                content = f.read()
        except:
            continue

    data = {}
    lines = content.splitlines()
    is_description = False
    description_lines = []
    
    for line in lines:
        match = re.match(r"^([A-Za-z ]+): ?(.*)$", line)
        if match and not is_description:
            key = match.group(1).strip()
            val = match.group(2).strip()
            if key == "Description":
                is_description = True
                data[key] = val
            else:
                data[key] = val
        elif is_description:
            description_lines.append(line)
    
    if "ID" not in data or not data["ID"]:
        continue
        
    full_desc = (data.get("Description", "") + "\n" + "\n".join(description_lines)).strip()
    parts = re.split(r'\n\s*-\s*\n', full_desc)
    blocks_text = [p.strip() for p in parts if p.strip()]
    
    hero_image = find_image(root, 0)
    display_hero = hero_image if hero_image else find_image(root, 1)
    
    project_blocks = []
    main_desc = blocks_text[0] if blocks_text else ""
    
    for idx, text in enumerate(blocks_text):
        if idx == 0: continue
        img_path = find_image(root, idx)
        block = {}
        if img_path:
            block = {
                "type": "image-text",
                "image": img_path, 
                "text": {"en": text, "de": text}
            }
        else:
            block = {
                "type": "text-only",
                "text": {"en": text, "de": text}
            }
        project_blocks.append(block)
        
    project_list.append({
        "original_id": data.get("ID"),
        "original_name": data.get("Project Name"),
        "category": data.get("Category", "Design"),
        "status": data.get("Status", ""),
        "year": data.get("Key Dates", ""),
        "tools": data.get("Technologies", ""),
        "hero_image": display_hero,
        "description": main_desc,
        "blocks": project_blocks,
        "is_main": "main" in root
    })

project_list.sort(key=lambda x: (not x["is_main"], x["original_name"]))

final_projects = {}
html_visible = ""
html_hidden = ""

for i, p in enumerate(project_list):
    new_id = i + 1
    final_projects[new_id] = {
        "title": {"en": p["original_name"], "de": p["original_name"]},
        "category": {"en": p["category"], "de": p["category"]},
        "heroImage": p["hero_image"] if p["hero_image"] else "",
        "description": {"en": p["description"], "de": p["description"]},
        "role": {"en": "Designer", "de": "Designer"},
        "year": p["year"],
        "tools": p["tools"],
        "blocks": p["blocks"]
    }
    
    html_chunk = f"""
    <!-- Project {new_id} -->
    <div class="reveal-on-scroll group cursor-pointer" onclick="openModal({new_id})">
        <div class="hover-target relative aspect-[4/3] bg-gray-100 overflow-hidden mb-4">
            <img src="{p["hero_image"] or 'https://via.placeholder.com/800'}"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="{p["original_name"]}"
                onerror="this.src='https://via.placeholder.com/800x600?text=Image+Unavailable'">
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-lg font-semibold">{p["original_name"]}</h3>
                <p class="text-sm text-gray-500">{p["category"]}</p>
            </div>
        </div>
    </div>
    """
    
    if i < 3:
        html_visible += html_chunk
    else:
        html_hidden += html_chunk

with open("output.txt", "w", encoding="utf-8") as f:
    f.write("JSON_START\n")
    f.write(json.dumps(final_projects, indent=4))
    f.write("\nJSON_END\n")
    f.write("HTML_VISIBLE_START\n")
    f.write(html_visible)
    f.write("\nHTML_VISIBLE_END\n")
    f.write("HTML_HIDDEN_START\n")
    f.write(html_hidden)
    f.write("\nHTML_HIDDEN_END\n")
