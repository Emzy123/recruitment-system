/**
 * Fix stale HiringDecision records that exist for applications still in
 * `committee_review` or `assessment_completed` status.
 *
 * This happens when a decision was submitted before the proper committee
 * review flow was enforced, leaving the application stuck in an earlier
 * status with an orphaned HiringDecision record.
 *
 * Run with: node scripts/fix-stale-decisions.js
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not set in .env.local");
  process.exit(1);
}

// Minimal inline schemas (no TypeScript needed)
const ApplicationSchema = new mongoose.Schema(
  { status: String, candidateId: mongoose.Schema.Types.ObjectId, positionId: mongoose.Schema.Types.ObjectId },
  { strict: false }
);
const HiringDecisionSchema = new mongoose.Schema(
  { applicationId: mongoose.Schema.Types.ObjectId },
  { strict: false }
);

const Application = mongoose.models.Application || mongoose.model("Application", ApplicationSchema);
const HiringDecision = mongoose.models.HiringDecision || mongoose.model("HiringDecision", HiringDecisionSchema);

// Statuses that should NOT have a HiringDecision yet
const PRE_DECISION_STATUSES = [
  "submitted",
  "assessment_invited",
  "assessment_in_progress",
  "assessment_completed",
  "committee_review",
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Find applications stuck in pre-decision statuses
  const stuckApps = await Application.find({ status: { $in: PRE_DECISION_STATUSES } });
  console.log(`Found ${stuckApps.length} applications in pre-decision statuses`);

  let fixed = 0;
  for (const app of stuckApps) {
    const decision = await HiringDecision.findOne({ applicationId: app._id });
    if (decision) {
      console.log(`\nApp ${app._id} has status "${app.status}" but has a stale HiringDecision (${decision._id})`);
      console.log(`  Decision: ${decision.decision}`);
      await HiringDecision.deleteOne({ _id: decision._id });
      console.log(`  ✅ Deleted stale HiringDecision`);
      fixed++;
    }
  }

  if (fixed === 0) {
    console.log("\nNo stale decisions found — database is clean.");
  } else {
    console.log(`\nFixed ${fixed} stale HiringDecision record(s).`);
    console.log("The affected applications are back in committee_review status and ready for the correct flow.");
  }

  await mongoose.disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
