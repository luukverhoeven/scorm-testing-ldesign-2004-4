# SCORM 2004 4th Edition Test Tool

A simple, user-friendly tool to test if your Learning Management System (LMS) correctly tracks course progress, grades, and bookmarks. Works with Moodle, SCORM Cloud, Blackboard, and any SCORM 2004 compliant LMS.

**No technical knowledge required** - just click buttons and check your LMS!

## Download

**[Download the latest release](../../releases/latest)** - Get `scorm-package.zip` ready to upload to your LMS.

Or build from source (see below).

## Quick Start

### 1. Get the Package

**Option A:** Download `scorm-package.zip` from the [Releases page](../../releases/latest)

**Option B:** Build from source:
```bash
npm install
npm run package
```

### 2. Upload to Your LMS

Upload the `scorm-package.zip` file to your LMS as a SCORM 2004 package.

### 3. Run Tests

Launch the course and use the **Quick Tests** buttons:

| Button | What it Tests | What to Check in LMS |
|--------|---------------|---------------------|
| **Pass Test** (green) | Grade reporting | Gradebook shows 100% and "Passed" |
| **Fail Test** (red) | Failure states | Gradebook shows 0% and "Failed" |
| **Suspend Test** (blue) | Bookmarking/Resume | Reopen course - should show "Resumed Session" |

After clicking a test button, click **Close & Save** to end the session, then verify in your LMS.

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
2. Move the **Visual Restore Test** slider to any position
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

## Features

### For Everyone
- **One-click test scenarios** - Pass, Fail, and Suspend tests
- **Visual restore test** - Slider that shows if data persistence works
- **Visual status dashboard** - See progress, result, grade, and bookmark at a glance
- **Toast notifications** - Clear feedback for every action
- **Score slider** - Set any grade from 0-100%
- **Export logs** - Download test results as JSON

### Troubleshooting Tests
Find LMS limits and issues with one-click tests:
- **Data size limits** - Test 1KB, 10KB, 32KB, 64KB storage
- **Special characters** - Unicode, emojis, HTML encoding
- **Rapid commits** - Test LMS queue handling
- **Score edge cases** - Boundary values (0, 100, -1.0, 1.0)
- **Long bookmarks** - Test bookmark length limits

### For Developers (Advanced Options)
Click "Show Advanced Options" to access:
- Manual completion/success status controls
- Custom bookmark and suspend data
- Question interaction recording
- Full SCORM API transaction log

## Student & LMS Information

The tool displays comprehensive LMS data:
- Learner ID and Name
- Credit status
- Session type (new/resumed)
- Previous time spent
- Mode and Language
- Passing score threshold
- Time limits
- Audio preferences
- Progress measures
- Objectives and interactions count

## What Gets Tested

| SCORM Element | What It Means |
|---------------|---------------|
| `cmi.completion_status` | Course progress (complete/incomplete) |
| `cmi.success_status` | Pass/fail result |
| `cmi.score.raw` | Grade (0-100) |
| `cmi.score.scaled` | Normalized grade (0.0-1.0) |
| `cmi.location` | Bookmark position |
| `cmi.suspend_data` | Custom saved data |
| `cmi.session_time` | Time spent in session |

## Building from Source

### Requirements
- Node.js 18+
- npm

### Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build production package
npm run package
```

### Package Contents

The `scorm-package.zip` contains:
- `index.html` - Main application
- `assets/` - Bundled JavaScript
- `imsmanifest.xml` - SCORM 2004 4th Edition manifest
- `metadata.json` - Package metadata

## CI/CD

This project uses GitHub Actions for automated builds:

- **On every push/PR**: Builds and validates the package
- **On version tags**: Creates a GitHub Release with `scorm-package.zip`

To create a new release:
```bash
git tag v1.0.0
git push origin v1.0.0
```

## Troubleshooting

### "Connection Failed" on launch
- Ensure the package is uploaded as SCORM 2004 (not SCORM 1.2)
- Check that your LMS supports SCORM 2004 4th Edition
- Try a different browser

### Grades not appearing in LMS
- Make sure you clicked **Close & Save** after setting values
- Some LMS platforms require a page refresh to show updated grades
- Check your LMS SCORM settings for grade synchronization options

### Resume not working
- Ensure you selected "Save progress & return later" before closing
- Some LMS platforms have settings that control resume behavior
- Verify the LMS supports `cmi.suspend_data`

### Data size issues
- Use the **Troubleshooting Tests** to find your LMS limits
- SCORM 2004 spec allows 64KB for suspend_data, but some LMS have lower limits

## License

MIT License - Use freely for testing your LMS implementations.
