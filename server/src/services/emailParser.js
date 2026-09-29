import { simpleParser } from 'mailparser';

/**
 * Parse raw EML string or Buffer into normalized email object
 */
export async function parseEmlContent(emlBufferOrString) {
  const parsed = await simpleParser(emlBufferOrString);

  const senderAddress = parsed.from?.value?.[0]?.address || '';
  const senderName = parsed.from?.value?.[0]?.name || senderAddress.split('@')[0] || 'Неизвестный отправитель';

  const attachments = (parsed.attachments || []).map(att => ({
    name: att.filename || 'attachment',
    size: att.size || (att.content ? att.content.length : 0),
    contentType: att.contentType || 'application/octet-stream',
    checksum: att.checksum || ''
  }));

  return {
    subject: parsed.subject || '(Без темы)',
    from: senderAddress ? `${senderName} <${senderAddress}>` : senderName,
    senderName,
    senderEmail: senderAddress,
    to: parsed.to?.text || '',
    date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
    textBody: parsed.text || '',
    htmlBody: parsed.html || '',
    messageId: parsed.messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    attachments
  };
}
