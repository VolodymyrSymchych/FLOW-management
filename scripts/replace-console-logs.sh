#!/bin/bash

# Script to replace console.log/error/warn with logger
# This script processes TypeScript files in services directory

echo "🔄 Replacing console.log with logger in services..."

# Find all TypeScript files in services (excluding node_modules and dist)
find services -name "*.ts" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -type f | while read -r file; do

  # Check if file contains console statements
  if grep -q "console\.\(log\|error\|warn\)" "$file"; then
    echo "  Processing: $file"

    # Create backup
    cp "$file" "$file.bak"

    # Replace console.log with logger.info
    sed -i '' 's/console\.log(/logger.info(/g' "$file"

    # Replace console.error with logger.error
    sed -i '' 's/console\.error(/logger.error(/g' "$file"

    # Replace console.warn with logger.warn
    sed -i '' 's/console\.warn(/logger.warn(/g' "$file"

    echo "  ✅ Updated: $file"
  fi
done

echo ""
echo "✅ Console replacement complete!"
echo ""
echo "Next steps:"
echo "1. Review changes with: git diff services/"
echo "2. Test the services"
echo "3. Remove backups: find services -name '*.bak' -delete"
echo "4. Commit changes"
