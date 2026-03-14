"use strict";
// GPO Marketplace — Internal catalog for extensions, skill packs, templates
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = publish;
exports.reviewListing = reviewListing;
exports.deprecateListing = deprecateListing;
exports.getListings = getListings;
exports.getListing = getListing;
exports.getSummary = getSummary;
const fs = require('fs');
const path = require('path');
const LISTINGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'marketplace-listings.json');
function uid() { return 'ml_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
function publish(opts) {
    const listings = readJson(LISTINGS_FILE, []);
    const listing = {
        listing_id: uid(), asset_type: opts.asset_type, asset_ref: opts.asset_ref,
        name: opts.name, description: opts.description, owner: opts.owner || 'operator',
        version: 1, trust_level: opts.trust_level || 'community',
        permissions: (opts.permissions || []), status: 'draft',
        plan_availability: opts.plan_availability || ['pro', 'team', 'enterprise'],
        docs_complete: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    listings.unshift(listing);
    if (listings.length > 100)
        listings.length = 100;
    writeJson(LISTINGS_FILE, listings);
    return listing;
}
function reviewListing(listingId, approved) {
    const listings = readJson(LISTINGS_FILE, []);
    const idx = listings.findIndex(l => l.listing_id === listingId);
    if (idx === -1)
        return null;
    listings[idx].status = approved ? 'approved' : 'rejected';
    listings[idx].updated_at = new Date().toISOString();
    writeJson(LISTINGS_FILE, listings);
    return listings[idx];
}
function deprecateListing(listingId) {
    const listings = readJson(LISTINGS_FILE, []);
    const idx = listings.findIndex(l => l.listing_id === listingId);
    if (idx === -1)
        return null;
    listings[idx].status = 'deprecated';
    listings[idx].updated_at = new Date().toISOString();
    writeJson(LISTINGS_FILE, listings);
    return listings[idx];
}
function getListings(filters) {
    let all = readJson(LISTINGS_FILE, []);
    if (filters?.status)
        all = all.filter(l => l.status === filters.status);
    if (filters?.asset_type)
        all = all.filter(l => l.asset_type === filters.asset_type);
    return all;
}
function getListing(listingId) {
    return readJson(LISTINGS_FILE, []).find(l => l.listing_id === listingId) || null;
}
function getSummary() {
    const all = getListings();
    return { total: all.length, approved: all.filter(l => l.status === 'approved').length, draft: all.filter(l => l.status === 'draft').length, review: all.filter(l => l.status === 'review').length, deprecated: all.filter(l => l.status === 'deprecated').length };
}
module.exports = { publish, reviewListing, deprecateListing, getListings, getListing, getSummary };
//# sourceMappingURL=marketplace.js.map