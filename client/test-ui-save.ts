import { saveCreator, unsaveCreator, fetchSavedCreators } from "./src/lib/api/creators.ts";

async function run() {
  const userId = "8ddd1cd5-a638-442f-bd56-d33d9411adb4"; 
  const testCreator = {
    username: "debug_creator_123",
    fullname: "Debug Creator",
    platform: "Instagram",
  };
  
  console.log("Saving...");
  const saveRes = await saveCreator(userId, testCreator);
  console.log("Save returned:", saveRes);

  const creators = await fetchSavedCreators(userId);
  console.log("Saved creators list includes debug_creator_123?", creators.includes("debug_creator_123"));

  console.log("Unsaving...");
  const unsaveRes = await unsaveCreator(userId, testCreator.username);
  console.log("Unsave returned:", unsaveRes);

  const finalCreators = await fetchSavedCreators(userId);
  console.log("Final creators list includes debug_creator_123?", finalCreators.includes("debug_creator_123"));
}
run().catch(console.error);
