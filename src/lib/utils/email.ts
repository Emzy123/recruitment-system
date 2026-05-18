import nodemailer from "nodemailer";

export async function sendPasswordResetEmail(params: {
  to: string;
  resetUrl: string;
}) {
  const { to, resetUrl } = params;

  const emailServer = process.env.EMAIL_SERVER;
  const emailPort = Number(process.env.EMAIL_PORT ?? "587");
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM ?? "noreply@recruitment.com";

  // Local/dev fallback so password reset works out-of-the-box without SMTP.
  if (!emailServer || !emailUser || !emailPassword) {
    // eslint-disable-next-line no-console
    console.log(`[Password reset email - local fallback]\nTo: ${to}\nReset URL: ${resetUrl}\n`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: emailServer,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  const text = `You requested a password reset.\n\nReset your password using this link:\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`;

  const html = `<p>You requested a password reset.</p><p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`;

  await transport.sendMail({
    from: emailFrom,
    to,
    subject: "Reset your password",
    text,
    html,
  });
}

export async function sendVerificationEmail(params: {
  to: string;
  verifyUrl: string;
}) {
  const { to, verifyUrl } = params;

  const emailServer = process.env.EMAIL_SERVER;
  const emailPort = Number(process.env.EMAIL_PORT ?? "587");
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM ?? "noreply@recruitment.com";

  if (!emailServer || !emailUser || !emailPassword) {
    // eslint-disable-next-line no-console
    console.log(`[Verification email - local fallback]\nTo: ${to}\nVerify URL: ${verifyUrl}\n`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: emailServer,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  const text = `Please verify your email address.\n\nVerify using this link:\n${verifyUrl}\n\nIf you didn't request this, you can ignore this email.`;

  const html = `<p>Please verify your email address.</p><p>Verify using this link:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>If you didn't request this, you can ignore this email.</p>`;

  await transport.sendMail({
    from: emailFrom,
    to,
    subject: "Verify your email address",
    text,
    html,
  });
}

export async function sendAssessmentInvitationEmail(params: {
  to: string;
  candidateName: string;
  positionTitle: string;
  assessmentUrl: string;
}) {
  const { to, candidateName, positionTitle, assessmentUrl } = params;

  const emailServer = process.env.EMAIL_SERVER;
  const emailPort = Number(process.env.EMAIL_PORT ?? "587");
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM ?? "noreply@recruitment.com";

  if (!emailServer || !emailUser || !emailPassword) {
    // eslint-disable-next-line no-console
    console.log(`[Assessment Invitation email - local fallback]\nTo: ${to}\nAssessment URL: ${assessmentUrl}\n`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: emailServer,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  const text = `Hello ${candidateName},\n\nYou have been invited to complete an assessment for the ${positionTitle} position.\n\nPlease complete your assessment using this link:\n${assessmentUrl}\n\nGood luck!`;

  const html = `<p>Hello ${candidateName},</p><p>You have been invited to complete an assessment for the ${positionTitle} position.</p><p>Please complete your assessment using this link:</p><p><a href="${assessmentUrl}">${assessmentUrl}</a></p><p>Good luck!</p>`;

  await transport.sendMail({
    from: emailFrom,
    to,
    subject: `Assessment Invitation: ${positionTitle}`,
    text,
    html,
  });
}

export async function sendDecisionEmail(params: {
  to: string;
  candidateName: string;
  positionTitle: string;
  decision: "offer" | "reject" | "waitlist";
  offerDetails?: {
    salary?: number;
    startDate?: Date;
    acceptanceDeadline?: Date;
  };
}) {
  const { to, candidateName, positionTitle, decision, offerDetails } = params;

  const emailServer = process.env.EMAIL_SERVER;
  const emailPort = Number(process.env.EMAIL_PORT ?? "587");
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD;
  const emailFrom = process.env.EMAIL_FROM ?? "noreply@recruitment.com";

  if (!emailServer || !emailUser || !emailPassword) {
    // eslint-disable-next-line no-console
    console.log(`[Decision email - local fallback]\nTo: ${to}\nDecision: ${decision}\n`);
    return;
  }

  const transport = nodemailer.createTransport({
    host: emailServer,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  let subject = "";
  let html = `<p>Dear ${candidateName},</p>`;

  if (decision === "offer") {
    subject = `Job Offer: ${positionTitle}`;
    html += `<p>We are absolutely thrilled to offer you the position of <strong>${positionTitle}</strong>!</p>`;
    if (offerDetails) {
      html += `<ul>`;
      if (offerDetails.salary) html += `<li><strong>Salary:</strong> $${offerDetails.salary.toLocaleString()}</li>`;
      if (offerDetails.startDate) html += `<li><strong>Expected Start Date:</strong> ${new Date(offerDetails.startDate).toLocaleDateString()}</li>`;
      if (offerDetails.acceptanceDeadline) html += `<li><strong>Acceptance Deadline:</strong> ${new Date(offerDetails.acceptanceDeadline).toLocaleDateString()}</li>`;
      html += `</ul>`;
    }
    html += `<p>Please log in to your dashboard to view the full details and respond to this offer.</p>`;
  } else if (decision === "reject") {
    subject = `Update on your application for ${positionTitle}`;
    html += `<p>Thank you for taking the time to interview for the <strong>${positionTitle}</strong> role. While we were impressed with your background, we have decided to move forward with other candidates who more closely fit our current needs.</p>`;
    html += `<p>We wish you the best in your job search and future professional endeavors.</p>`;
  } else if (decision === "waitlist") {
    subject = `Update: Waitlist for ${positionTitle}`;
    html += `<p>Thank you for interviewing for the <strong>${positionTitle}</strong> role. The team was very impressed with your skills.</p>`;
    html += `<p>At this moment, we are placing your application on our waitlist as we finalize headcounts. We will reach back out as soon as a final decision is made.</p>`;
  }

  html += `<p>Best regards,<br/>The Hiring Team</p>`;

  const text = html.replace(/<[^>]+>/g, "\n").trim();

  await transport.sendMail({
    from: emailFrom,
    to,
    subject,
    text,
    html,
  });
}
