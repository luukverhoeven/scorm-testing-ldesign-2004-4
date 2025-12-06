# SCORM 2004 4th Edition Test Tool

A simple, user-friendly tool to test if your Learning Management System (LMS) correctly tracks course progress, grades, and bookmarks. Works with Moodle, SCORM Cloud, Blackboard, and any SCORM 2004 compliant LMS.

---

# For End Users

**No technical knowledge required** - just download, upload, and click buttons!

## Download

**[Download the latest release](../../releases/latest)** - Get `scorm-package.zip` ready to upload to your LMS.

## Quick Start

1. Download `scorm-package.zip` from the [Releases page](../../releases/latest)
2. Upload to your LMS as a **SCORM 2004** package
3. Launch the course and start testing!

## Testing Guide

### Test 1: Verify Grades Work

1. Launch the course
2. Click the green **Pass Test** button
3. Click **Close & Save**
4. Check your LMS gradebook - should show 100% and "Passed"

### Test 2: Verify Resume/Bookmarking Works

1. Launch the course
2. Click the blue **Suspend Test** button
3. Click **Close & Save**
4. Reopen the course from your LMS
5. You should see:
   - "Resumed Session!" banner
   - Bookmark showing "Page 5 - Section A"

### Test 3: Visual Restore Test

1. Launch the course
2. Move the **Visual Restore Test** slider to any position (e.g., 73%)
3. Click **Save Slider Position**
4. Click **Close & Save**
5. Reopen the course - the slider should restore to your saved position with a green "RESTORED!" badge

### Test 4: Verify Failure States Work

1. Launch the course
2. Click the red **Fail Test** button
3. Click **Close & Save**
4. Check your LMS gradebook - should show 0% and "Failed"

### Test 5: Custom Grade

1. Use the **grade slider** to set any score (0-100)
2. Click **Set Grade**
3. Click **Close & Save**
4. Verify the exact grade appears in your LMS

## Quick Test Buttons

| Button | What it Tests | What to Check in LMS |
|--------|---------------|---------------------|
| **Pass Test** (green) | Grade reporting | Gradebook shows 100% and "Passed" |
| **Fail Test** (red) | Failure states | Gradebook shows 0% and "Failed" |
| **Suspend Test** (blue) | Bookmarking/Resume | Reopen course - should show "Resumed Session" |

## Features

- **One-click test scenarios** - Pass, Fail, and Suspend tests
- **Visual restore test** - Slider that shows if data persistence works
- **Visual status dashboard** - See progress, result, grade, and bookmark at a glance
- **Toast notifications** - Clear feedback for every action
- **Score slider** - Set any grade from 0-100%
- **Student info display** - See learner ID, name, and LMS settings

## Troubleshooting Tests

Find LMS limits and issues (click "Troubleshooting Tests" to expand):

| Test | What it Checks |
|------|----------------|
| **1KB / 10KB / 32KB / 64KB** | How much data your LMS can store |
| **Special Characters** | Unicode, emojis, HTML encoding support |
| **Rapid Commits** | If LMS handles quick successive saves |
| **Score Edge Cases** | Boundary values (0, 100, -1.0, 1.0) |
| **Long Bookmark** | Maximum bookmark length |

## Common Issues

### "Connection Failed" on launch
- Ensure the package is uploaded as **SCORM 2004** (not SCORM 1.2)
- Check that your LMS supports SCORM 2004 4th Edition
- Try a different browser

### Grades not appearing in LMS
- Make sure you clicked **Close & Save** after setting values
- Some LMS platforms require a page refresh to show updated grades
- Check your LMS SCORM settings for grade synchronization options

### Resume not working
- Ensure you selected "Save progress & return later" before closing
- Some LMS platforms have settings that control resume behavior
- Use the **Visual Restore Test** to verify data persistence

---

# For Developers

## Building from Source

### Requirements
- Node.js 18+
- npm

### Commands

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Build production package
npm run package
```

This creates `scorm-package.zip` in the project root.

### Package Contents

The `scorm-package.zip` contains:
- `index.html` - Main application
- `assets/` - Bundled JavaScript (React + Vite)
- `imsmanifest.xml` - SCORM 2004 4th Edition manifest
- `metadata.json` - Package metadata

## Advanced Options

Click "Show Advanced Options" in the tool to access:
- Manual completion/success status controls
- Custom bookmark and suspend data input
- Question interaction recording
- Full SCORM API transaction log
- Export logs as JSON

## SCORM Data Model Elements

The tool tests these SCORM 2004 elements:

| Element | Description |
|---------|-------------|
| `cmi.completion_status` | Course progress (complete/incomplete) |
| `cmi.success_status` | Pass/fail result |
| `cmi.score.raw` | Grade (0-100) |
| `cmi.score.scaled` | Normalized grade (-1.0 to 1.0) |
| `cmi.location` | Bookmark position (up to 1000 chars) |
| `cmi.suspend_data` | Custom saved data (up to 64KB) |
| `cmi.session_time` | Time spent in session (ISO 8601) |
| `cmi.exit` | Exit type (suspend, normal, logout, time-out) |

### Read-only Elements Displayed

| Element | Description |
|---------|-------------|
| `cmi.learner_id` | User ID from LMS |
| `cmi.learner_name` | User name from LMS |
| `cmi.entry` | Entry type (ab-initio, resume) |
| `cmi.mode` | Launch mode (normal, browse, review) |
| `cmi.credit` | Credit status |
| `cmi.total_time` | Cumulative time from previous sessions |
| `cmi.scaled_passing_score` | Passing threshold |
| `cmi.completion_threshold` | Completion threshold |
| `cmi.progress_measure` | Current progress (0.0-1.0) |
| `cmi.objectives._count` | Number of objectives |
| `cmi.interactions._count` | Number of interactions |

## CI/CD

This project uses GitHub Actions for automated builds:

- **On every push/PR to main**: Builds and validates the package, uploads as artifact
- **On version tags (`v*`)**: Creates a GitHub Release with `scorm-package.zip`

### Creating a Release

```bash
# Tag the release
git tag v1.0.0

# Push the tag to trigger the release workflow
git push origin v1.0.0
```

The workflow will automatically:
1. Build the SCORM package
2. Create a GitHub Release
3. Attach `scorm-package.zip` as a downloadable asset
4. Generate release notes from commits

### Workflow Files

- `.github/workflows/build.yml` - CI build on push/PR
- `.github/workflows/release.yml` - Release on version tags

## Project Structure

```
├── App.tsx              # Main React application
├── types.ts             # TypeScript interfaces
├── services/
│   └── scormService.ts  # SCORM API wrapper
├── components/
│   ├── Button.tsx       # Reusable button component
│   └── LogConsole.tsx   # API transaction log display
├── scripts/
│   └── build-scorm.sh   # Build script
├── imsmanifest.xml      # SCORM manifest
└── .github/workflows/   # CI/CD workflows
```

## License

MIT License - Use freely for testing your LMS implementations.
