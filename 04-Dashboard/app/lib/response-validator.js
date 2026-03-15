"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResponse = validateResponse;
// GPO Response Validator — Validate AI responses before accepting
function validateResponse(text) {
    const issues = [];
    if (!text || text.length < 10)
        issues.push('Response too short');
    if (text.length > 50000)
        issues.push('Response exceeds 50KB limit');
    if (text.includes('[Insert') || text.includes('[TODO'))
        issues.push('Contains placeholder text');
    if ((text.match(/undefined/gi) || []).length > 3)
        issues.push('Multiple "undefined" values detected');
    if (text.startsWith('I apologize') || text.startsWith('I cannot'))
        issues.push('Response is a refusal');
    return { valid: issues.length === 0, issues };
}
module.exports = { validateResponse };
//# sourceMappingURL=response-validator.js.map