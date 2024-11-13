// src/lib/utils/session.ts
export function normalizeSessionId(sessionId: string): string {
    if (!sessionId) return '';
    
    // Split by hyphens
    const parts = sessionId.split('-');
    
    // Look for the timestamp part (13-digit number)
    for (let i = 0; i < parts.length; i++) {
      if (/^\d{13}$/.test(parts[i])) {
        return `session-${parts[i]}`;
      }
    }
    
    // If no timestamp found, return original
    return sessionId;
  }