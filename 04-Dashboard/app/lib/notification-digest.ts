// GPO Notification Digest — Summarize notifications into a daily digest
export function getNotificationDigest(): { total: number; unread: number; byType: Record<string, number>; recent: any[] } {
  try {
    const notif = require('./in-app-notifications') as { listNotifications(since?: number, limit?: number): any[]; getBadgeCounts(): any };
    const all = notif.listNotifications(Date.now() - 86400000, 100);
    const counts = notif.getBadgeCounts();
    const byType: Record<string, number> = {};
    for (const n of all) { byType[n.type] = (byType[n.type] || 0) + 1; }
    return { total: all.length, unread: counts.unread, byType, recent: all.slice(0, 10) };
  } catch { return { total: 0, unread: 0, byType: {}, recent: [] }; }
}
module.exports = { getNotificationDigest };
