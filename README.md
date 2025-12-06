# SCORM 2004 4th Edition Test Tool

A simple, user-friendly tool to test if your Learning Management System (LMS) correctly tracks course progress, grades, and bookmarks. Works with Moodle, SCORM Cloud, Blackboard, and any SCORM 2004 compliant LMS.

**No technical knowledge required** - just click buttons and check your LMS!

## Quick Start

### 1. Build the Package

```bash
npm install
npm run package
```

This creates `scorm-package.zip` ready for upload.

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

### Test 3: Verify Failure States Work

1. Launch the course
2. Click the red **Fail Test** button
3. Click **Close & Save**
4. Check your LMS gradebook - should show 0% and "Failed"

### Test 4: Custom Grade

1. Use the **grade slider** to set any score (0-100)
2. Click **Set Grade**
3. Click **Close & Save**
4. Verify the exact grade appears in your LMS

## Features

### For Everyone
- **One-click test scenarios** - Pass, Fail, and Suspend tests
- **Visual status dashboard** - See progress, result, grade, and bookmark at a glance
- **Toast notifications** - Clear feedback for every action
- **Score slider** - Set any grade from 0-100%
- **Export logs** - Download test results as JSON

### For Developers (Advanced Options)
Click "Show Advanced Options" to access:
- Manual completion/success status controls
- Custom bookmark and suspend data
- Question interaction recording
- Full SCORM API transaction log

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

## License

MIT License - Use freely for testing your LMS implementations.
