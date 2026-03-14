// GPO Marketplace — Internal catalog for extensions, skill packs, templates

import type { MarketplaceListing, ExtensionTrustLevel } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const LISTINGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'marketplace-listings.json');

function uid(): string { return 'ml_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

export function publish(opts: { asset_type: MarketplaceListing['asset_type']; asset_ref: string; name: string; description: string; owner?: string; trust_level?: ExtensionTrustLevel; permissions?: string[]; plan_availability?: string[] }): MarketplaceListing {
  const listings = readJson<MarketplaceListing[]>(LISTINGS_FILE, []);
  const listing: MarketplaceListing = {
    listing_id: uid(), asset_type: opts.asset_type, asset_ref: opts.asset_ref,
    name: opts.name, description: opts.description, owner: opts.owner || 'operator',
    version: 1, trust_level: opts.trust_level || 'community',
    permissions: (opts.permissions || []) as any, status: 'draft',
    plan_availability: opts.plan_availability || ['pro', 'team', 'enterprise'],
    docs_complete: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  listings.unshift(listing);
  if (listings.length > 100) listings.length = 100;
  writeJson(LISTINGS_FILE, listings);
  return listing;
}

export function reviewListing(listingId: string, approved: boolean): MarketplaceListing | null {
  const listings = readJson<MarketplaceListing[]>(LISTINGS_FILE, []);
  const idx = listings.findIndex(l => l.listing_id === listingId);
  if (idx === -1) return null;
  listings[idx].status = approved ? 'approved' : 'rejected';
  listings[idx].updated_at = new Date().toISOString();
  writeJson(LISTINGS_FILE, listings);
  return listings[idx];
}

export function deprecateListing(listingId: string): MarketplaceListing | null {
  const listings = readJson<MarketplaceListing[]>(LISTINGS_FILE, []);
  const idx = listings.findIndex(l => l.listing_id === listingId);
  if (idx === -1) return null;
  listings[idx].status = 'deprecated';
  listings[idx].updated_at = new Date().toISOString();
  writeJson(LISTINGS_FILE, listings);
  return listings[idx];
}

export function getListings(filters?: { status?: string; asset_type?: string }): MarketplaceListing[] {
  let all = readJson<MarketplaceListing[]>(LISTINGS_FILE, []);
  if (filters?.status) all = all.filter(l => l.status === filters.status);
  if (filters?.asset_type) all = all.filter(l => l.asset_type === filters.asset_type);
  return all;
}

export function getListing(listingId: string): MarketplaceListing | null {
  return readJson<MarketplaceListing[]>(LISTINGS_FILE, []).find(l => l.listing_id === listingId) || null;
}

export function getSummary(): { total: number; approved: number; draft: number; review: number; deprecated: number } {
  const all = getListings();
  return { total: all.length, approved: all.filter(l => l.status === 'approved').length, draft: all.filter(l => l.status === 'draft').length, review: all.filter(l => l.status === 'review').length, deprecated: all.filter(l => l.status === 'deprecated').length };
}

module.exports = { publish, reviewListing, deprecateListing, getListings, getListing, getSummary };
