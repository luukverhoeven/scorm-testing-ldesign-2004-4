# SCORM 2004 4th Edition Validator

This application is a robust, single-page SCO (Shareable Content Object) designed to validate Learning Management Systems (LMS) for SCORM 2004 4th Edition compliance. It is specifically optimized for testing Moodle, SCORM Cloud, and other standard LMS environments.

It provides a visual dashboard to manipulate the SCORM Data Model (CMI) and view real-time logs of API transactions.

## 📦 Packaging for LMS (Moodle)

**CRITICAL:** To create a valid SCORM package, you must zip the **contents** of the root directory, not the directory itself.

1.  Navigate to the root folder where `index.html` and `imsmanifest.xml` are located.
2.  Select all files (including the `assets` or `dist` folders if built, `App.tsx`, etc. - though for a production build you usually only zip the build artifacts. For this source package, ensure `index.html` is at the root).
3.  Create a ZIP file.
4.  **Verify:** Open the zip. You should see `imsmanifest.xml` immediately, **not** inside a subfolder.

## 🧪 Step-by-Step Testing Guide

Use the following scenarios to validate your LMS configuration:

### Scenario 1: Basic Completion & Scoring
**Goal:** Verify the LMS records grades and completion status correctly.
1.  **Launch** the course.
2.  Click **Set Passed** (Success Status) and **Set Completed** (Completion Status).
3.  Click **Score 100%** (sets Raw: 100, Scaled: 1.0).
4.  Under Exit Strategy, select **Normal (Finished)**.
5.  Click **Exit**.
6.  **LMS Check:** Return to your LMS gradebook. It should show the attempt as "Completed", "Passed", and a grade of 100.

### Scenario 2: Suspend & Resume (Bookmarking)
**Goal:** Verify the LMS preserves user data between sessions.
1.  **Launch** the course. Note that **Entry Mode** (top left) says `ab-initio`.
2.  In the **Bookmark & Suspend** section:
    *   Type `Page 10` into the Location box and click **Set Location**.
    *   Type `User visited section A` into the Suspend Data box and click **Set Data**.
3.  Under Exit Strategy, select **Suspend (Save & Resume later)**.
4.  Click **Exit**.
5.  **Re-launch** the course from the LMS.
6.  **LMS Check:**
    *   **Entry Mode** should now display `resume` (with a blue badge).
    *   The **Location** box should automatically be filled with `Page 10`.
    *   The **Suspend Data** box should automatically be filled with `User visited section A`.

### Scenario 3: Failed Attempt
**Goal:** Verify the LMS handles failure states.
1.  **Launch** the course.
2.  Click **Set Failed** and **Set Incomplete**.
3.  Click **Score 0%**.
4.  Under Exit Strategy, select **Normal (Finished)**.
5.  Click **Exit**.
6.  **LMS Check:** The gradebook should show a failing grade (0) and the status "Failed".

## ✨ Features

### 1. API Discovery & Connection
*   **Robust Discovery**: Implements a recursive search algorithm to find the `API_1484_11` object (standard for SCORM 2004), handling iframes and popups.
*   **Connection Status**: Visual indicators for `Not Initialized`, `Initialized`, `Terminated`, or `Failed to Connect`.
*   **Error Handling**: Automatically fetches `GetLastError`, `GetErrorString`, and `GetDiagnostic` if an API call returns `false`.

### 2. Learner & Session Information
On initialization, the app retrieves and displays:
*   **Learner Name** (`cmi.learner_name`)
*   **Learner ID** (`cmi.learner_id`)
*   **Credit Mode** (`cmi.credit` - Credit/No-Credit)
*   **Entry Mode** (`cmi.entry` - ab-initio/resume)
*   **Mode** (`cmi.mode` - normal/browse/review)
*   **Total Time** (`cmi.total_time`)
*   **Launch Data** (`cmi.launch_data`)
*   **Language** (`cmi.learner_preference.language`)

### 3. Persistence & Resume Testing
*   **Visual Resume**: The UI explicitly flags if the session is in `RESUME` mode.
*   **Data Restoration**: Automatically populates the "Location" and "Suspend Data" input fields with values from the LMS upon initialization, allowing quick verification that the LMS successfully restored the user's track.

### 4. Data Model Controls
*   **Completion**: Set status to `completed` or `incomplete`.
*   **Success**: Set status to `passed` or `failed`.
*   **Scoring**:
    *   Sets `cmi.score.min` (0) and `cmi.score.max` (100).
    *   Presets for 0%, 50%, and 100% (updates `raw` and `scaled` automatically).
*   **Bookmarks**: Read/Write `cmi.location`.
*   **Suspend Data**: Read/Write `cmi.suspend_data` (supports arbitrary text).

### 5. Interactions
*   Simulates question interactions (`cmi.interactions.n`).
*   Sets `id`, `type` (true-false), `result` (correct/incorrect), `timestamp`, and `description`.
*   Useful for testing gradebook detail views in Moodle.

### 6. Exit Strategies
*   **Normal**: Sets `cmi.exit` to `normal` (clears resume data usually).
*   **Suspend**: Sets `cmi.exit` to `suspend` (tells LMS to keep `cmi.suspend_data` and `cmi.location` for next time).
*   **Timeout/Logout**: Simulates other exit scenarios.

### 7. Debug Console
*   **Real-time Logging**: Every API call (`Initialize`, `GetValue`, `SetValue`, `Commit`, `Terminate`) is logged.
*   **Return Values**: Shows exactly what the LMS returned for every `GetValue` call.
*   **Timestamps**: precise timing for all transactions.
