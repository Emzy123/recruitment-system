import { connectToMongo } from "@/lib/mongodb";
import { User } from "@/lib/db/models/User";
import { hashPassword } from "@/lib/utils/bcrypt";
import { Position } from "@/lib/db/models/Position";
import mongoose from "mongoose";
import { Application } from "@/lib/db/models/Application";
import { AssessmentTemplate } from "@/lib/db/models/AssessmentTemplate";
import { AssessmentInvitation } from "@/lib/db/models/AssessmentInvitation";

type SeedUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "candidate" | "committee" | "assessor" | "admin";
};

const seedUsers: SeedUser[] = [
  {
    email: "admin@example.com",
    password: "Admin123!",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  },
  {
    email: "committee@example.com",
    password: "Committee123!",
    firstName: "Committee",
    lastName: "Member",
    role: "committee",
  },
  {
    email: "assessor@example.com",
    password: "Assessor123!",
    firstName: "Assessor",
    lastName: "User",
    role: "assessor",
  },
  {
    email: "candidate@example.com",
    password: "Candidate123!",
    firstName: "Candidate",
    lastName: "User",
    role: "candidate",
  },
];

async function upsertUser(u: SeedUser) {
  const email = u.email.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) return existing;

  const passwordHash = await hashPassword(u.password);
  return User.create({
    email,
    passwordHash,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    isActive: true,
    emailVerified: true,
  });
}

