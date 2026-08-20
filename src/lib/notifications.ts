import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

export interface NotificationPayload {
  recipientPhone: string;
  message: string;
  leadId?: string;
  type: "lead_unlocked" | "new_lead_match" | "lead_verified";
}

export async function sendInstantNotification(payload: NotificationPayload) {
  const { recipientPhone, message } = payload;

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && recipientPhone) {
    try {
      const command = new PublishCommand({
        Message: `[SuperRent Alert] ${message}`,
        PhoneNumber: recipientPhone,
      });
      await snsClient.send(command);
      return { success: true, channel: "SMS/SNS" };
    } catch (err: any) {
      console.warn("[NOTIFICATION WARN] AWS SNS publish error:", err.message);
    }
  }

  return { success: true, channel: "Console/Dev" };
}
