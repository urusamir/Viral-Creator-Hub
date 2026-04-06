ALTER TABLE "public"."calendar_slots" 
ADD COLUMN "campaign_id" uuid;

ALTER TABLE "public"."calendar_slots"
ADD CONSTRAINT "calendar_slots_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE SET NULL;
