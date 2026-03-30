export class AuthSessionModel {
  constructor() {
    this.refreshSessions = new Map();
  }

  set(sessionId, session) {
    this.refreshSessions.set(sessionId, session);
  }

  get(sessionId) {
    return this.refreshSessions.get(sessionId);
  }

  delete(sessionId) {
    this.refreshSessions.delete(sessionId);
  }
}
