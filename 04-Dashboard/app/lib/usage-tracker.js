"use strict";
// GPO Usage Tracker — Track feature usage for product analytics
Object.defineProperty(exports, "__esModule", { value: true });
exports.track = track;
exports.getSummary = getSummary;
const fs = require('fs');
const path = require('path');
const USAGE_FILE = path.resolve(__dirname, '..', '..', 'state', 'usage-tracker.json');
let _events = [];
let _loaded = false;
function load() {
    if (_loaded)
        return;
    try {
        if (fs.existsSync(USAGE_FILE))
            _events = JSON.parse(fs.readFileSync(USAGE_FILE, 'utf-8'));
    }
    catch {
        _events = [];
    }
    _loaded = true;
}
function save() {
    if (_events.length > 5000)
        _events = _events.slice(-3000);
    const dir = path.dirname(USAGE_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USAGE_FILE, JSON.stringify(_events));
}
function track(feature, action) {
    load();
    _events.push({ feature, action, timestamp: Date.now() });
    save();
}
function getSummary(days = 7) {
    load();
    const cutoff = Date.now() - days * 86400000;
    const recent = _events.filter(e => e.timestamp > cutoff);
    const featureCounts = {};
    for (const e of recent) {
        featureCounts[e.feature] = (featureCounts[e.feature] || 0) + 1;
    }
    const topFeatures = Object.entries(featureCounts)
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    const dailyCutoff = Date.now() - 86400000;
    const weeklyCutoff = Date.now() - 7 * 86400000;
    return {
        totalEvents: recent.length,
        topFeatures,
        dailyActive: _events.filter(e => e.timestamp > dailyCutoff).length,
        weeklyActive: recent.length,
        recentActions: recent.slice(-10).reverse(),
    };
}
module.exports = { track, getSummary };
//# sourceMappingURL=usage-tracker.js.map