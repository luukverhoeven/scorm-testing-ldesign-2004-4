#!/bin/bash
# Build SCORM 2004 4th Edition package
# Creates a valid SCORM package with imsmanifest.xml at the root

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
PACKAGE_NAME="scorm-package.zip"

cd "$PROJECT_DIR"

echo "Building SCORM 2004 4th Edition package..."

# Clean previous build
echo "  Cleaning previous build..."
rm -rf dist
rm -f "$PACKAGE_NAME"

# Build with Vite
echo "  Running Vite build..."
npm run build

# Copy manifest to dist
echo "  Copying imsmanifest.xml..."
cp imsmanifest.xml dist/

# Copy metadata if exists
if [ -f metadata.json ]; then
    cp metadata.json dist/
fi

# Create ZIP from contents of dist (CRITICAL: contents only, not the folder)
echo "  Creating ZIP package..."
cd dist
zip -r "../$PACKAGE_NAME" ./*
cd ..

# Verify the package structure
echo ""
echo "Package contents:"
unzip -l "$PACKAGE_NAME" | head -20

echo ""
echo "✓ SCORM package created: $PACKAGE_NAME"
echo "  Ready to upload to your LMS (Moodle, SCORM Cloud, etc.)"
