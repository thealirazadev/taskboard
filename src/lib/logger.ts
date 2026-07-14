type LogContext = Readonly<Record<string, unknown>>;

function warn(message: string, context: LogContext = {}): void {
  if (import.meta.env.DEV) {
    console.warn(`[taskboard] ${message}`, context);
  }
}

function error(message: string, context: LogContext = {}): void {
  if (import.meta.env.DEV) {
    console.error(`[taskboard] ${message}`, context);
  }
}

export const logger = { warn, error };
