import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { analyzeMessage } from "./analysis.mjs";
import { createRequest, hasMessageId } from "./store.mjs";

const requiredSettings = [
  "IMAP_HOST",
  "IMAP_USER",
  "IMAP_PASSWORD",
];

export function mailboxConfigured() {
  return requiredSettings.every((key) => Boolean(process.env[key]));
}

function addressDetails(message) {
  const address = message.from?.value?.[0];
  return {
    senderName: address?.name || address?.address?.split("@")[0] || "Без имени",
    senderEmail: address?.address || "",
  };
}

export async function syncMailbox() {
  if (!mailboxConfigured()) {
    const error = new Error(
      "Почта не подключена. Добавьте IMAP_HOST, IMAP_USER и IMAP_PASSWORD.",
    );
    error.code = "MAILBOX_NOT_CONFIGURED";
    throw error;
  }

  const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    secure: process.env.IMAP_SECURE !== "false",
    auth: {
      user: process.env.IMAP_USER,
      pass: process.env.IMAP_PASSWORD,
    },
    logger: false,
  });

  const created = [];
  await client.connect();
  const lock = await client.getMailboxLock(process.env.IMAP_FOLDER || "INBOX");

  try {
    const messages = [];
    for await (const message of client.fetch(
      { seen: false },
      { source: true, uid: true, envelope: true },
    )) {
      messages.push(message);
      if (messages.length >= 20) break;
    }

    for (const rawMessage of messages) {
      const parsed = await simpleParser(rawMessage.source);
      if (await hasMessageId(parsed.messageId)) {
        await client.messageFlagsAdd(rawMessage.uid, ["\\Seen"], { uid: true });
        continue;
      }

      const body = parsed.text?.trim() || parsed.html?.replace(/<[^>]+>/g, " ") || "";
      const input = {
        ...addressDetails(parsed),
        subject: parsed.subject || rawMessage.envelope?.subject || "Без темы",
        body,
        receivedAt: parsed.date?.toISOString() || new Date().toISOString(),
        attachments: parsed.attachments.map(
          (attachment) => attachment.filename || "Вложение",
        ),
        source: "email",
        messageId: parsed.messageId,
      };
      const analysis = await analyzeMessage(input);
      created.push(await createRequest(input, analysis));
      await client.messageFlagsAdd(rawMessage.uid, ["\\Seen"], { uid: true });
    }
  } finally {
    lock.release();
    await client.logout();
  }

  return created;
}
