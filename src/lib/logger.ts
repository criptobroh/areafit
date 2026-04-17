import { sendErrorAlert, type ErrorAlertDetails } from "./alert-email";

type LogLevel = "info" | "warn" | "error" | "critical";

interface LogContext {
  path?: string;
  method?: string;
  statusCode?: number;
  userEmail?: string;
  latencyMs?: number;
  source?: string;
  [key: string]: unknown;
}

// ── Rate limit: dedup same error within 5 min ──
const recentAlerts = new Map<string, number>();
const DEDUP_WINDOW_MS = 5 * 60 * 1000;

function shouldAlert(message: string): boolean {
  const now = Date.now();
  // Clean old entries
  for (const [key, ts] of recentAlerts) {
    if (now - ts > DEDUP_WINDOW_MS) recentAlerts.delete(key);
  }
  // Simple hash: first 100 chars of message
  const key = message.slice(0, 100);
  if (recentAlerts.has(key)) return false;
  recentAlerts.set(key, now);
  return true;
}

// ── In-memory error buffer for /admin/logs (fallback) ──
export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  stack?: string;
}

const MAX_BUFFER = 200;
const errorBuffer: LogEntry[] = [];

export function getRecentLogs(limit = 50): LogEntry[] {
  return errorBuffer.slice(-limit).reverse();
}

function addToBuffer(entry: LogEntry) {
  errorBuffer.push(entry);
  if (errorBuffer.length > MAX_BUFFER) {
    errorBuffer.splice(0, errorBuffer.length - MAX_BUFFER);
  }
}

// ── Persist to DB (fire-and-forget) ──
function persistToDb(level: LogLevel, message: string, context?: LogContext, stack?: string) {
  // Dynamic import to avoid circular deps and work without DB in dev
  import("./db").then(({ db }) => {
    db.errorLog.create({
      data: {
        level,
        message: message.slice(0, 1000),
        path: context?.path as string | undefined,
        method: context?.method as string | undefined,
        statusCode: context?.statusCode as number | undefined,
        userEmail: context?.userEmail as string | undefined,
        referer: context?.referer as string | undefined,
        requestBody: (context?.requestBody as string | undefined)?.slice(0, 2000),
        query: context?.query as string | undefined,
        stack: stack?.slice(0, 5000),
        context: context ? JSON.stringify(context).slice(0, 5000) : undefined,
        source: context?.source as string | undefined,
      },
    }).catch(() => {
      // Silently fail — DB might be unavailable
    });
  }).catch(() => {});
}

// ── Logger ──
function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const ts = new Date().toISOString();
  const ctx = context ? ` ${JSON.stringify(context)}` : "";
  return `[${ts}] [${level.toUpperCase()}] ${message}${ctx}`;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildAlertDetails(message: string, context?: LogContext, stack?: string): ErrorAlertDetails {
  return {
    message,
    path: context?.path as string | undefined,
    method: context?.method as string | undefined,
    statusCode: context?.statusCode as number | undefined,
    userEmail: context?.userEmail as string | undefined,
    referer: context?.referer as string | undefined,
    requestBody: context?.requestBody as string | undefined,
    query: context?.query as string | undefined,
    stack,
    context: context as Record<string, unknown> | undefined,
  };
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.log(formatLog("info", message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatLog("warn", message, context));
    addToBuffer({
      id: generateId(),
      level: "warn",
      message,
      context,
      timestamp: new Date().toISOString(),
    });
    persistToDb("warn", message, context);
  },

  error(message: string, context?: LogContext, error?: unknown) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(formatLog("error", message, context), error);

    addToBuffer({
      id: generateId(),
      level: "error",
      message,
      context,
      timestamp: new Date().toISOString(),
      stack,
    });

    persistToDb("error", message, context, stack);

    if (shouldAlert(message)) {
      sendErrorAlert(`ERROR: ${message.slice(0, 80)}`, buildAlertDetails(message, context, stack)).catch(() => {});
    }
  },

  critical(message: string, context?: LogContext, error?: unknown) {
    const stack = error instanceof Error ? error.stack : undefined;
    console.error(formatLog("critical", message, context), error);

    addToBuffer({
      id: generateId(),
      level: "critical",
      message,
      context,
      timestamp: new Date().toISOString(),
      stack,
    });

    persistToDb("critical", message, context, stack);

    // Always send alert for critical (bypass dedup)
    sendErrorAlert(`CRITICAL: ${message.slice(0, 80)}`, buildAlertDetails(message, context, stack)).catch(() => {});
  },
};
