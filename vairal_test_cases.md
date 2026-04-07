# Viral Platform-Wide Test Cases

This document outlines the critical test scenarios for verifying the stability and interconnectivity of the Viral platform.

## 1. Campaign Wizard & Publishing
- **TC-01: Step-by-Step Validation** 
  - Ensure Step 1 (Goal/Budget) prevents navigation if fields are empty.
  - Verify Step 2 (Creator Selection) allows choosing from "All Creators" and "Lists".
  - Verify Step 3 (Deliverables) allows adding at least one deliverable per creator.
- **TC-02: Publish Workflow Stability**
  - Click "Publish" and verify the loading state appears.
  - Ensure the browser DOES NOT hang and redirects to the Campaigns list within 15 seconds.
  - Verify a "Success" toast appears after navigation.
- **TC-03: Calendar Synchronization**
  - After publishing, navigate to the "Calendar" tab.
  - Verify each deliverable's "Shoot Date" and "Live Date" are visible on the correct dates.

## 2. Creator Lists & Integration
- **TC-04: List Creation & Management**
  - Create a new list from the "Lists" page.
  - Add creators to the list via the "Add Creators" panel.
  - Verify the member count updates in the list directory.
- **TC-05: List-to-Wizard Allocation**
  - Start a new campaign.
  - In Step 2, select a previously created list.
  - Verify all creators from that list are automatically added to the campaign selection.
- **TC-06: Merge Creators**
  - Select a list in Step 2, then manually add another "individual" creator.
  - Proceed to Step 3 and verify the total unique count of creators is correct.

## 3. Execution Board & Tracking
- **TC-07: Deliverable Persistence**
  - Drag a deliverable from "Awaiting Shoot" to "Shoot Submitted".
  - Verify the "Saving..." toast appears.
  - Hard-refresh the page (Cmd+R).
  - Verify the deliverable remains in the "Shoot Submitted" column.
- **TC-08: URL Validation**
  - Drag a deliverable to "Live".
  - Paste a valid URL (e.g., `https://instagram.com/reels/xxx`).
  - Verify the item stays in "Live" and the URL is saved.
- **TC-09: Metric Updates**
  - Navigate to the "Tracking" hub.
  - Locate a "Live" deliverable.
  - Update the "Week 1" views to a numeric value.
  - Verify the "Changes saved" indicator appears.

## 4. Admin Dashboard Parity
- **TC-10: Brand Visibility**
  - Login as Admin.
  - Select a Brand and click "View Details".
  - Verify the "Lists" tab contains the exact names and counts seen in the Brand's own view.
- **TC-11: Execution Oversight**
  - Navigate to the "Execution Board" tab in Admin.
  - Verify it correctly reflects the status of all deliverables globally for that brand.
- **TC-12: High-Contrast UI Audit**
  - Verify all status badges (Not Started, Live, etc.) use solid background colors with white text across Campaigns, Board, and Admin views.
