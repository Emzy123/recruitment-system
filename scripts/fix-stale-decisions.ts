/**
 * Fix stale HiringDecision records for applications still stuck in
 * pre-decision statuses (e.g. committee_review) due to the old broken flow.
 *
 * Run with:  npx tsx scripts/fix-stale-decisions.ts
 */

import { connectToMongo } from "@/lib/mongodb";
import { Application } from "@/lib/db/models/Application";
import { HiringDecision } from "@/lib/db/models/HiringDecision";
import mongoose from "mongoose";

// Statuses that should NOT have a HiringDecision yet
const PRE_DECISION_STATUSES = [
  "submitted",
  "assessment_invited",
  "assessment_in_progress",
  "assessment_completed",
  "committee_review",
];

async function main() {
  await connectToMongo();
  console.log("✅ Connected to MongoDB\n");

  const stuckApps = await Application.find({ status: { $in: PRE_DECISION_STATUSES } });
  console.log(`Found ${stuckApps.length} application(s) in pre-decision statuses.\n`);

  let fixed = 0;

  for (const app of stuckApps) {
    const decision = await HiringDecision.findOne({
      applicationId: new mongoose.Types.ObjectId(app._id.toString()),
    });

    if (decision) {
      console.log(`⚠️  App ${app._id} — status "${app.status}" has a stale HiringDecision`);
      console.log(`   Decision type: ${(decision as any).decision}`);
      await HiringDecision.deleteOne({ _id: decision._id });
      console.log(`   🗑️  Deleted stale HiringDecision\n`);
      fixed++;
    }
  }

  if (fixed === 0) {
    console.log("✅ No stale decisions found. Database is clean.");
  } else {
    console.log(`\n✅ Fixed ${fixed} stale HiringDecision record(s).`);
    console.log(
      "   Affected applications are now back in the correct flow:\n" +
      "   committee_review → committee submits review → admin_decision → admin makes final decision."
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
