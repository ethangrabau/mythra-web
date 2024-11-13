// src/lib/utils/session.js
export function normalizeSessionId(sessionId) {
    if (!sessionId) return '';
    
    const parts = sessionId.split('-');
    
    if (parts.length >= 3 && parts[0] === 'session') {
      return `session-${parts[1]}`;
    }
    
    if (parts.length === 2 && parts[0] === 'session') {
      return sessionId;
    }
    
    return sessionId;
  }