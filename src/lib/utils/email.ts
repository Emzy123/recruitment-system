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

