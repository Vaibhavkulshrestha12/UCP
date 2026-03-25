import { DeliveryStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { sendEmailNotification } from "@/lib/email/send";

export async function sendUserNotification(input: {
  userId: string;
  kind: string;
  subject: string;
  html: string;
  deliveryKey: string;
}) {
  const user = await prisma.userProfile.findUnique({
    where: { id: input.userId }
  });

  if (!user?.email) {
    return { skipped: true };
  }

  const existing = await prisma.notificationDelivery.findUnique({
    where: { deliveryKey: input.deliveryKey }
  });

  if (existing?.status === DeliveryStatus.SENT || existing?.status === DeliveryStatus.SKIPPED) {
    return existing;
  }

  await prisma.notificationDelivery.upsert({
    where: { deliveryKey: input.deliveryKey },
    create: {
      userId: input.userId,
      channel: "EMAIL",
      deliveryKey: input.deliveryKey,
      kind: input.kind,
      subject: input.subject,
      payload: { html: input.html },
      status: DeliveryStatus.PENDING
    },
    update: {
      subject: input.subject,
      payload: { html: input.html },
      status: DeliveryStatus.PENDING,
      error: null
    }
  });

  try {
    await sendEmailNotification({
      to: user.email,
      subject: input.subject,
      html: input.html
    });

    return prisma.notificationDelivery.update({
      where: { deliveryKey: input.deliveryKey },
      data: {
        status: DeliveryStatus.SENT,
        sentAt: new Date(),
        error: null
      }
    });
  } catch (error) {
    await prisma.notificationDelivery.update({
      where: { deliveryKey: input.deliveryKey },
      data: {
        status: DeliveryStatus.FAILED,
        error: error instanceof Error ? error.message : "Unknown email delivery error"
      }
    });

    throw error;
  }
}
