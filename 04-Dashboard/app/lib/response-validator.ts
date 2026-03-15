// GPO Response Validator — Validate AI responses before accepting
export function validateResponse(text: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (!text || text.length < 10) issues.push('Response too short');
  if (text.length > 50000) issues.push('Response exceeds 50KB limit');
  if (text.includes('[Insert') || text.includes('[TODO')) issues.push('Contains placeholder text');
  if ((text.match(/undefined/gi) || []).length > 3) issues.push('Multiple "undefined" values detected');
  if (text.startsWith('I apologize') || text.startsWith('I cannot')) issues.push('Response is a refusal');
  return { valid: issues.length === 0, issues };
}
module.exports = { validateResponse };
