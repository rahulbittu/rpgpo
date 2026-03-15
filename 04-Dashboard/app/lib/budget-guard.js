"use strict";
// GPO Budget Guard — Enforce spending limits before task execution
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBudget = checkBudget;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
function checkBudget(estimatedCostUsd = 0.02) {
    try {
        const settings = require('./costs');
        const cfg = settings.getSettings();
        const summary = settings.getSummary();
        const dailyLimit = cfg.dailyLimit || 1.0;
        const todaySpend = summary.today?.cost || 0;
        const remaining = dailyLimit - todaySpend;
        const utilizationPct = (todaySpend / dailyLimit) * 100;
        if (todaySpend + estimatedCostUsd > dailyLimit) {
            return { allowed: false, reason: `Daily budget limit reached ($${todaySpend.toFixed(4)}/$${dailyLimit.toFixed(2)})`, currentSpend: todaySpend, limit: dailyLimit, remaining: Math.max(0, remaining), utilizationPct };
        }
        if (utilizationPct > 80) {
            return { allowed: true, reason: `Warning: ${utilizationPct.toFixed(0)}% of daily budget used`, currentSpend: todaySpend, limit: dailyLimit, remaining, utilizationPct };
        }
        return { allowed: true, currentSpend: todaySpend, limit: dailyLimit, remaining, utilizationPct };
    }
    catch {
        return { allowed: true, currentSpend: 0, limit: 1.0, remaining: 1.0, utilizationPct: 0 };
    }
}
module.exports = { checkBudget };