async function seedPositions() {
  const now = Date.now();

  const positions = [
    {
      title: "Assistant Professor of Computer Science",
      department: "Computer Science",
      type: "full-time" as const,
      experienceLevel: "entry" as const,
      description:
        "We are seeking a collaborative and research-driven faculty member to strengthen our Computer Science department.",
      requirements: ["PhD in Computer Science or related field", "Strong publication record", "Experience with ML/Systems"],
      responsibilities: ["Teach undergraduate/graduate courses", "Mentor students", "Publish research in relevant areas"],
      requiredSkills: ["Machine Learning", "Software Engineering", "Algorithms"],
      preferredSkills: ["Distributed Systems", "AI Safety"],
      salaryMin: 90000,
      salaryMax: 120000,
      location: "Main Campus",
      isRemote: false,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 10),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 30),
    },
    {
      title: "Lecturer in Data Science",
      department: "Data Science",
      type: "part-time" as const,
      experienceLevel: "mid" as const,
      description:
        "Teach applied data science courses and support curriculum development with hands-on projects.",
      requirements: ["Industry or research experience in data science", "Ability to design practical labs"],
      responsibilities: ["Deliver lectures and lab sessions", "Collaborate with committee on curriculum"],
      requiredSkills: ["Python", "Statistics", "Data Visualization"],
      preferredSkills: ["MLOps", "Reproducible research"],
      location: "Hybrid (On-site + Online)",
      isRemote: true,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 6),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 22),
    },
    {
      title: "Visiting Professor (Cybersecurity)",
      department: "Cybersecurity",
      type: "contract" as const,
      experienceLevel: "senior" as const,
      description:
        "A short-term faculty appointment to lead advanced seminars and strengthen cybersecurity training.",
      requirements: ["Significant industry or academic experience", "Expertise in secure systems"],
      responsibilities: ["Run seminars", "Develop course materials", "Collaborate on workshops"],
      requiredSkills: ["Security", "Threat Modeling", "Secure Coding"],
      preferredSkills: ["Reverse Engineering", "Cryptography"],
      location: "Main Campus",
      isRemote: false,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 3),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 18),
    },
    {
      title: "Associate Professor of Mathematics",
      department: "Mathematics",
      type: "full-time" as const,
      experienceLevel: "senior" as const,
      description:
        "Lead advanced mathematics courses and develop research collaborations across applied and pure math.",
      requirements: ["PhD in Mathematics or related field", "Teaching experience", "Research track record"],
      responsibilities: ["Teach advanced courses", "Supervise graduate students", "Secure research funding"],
      requiredSkills: ["Analysis", "Linear Algebra", "Proof Writing"],
      preferredSkills: ["Applied Mathematics", "Optimization"],
      salaryMin: 105000,
      salaryMax: 145000,
      location: "Main Campus",
      isRemote: false,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 12),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 26),
    },
    {
      title: "Teaching Fellow (Software Engineering)",
      department: "Computer Science",
      type: "contract" as const,
      experienceLevel: "entry" as const,
      description:
        "Support large software engineering courses with labs, grading, and student mentorship.",
      requirements: ["BS/MS in CS or related field", "Strong programming fundamentals"],
      responsibilities: ["Run labs", "Provide office hours", "Assist with autograding and tooling"],
      requiredSkills: ["JavaScript", "Testing", "Git"],
      preferredSkills: ["React", "CI/CD"],
      location: "Hybrid (On-site + Online)",
      isRemote: true,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 7),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 20),
    },
    {
      title: "Senior Lecturer (Statistics)",
      department: "Statistics",
      type: "full-time" as const,
      experienceLevel: "lead" as const,
      description:
        "Modernize the statistics curriculum with applied projects and reproducible workflows.",
      requirements: ["MS/PhD in Statistics or related field", "Experience teaching applied statistics"],
      responsibilities: ["Teach core statistics", "Develop labs and assignments", "Coordinate course staff"],
      requiredSkills: ["R", "Experimental Design", "Inference"],
      preferredSkills: ["Bayesian Methods", "Reproducible Research"],
      salaryMin: 95000,
      salaryMax: 125000,
      location: "Main Campus",
      isRemote: false,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 9),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 24),
    },
    {
      title: "Adjunct Instructor (Human-Computer Interaction)",
      department: "Information Science",
      type: "part-time" as const,
      experienceLevel: "mid" as const,
      description:
        "Teach HCI fundamentals with hands-on UX research and prototyping exercises.",
      requirements: ["Industry experience in UX/HCI", "Ability to run studio-style classes"],
      responsibilities: ["Teach weekly sessions", "Evaluate portfolios", "Mentor capstone teams"],
      requiredSkills: ["UX Research", "Prototyping", "Accessibility"],
      preferredSkills: ["Design Systems", "Usability Testing"],
      location: "Online",
      isRemote: true,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 5),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 21),
    },
    {
      title: "Research Scientist (Natural Language Processing)",
      department: "AI Lab",
      type: "full-time" as const,
      experienceLevel: "senior" as const,
      description:
        "Drive applied NLP research and collaborate with faculty on publications and grant proposals.",
      requirements: ["PhD or equivalent experience", "Strong ML/NLP background"],
      responsibilities: ["Lead research projects", "Publish findings", "Collaborate with faculty and students"],
      requiredSkills: ["NLP", "Python", "Machine Learning"],
      preferredSkills: ["Evaluation", "MLOps"],
      salaryMin: 120000,
      salaryMax: 170000,
      location: "Main Campus",
      isRemote: false,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 4),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 27),
    },
    {
      title: "Professor of Economics (Public Policy)",
      department: "Economics",
      type: "full-time" as const,
      experienceLevel: "lead" as const,
      description:
        "Teach and research public policy economics with a focus on evidence-based decision making.",
      requirements: ["PhD in Economics", "Strong publication history", "Policy research experience"],
      responsibilities: ["Teach graduate seminars", "Advise doctoral students", "Engage in public policy research"],
      requiredSkills: ["Econometrics", "Policy Analysis", "Research Methods"],
      preferredSkills: ["Causal Inference", "Program Evaluation"],
      salaryMin: 140000,
      salaryMax: 210000,
      location: "Main Campus",
      isRemote: false,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 14),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 35),
    },
    {
      title: "Lab Instructor (Networks & Systems)",
      department: "Computer Engineering",
      type: "part-time" as const,
      experienceLevel: "entry" as const,
      description:
        "Support networking and systems labs, maintaining lab infrastructure and assisting students.",
      requirements: ["Hands-on Linux experience", "Comfort with basic networking"],
      responsibilities: ["Maintain lab images", "Assist in lab sessions", "Troubleshoot student environments"],
      requiredSkills: ["Linux", "Networking", "Shell Scripting"],
      preferredSkills: ["Docker", "Cloud Basics"],
      location: "Main Campus",
      isRemote: false,
      postedDate: new Date(now - 1000 * 60 * 60 * 24 * 8),
      closingDate: new Date(now + 1000 * 60 * 60 * 24 * 19),
    },
  ];

  // Use the first admin's createdBy for all positions.
  const admin = await User.findOne({ role: "admin" });
  if (!admin) throw new Error("Admin user must exist before seeding positions.");

  for (const p of positions) {
    const exists = await Position.findOne({ title: p.title, department: p.department });
    if (exists) continue;

    await Position.create({
      ...p,
      createdBy: admin._id,
      isActive: true,
      requirements: p.requirements ?? [],
      responsibilities: p.responsibilities ?? [],
      requiredSkills: p.requiredSkills ?? [],
      preferredSkills: p.preferredSkills ?? [],
    });
  }
}

