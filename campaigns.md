# Viral Creator Hub – Comprehensive Campaigns Module Requirements

## 1. Executive Summary & Vision
The Campaigns Module is the operational heart of the Viral Creator Hub. It enables brands and marketing agencies to orchestrate influencer campaigns from genesis (planning) through execution (creative briefing, creator sourcing) to post-production (track deliverables and go-live schedules). 

The module has recently undergone a major architectural shift: moving from a flat, high-level structural model to a **granular, deliverable-first hierarchical pipeline**. This ensures every piece of content is atomic, trackable, and individually measurable.

---

## 2. Core Entities & Data Architecture Models

The database schema (`campaigns` table via Supabase) leverages a hybrid combination of strict standard columns and highly flexible `JSONB` document stores for complex hierarchies.

### 2.1. `Campaign` (The Root Container)
*   **Unique Identifier:** `id` (UUID)
*   **Relational Lock:** `user_id` (Auth linkage ensuring row-level security)
*   **Metadata:** `name`, `brand`, `product`, `goal` (Awareness, Conversions, Engagement).
*   **Logistics & Financials:** `start_date`, `end_date`, `total_budget`, `currency`.
*   **Targeting Arrays:** `countries`, `platforms`, `audience_age_ranges`.
*   **State Management:** `status` (`DRAFT` | `PUBLISHED`), `last_step`.

### 2.2. `CampaignBrief` (Creative Strategy)
Stored as a `JSONB` array natively within the campaign record. A campaign can hold **N Briefs** (e.g., distinct strategies per platform or language).
*   **Fields:** `id`, `title`.
*   **Dynamic Arrays (Unlimited Entries):** `keyMessages`, `dos`, `donts`, `hashtags`, `mentions`, `referenceLinks`.

### 2.3. `CreatorStatus` (Pipeline Orchestration)
Tracks the funnel state of human capital. Stored inside `selected_creators` as `JSONB`.
*   **Fields:** `creatorId` (String mapping to the `creators` table).
*   **State Field:** `status` Enum (`"request_sent"` | `"pending"` | `"confirmed"` | `"rejected"`).

### 2.4. `CreatorDeliverable` (The Atomic Asset)
The explicit contract of work for a given creator. Stored inside `deliverables` as `JSONB`.
*   **Identifiers:** `id`, `creatorId`.
*   **Categorization:** `platform` (TikTok, Instagram), `contentType` (Video, Static, Reel).
*   **Requirements:** `quantity` (Integer), `formatNotes` (Detailed text constraints, e.g., "Must shoot in 4K 9:16").
*   **Lifecycle:** `status` Enum (`"pending"` | `"uploaded"` | `"revisions_requested"` | `"approved"` | `"live"`).
*   **Deadlines:** `dueDate` (internal draft delivery), `goLiveDate` (public launch).

---

## 3. The 4-Step Campaign Wizard Interface

The core interaction layer is built as a stateful, progressive 4-step wizard. It combines fluid front-end React state with strict backend data syncing.

### Step 1: Core Details (Identity & Parameters)
**Objective:** Define the non-negotiable boundaries of the campaign.
*   **Form Controls & Inputs:**
    *   Standard Text Inputs for Nomenclature: Name, Brand, Product.
    *   Select Dropdowns: Campaign Goal.
    *   Multi-Select Comboboxes: Execution Platforms (Instagram, TikTok, YouTube, etc.), Target Countries, Target Age Brackets.
    *   Strict Date Pickers: Start Date and End Date. 
*   **Validation Rules:** End Date must be greater than or equal to Start Date. Budget must be greater than 0.

### Step 2: Campaign Briefs (The Playbook)
**Objective:** Programmatic tracking of creative constraints.
*   **Mechanism:** Deeply dynamic form generation. Users can spawn multiple Brief tabs to isolate rules.
*   **Lists:** Within each brief, users can continuously append rows for Key Messages, Dos, Don'ts. Empty generic inputs are purged before submission.
*   **Validation Rules:** The wizard will completely block publication unless at least **one** key message exists across the utilized briefs.

### Step 3: Ad Creators & Deliverables (Resource Allocation)
**Objective:** Assign the workforce and explicitly define their deliverables matrix.
*   **UI/UX Paradigm:** Re-engineered for full-screen horizontal width. Eliminates truncation by providing dense data tables.
*   **Creator Sourcing:** An integrated search bar lets brand managers query global creators and ingest them into their local pipeline.
*   **State-Based Viewing:** Filtered Tabs separate creators by progression (`Request Sent`, `Pending`, `Confirmed`). Deliverable injection is uniquely permitted at the `Request Sent` phase allowing initial contract proposals.
*   **The Matrix Builder:** Replaces archaic "Remarks" columns. Users spawn structured rows denoting Platform, Content Type, Specifications, and Deadlines for each required video or post explicitly tied to the selected creator.

### Step 4: Campaign Summary (Executive Dashboard)
**Objective:** A real-time, highly visual operational command center for active campaigns.
*   **Executive KPIs View:**
    *   Total format/platform combinations mapped to deliverables.
    *   Aggregate pending review and approved assets.
*   **Operational Health Visualizations:**
    *   *Upload Rate Progress Bar*: (Uploaded / Total Request).
    *   *Approval Rate Progress Bar*: (Approved / Total Request).
*   **Algorithmic Bottleneck Alerts:** Evaluates the `status` and `date` properties of every child deliverable to trip the following warnings dynamically:
    1.  **Shoot Overdue (Warning)**: Deliverable is past the `dueDate` but status still reads `pending`.
    2.  **Go-Live Overdue (Critical)**: Deliverable past `goLiveDate` but status is not `live`.
    3.  **Changes Requested (Action Required)**: Flags deliverables stuck in the `revisions_requested` loop awaiting creator action.
*   **Delivery Tracking Matrix:** A 2-Dimensional table cross-referencing intended `Platforms` against output `Content Types` (e.g., showing precisely how many Instagram Stories vs. TikTok Videos are expected).

---

## 4. UI Actions, Workflows, & Navigation

### 4.1. The Save & Publish Mechanics
*   **Save Draft (`DRAFT`)**: Unlocked and unvalidated. A user can persist the campaign in whatever current transient state it exists. Saves the `last_step`.
*   **Publish Campaign (`PUBLISHED`)**: Triggers an aggressive synchronous validation pass across all 3 prior steps. Once passed, transitions state and signals downstream systems to trigger creator notifications.

### 4.2. ReadOnly & Active Iteration Dynamics
*   Previously, transitioning to `PUBLISHED` engaged a strict `readOnly` lock ensuring no history was corrupted.
*   **Current Dynamics**: The lock has been officially severed. A `PUBLISHED` status validates initial intent, but the Wizard remains fully unlocked to accommodate the reality of ongoing campaign lifecycles (creators dropping out, new deliverables being dynamically requested, and deadlines shifting). Users can endlessly traverse back and forth appending data without friction. 

---

## 5. Security & Technical Integrations

*   **Network Synchronization**: Handled via custom React hooks enveloping the `@supabase/supabase-js` client. Operations catch natively thrown errors (e.g., missing payload columns) and utilize Shadcn `toast` providers to surface them visually to the user.
*   **Schema Safety**: The reliance on `JSONB` bypasses restrictive PostgreSQL foreign key constraints for sub-deliverables but requires strict TypeScript interfaces built into `models/campaign.types.ts` to ensure UI state never writes anomalous objects to the document arrays.
*   **Authentication Hooks**: Database inserts are strictly bound to `user.id`. The campaigns list uses a filtering query `.eq("user_id", userId)` validating against the user session to prevent inter-tenant data leakage.
