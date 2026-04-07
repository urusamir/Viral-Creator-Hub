const fs = require('fs');
const file = '/Users/munaaahmed/Downloads/viral-by-arc/Viral-Creator-Hub/client/src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('import CampaignBoardPage')) {
  content = content.replace('import CampaignWizardPage from "@/pages/campaign-wizard";\n', 'import CampaignWizardPage from "@/pages/campaign-wizard";\nimport CampaignBoardPage from "@/pages/campaign-board";\n');
}

// 2. Update PageKey
content = content.replace('type PageKey = "discover" | "payments" | "calendar" | "campaigns" | "wizard" | "lists" | "listDetail";', 'type PageKey = "discover" | "payments" | "calendar" | "campaigns" | "wizard" | "board" | "lists" | "listDetail";');

// 3. Update getPageKey
const wizardLogic = `  // V1 Campaigns
  if (
    loc === "/dashboard/campaigns/new" ||
    (loc.startsWith("/dashboard/campaigns/") && loc !== "/dashboard/campaigns/")
  ) return "wizard";`;

const newWizardLogic = `  // V1 Campaigns
  if (loc.match(/^\\/dashboard\\/campaigns\\/[^/]+\\/board$/)) return "board";
  if (
    loc === "/dashboard/campaigns/new" ||
    (loc.startsWith("/dashboard/campaigns/") && loc !== "/dashboard/campaigns/")
  ) return "wizard";`;

content = content.replace(wizardLogic, newWizardLogic);

// 4. Update rendered components inside DashboardLayout
const wizardComponent = `{mounted.has("wizard") && (
                <div className={cls("wizard")}>
                  <CampaignWizardPage />
                </div>
              )}`;

const newBoardComponent = `{mounted.has("wizard") && (
                <div className={cls("wizard")}>
                  <CampaignWizardPage />
                </div>
              )}

              {mounted.has("board") && (
                <div className={cls("board")}>
                  <CampaignBoardPage />
                </div>
              )}`;

content = content.replace(wizardComponent, newBoardComponent);

fs.writeFileSync(file, content);
console.log("Updated App.tsx successfully");