async function seedAssessmentTemplatesForPositions() {
  const positions = await Position.find({ isActive: true });
  if (positions.length === 0) return;

  for (const pos of positions) {
    const title = `Coding Assessment - ${pos.title}`;
    const existing = await AssessmentTemplate.findOne({ positionId: pos._id, title });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        await existing.save();
      }
      continue;
    }

    await AssessmentTemplate.create({
      positionId: pos._id,
      title,
      description: "Basic coding assessment for candidate screening.",
      type: "coding",
      durationMinutes: 60,
      passingScore: 60,
      instructions: "Solve the coding question in your preferred language.",
      isActive: true,
      questions: [
        {
          title: "Add Two Numbers",
          description: "Read two integers and print their sum.",
          type: "coding",
          points: 100,
          order: 1,
          programmingLanguage: "python",
          starterCode: "",
          testCases: [
            { input: "1 2", expectedOutput: "3", isHidden: false },
            { input: "20 22", expectedOutput: "42", isHidden: true },
          ],
          options: [],
          correctAnswer: "",
          rubric: {},
        },
      ],
    });
  }
}

async function backfillAssessmentInvitations() {
  // If templates were added after candidates applied, create invitations retroactively.
  // We only backfill when there's an active template for that position and no invitation exists yet.
  const applications = await Application.find({})
    .select("_id candidateId positionId status")
    .limit(500);

  for (const app of applications) {
    const template = await AssessmentTemplate.findOne({
      positionId: app.positionId,
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .select("_id");

    if (!template) continue;

    await AssessmentInvitation.findOneAndUpdate(
      {
        applicationId: app._id,
        assessmentId: template._id,
        candidateId: app.candidateId,
      },
      {
        $setOnInsert: {
          applicationId: app._id,
          assessmentId: template._id,
          candidateId: app.candidateId,
          invitedAt: new Date(),
          status: "invited",
        },
      },
      { upsert: true, new: true }
    );

    if (app.status !== "assessment_invited") {
      await Application.findByIdAndUpdate(app._id, {
        $set: { status: "assessment_invited" },
      });
    }
  }
}

async function seedAssessmentsAndApplications() {
  const candidate = await User.findOne({ email: "candidate@example.com" });
  const committee = await User.findOne({ email: "committee@example.com" });
  if (!candidate || !committee) return;

  const positions = await Position.find({ isActive: true }).limit(2);
  if (positions.length === 0) return;

  for (const pos of positions) {
    const exists = await Application.findOne({
      candidateId: candidate._id,
      positionId: pos._id,
    });
    if (!exists) {
      await Application.create({
        candidateId: candidate._id,
        positionId: pos._id,
        status: "submitted",
        coverLetter: `I am excited to apply for ${pos.title}.`,
        resumeUrl: "/uploads/sample-resume.pdf",
        submittedAt: new Date(),
        committeeNotes: "",
      });
    }
  }
}

async function main() {
  try {
    await connectToMongo();

    for (const u of seedUsers) {
      await upsertUser(u);
    }

    await seedPositions();
    await seedAssessmentTemplatesForPositions();
    await backfillAssessmentInvitations();
    await seedAssessmentsAndApplications();
    // eslint-disable-next-line no-console
    console.log("Seed complete.");
  } finally {
    await mongoose.disconnect();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error("Seed failed:", e);
  process.exit(1);
});


