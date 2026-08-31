#!/usr/bin/env bash
# Regenerates public/icons from the macOS icon bundles on this machine.
# Requires macOS (sips + swift). Run from the repo root.
set -euo pipefail
OUT="public/icons"
mkdir -p "$OUT"

extract_app() {
  local app="$1" name="$2" icns named
  named=$(defaults read "$app/Contents/Info" CFBundleIconFile 2>/dev/null | sed 's/\.icns$//' || true)
  icns="$app/Contents/Resources/${named}.icns"
  [ -f "$icns" ] || icns=$(ls "$app/Contents/Resources/"*.icns 2>/dev/null | head -1)
  [ -f "$icns" ] && sips -s format png -Z 128 "$icns" --out "$OUT/$name.png" >/dev/null && echo "✓ $name"
}

extract_app "/System/Applications/Utilities/Terminal.app" terminal
extract_app "/System/Library/CoreServices/Finder.app" finder
extract_app "/Applications/Google Chrome.app" chrome
extract_app "/System/Applications/Notes.app" notes
extract_app "/System/Applications/Photos.app" photos
extract_app "/System/Applications/Mail.app" mail
extract_app "/System/Applications/System Settings.app" settings

CT=/System/Library/CoreServices/CoreTypes.bundle/Contents/Resources
sips -s format png -Z 128 "$CT/GenericFolderIcon.icns" --out "$OUT/folder.png" >/dev/null
sips -s format png -Z 128 "$CT/DownloadsFolder.icns" --out "$OUT/folder-downloads.png" >/dev/null
sips -s format png -Z 128 "$CT/GenericDocumentIcon.icns" --out "$OUT/file.png" >/dev/null

# document-type icons come from NSWorkspace, not from disk
swift scripts/extract-doc-icons.swift "$OUT" "pdf:file-pdf" "txt:file-text" "png:file-image" "zip:file-zip" "key:file-key"
for f in "$OUT"/file-*.png; do sips -Z 128 "$f" --out "$f" >/dev/null; done

# the Dock composites the full trash from two layers
python3 - <<'PY'
from PIL import Image
D = "/System/Library/CoreServices/Dock.app/Contents/Resources"
bg = Image.open(f"{D}/s-trashfull-background@2x.png").convert("RGBA")
fg = Image.open(f"{D}/s-trashfull-clear@2x.png").convert("RGBA").resize(bg.size, Image.LANCZOS)
out = Image.alpha_composite(bg, fg); out.thumbnail((128, 128), Image.LANCZOS)
out.save("public/icons/trash.png")
PY
echo "done → $OUT"
