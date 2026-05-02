#!/bin/bash

# Hook script to intelligently update README.md with meaningful development activity
# This runs after Edit, Write, or MultiEdit tool usage

# Exit if README.md is the file being modified to prevent infinite loops
if echo "$CLAUDE_LAST_TOOL_USE" | grep -q "README.md"; then
    exit 0
fi

# Function to generate meaningful activity description
generate_activity_description() {
    local changed_files="$1"
    local description=""
    
    # Analyze file types and patterns to generate meaningful descriptions
    if echo "$changed_files" | grep -q "\.astro"; then
        if echo "$changed_files" | grep -q "pages/"; then
            description="更新頁面架構"
        elif echo "$changed_files" | grep -q "components/"; then
            description="優化 UI 元件"
        elif echo "$changed_files" | grep -q "layouts/"; then
            description="調整布局設計"
        else
            description="更新 Astro 元件"
        fi
    elif echo "$changed_files" | grep -q "\.tsx\|\.jsx"; then
        description="改進 React 元件"
    elif echo "$changed_files" | grep -q "\.vue"; then
        description="更新 Vue 元件"
    elif echo "$changed_files" | grep -q "\.ts\|\.js"; then
        if echo "$changed_files" | grep -q "config/"; then
            description="調整專案配置"
        elif echo "$changed_files" | grep -q "lib/\|utils/"; then
            description="優化工具函數"
        else
            description="更新程式邏輯"
        fi
    elif echo "$changed_files" | grep -q "\.md\|\.mdx"; then
        if echo "$changed_files" | grep -q "content/blog/"; then
            description="新增/編輯部落格文章"
        elif echo "$changed_files" | grep -q "content/"; then
            description="更新內容資料"
        else
            description="編輯 Markdown 文件"
        fi
    elif echo "$changed_files" | grep -q "\.css\|\.scss"; then
        description="調整樣式設計"
    elif echo "$changed_files" | grep -q "package\.json\|pnpm-lock\.yaml"; then
        description="更新專案依賴"
    elif echo "$changed_files" | grep -q "astro\.config\|tsconfig\|tailwind\.config"; then
        description="調整建置配置"
    else
        description="專案檔案更新"
    fi
    
    echo "$description"
}

# Get recently modified files in the project
if [ -d .git ]; then
    # Get files modified in the last 5 minutes, excluding README.md
    CHANGED_FILES=$(find . -path './node_modules' -prune -o -path './.git' -prune -o \
        \( -name "*.astro" -o -name "*.tsx" -o -name "*.ts" -o -name "*.vue" -o \
           -name "*.js" -o -name "*.jsx" -o -name "*.md" -o -name "*.json" -o \
           -name "*.css" -o -name "*.scss" \) \
        -not -name "README.md" -newer README.md -print 2>/dev/null | head -10)
    
    if [ -n "$CHANGED_FILES" ]; then
        ACTIVITY_DESC=$(generate_activity_description "$CHANGED_FILES")
    else
        ACTIVITY_DESC="程式碼結構優化"
    fi
else
    ACTIVITY_DESC="開發進度更新"
fi

# Current timestamp
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Update README.md with change log entry
README_FILE="README.md"

# Check if Development Activity section exists, if not create it
if ! grep -q "## 🔄 Development Activity" "$README_FILE" 2>/dev/null; then
    # Add Development Activity section at the end
    echo "" >> "$README_FILE"
    echo "## 🔄 Development Activity" >> "$README_FILE"
    echo "" >> "$README_FILE"
    echo "*AI 協作開發活動自動追蹤，記錄專案架構與功能演進*" >> "$README_FILE"
    echo "" >> "$README_FILE"
fi

# Add the change entry (limit to last 10 entries)
TEMP_FILE=$(mktemp)
{
    # Get everything before the Development Activity section
    sed -n '1,/## 🔄 Development Activity/p' "$README_FILE"
    echo ""
    echo "*AI 協作開發活動自動追蹤，記錄專案架構與功能演進*"
    echo ""
    echo "- **$TIMESTAMP**: $ACTIVITY_DESC"
    # Get existing entries (skip the description line and empty lines, take only the last 9)
    grep "^- \*\*[0-9]" "$README_FILE" 2>/dev/null | head -9 || true
    echo ""
} > "$TEMP_FILE"

# Replace README.md with updated content
mv "$TEMP_FILE" "$README_FILE"

echo "README.md updated with activity: $ACTIVITY_DESC at $TIMESTAMP"