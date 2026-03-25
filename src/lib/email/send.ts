import { resend } from "@/lib/email/resend";
import { env } from "@/lib/env";

export async function sendEmailNotification({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    return { skipped: true };
  }

  return resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html
  });
}
