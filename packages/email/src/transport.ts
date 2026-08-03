import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface SmtpSettings {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  secure?: boolean;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export type MailTransport = Transporter | null;

export function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === "test";
}

export function getSmtpSettings(): SmtpSettings {
  return {
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    user: process.env.SMTP_USER || undefined,
    pass: process.env.SMTP_PASS || undefined,
    secure: process.env.SMTP_SECURE === "true",
  };
}

export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Daily Curio <no-reply@localhost>";
}

/**
 * Creates a nodemailer transport from environment settings.
 * Returns null in test environments so senders can no-op gracefully.
 */
export function createMailTransport(): MailTransport {
  if (isTestEnvironment()) {
    return null;
  }
  const settings = getSmtpSettings();
  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: settings.user
      ? { user: settings.user, pass: settings.pass ?? "" }
      : undefined,
  });
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const transport = createMailTransport();
  if (!transport) {
    console.info(`[email:test] Would send "${options.subject}" to ${options.to}`);
    return;
  }
  try {
    await transport.sendMail({
      from: options.from ?? getEmailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? options.html.replace(/<[^>]+>/g, ""),
    });
  } catch (error) {
    console.warn(`[email] Failed to send "${options.subject}" to ${options.to}:`, error);
  }
}
