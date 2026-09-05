import os
import re

def check_frontend_integrity():
    src_dir = os.path.join("frontend", "src")
    broken = []
    checked = 0
    all_files = []

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".jsx", ".js")):
                checked += 1
                full_path = os.path.join(root, file)
                all_files.append(full_path)
                with open(full_path, "r", encoding="utf-8") as f:
                    content = f.read()

                matches = re.findall(r'from\s+[\'"](\.[^\'"]+)[\'"]', content)
                for rel_path in matches:
                    target = os.path.normpath(os.path.join(root, rel_path))
                    candidates = [
                        target,
                        target + ".js",
                        target + ".jsx",
                        target + ".json",
                        target + ".css",
                        os.path.join(target, "index.js"),
                        os.path.join(target, "index.jsx"),
                    ]
                    if not any(os.path.exists(c) for c in candidates):
                        broken.append((full_path, rel_path))

    print(f"Checked {checked} frontend files.")
    if broken:
        print("BROKEN IMPORTS FOUND:")
        for f, imp in broken:
            print(f"  {f} -> {imp}")
    else:
        print("SUCCESS: All relative imports exist and resolve!")

if __name__ == "__main__":
    check_frontend_integrity()
