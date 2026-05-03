#!/bin/bash

# Runs once per Claude session (Stop hook) to append one activity entry to README.md.
# Uses `git status` to determine what actually changed this session.

README_FILE="$CLAUDE_PROJECT_DIR/README.md"

# Bail if README itself doesn't exist
[ -f "$README_FILE" ] || exit 0

# Collect changed files from git (staged + unstaged, excluding README)
CHANGED_FILES=$(git -C "$CLAUDE_PROJECT_DIR" status --porcelain 2>/dev/null \
    | awk '{print $NF}' \
    | grep -v "README.md" \
    | tr '\n' ' ')

# Skip if nothing changed
[ -z "$CHANGED_FILES" ] && exit 0

# Derive a description from the changed file set
describe_changes() {
    local files="$1"
    if echo "$files" | grep -qE "pages/.*\.astro"; then
        echo "更新頁面架構"
    elif echo "$files" | grep -qE "components/.*\.astro"; then
        echo "優化 Astro UI 元件"
    elif echo "$files" | grep -qE "\.(tsx|jsx)"; then
        echo "改進 React 元件"
    elif echo "$files" | grep -qE "config/"; then
        echo "調整專案配置"
    elif echo "$files" | grep -qE "lib/|utils/"; then
        echo "優化工具函數"
    elif echo "$files" | grep -qE "content/blog/"; then
        echo "新增或編輯部落格文章"
    elif echo "$files" | grep -qE "content/"; then
        echo "更新內容資料"
    elif echo "$files" | grep -qE "\.(css|scss)"; then
        echo "調整樣式設計"
    elif echo "$files" | grep -qE "package\.json|pnpm-lock\.yaml"; then
        echo "更新專案依賴"
    elif echo "$files" | grep -qE "astro\.config|tsconfig|tailwind\.config"; then
        echo "調整建置配置"
    elif echo "$files" | grep -qE "\.astro"; then
        echo "更新 Astro 元件"
    elif echo "$files" | grep -qE "\.(ts|js)"; then
        echo "更新程式邏輯"
    else
        echo "專案檔案更新"
    fi
}

ACTIVITY_DESC=$(describe_changes "$CHANGED_FILES")
TIMESTAMP=$(date '+%Y-%m-%d')

# Ensure the activity section header exists
if ! grep -q "## 開發活動紀錄" "$README_FILE"; then
    printf '\n## 開發活動紀錄\n\n*由 Claude Code Hooks 自動追蹤*\n\n' >> "$README_FILE"
fi

# Prepend new entry; keep last 10
TEMP=$(mktemp)
awk -v entry="- **${TIMESTAMP}**: ${ACTIVITY_DESC}" '
    /^## 開發活動紀錄/ {
        print
        in_section=1
        next
    }
    in_section && /^\*由 Claude/ {
        print
        print ""
        print entry
        count=1
        next
    }
    in_section && /^- \*\*/ {
        if (count < 10) { print; count++ }
        next
    }
    { print }
' "$README_FILE" > "$TEMP"

mv "$TEMP" "$README_FILE"
echo "README.md updated: $ACTIVITY_DESC ($TIMESTAMP)"
