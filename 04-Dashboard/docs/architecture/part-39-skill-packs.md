# Part 39: Agent Skill Packs + Domain Engine Templates + Capability Composer

## Overview
Packages reusable capabilities into skill packs, creates domain-specific engine templates, and composes final capability profiles from all sources.

## Architecture
```
Skill Packs → versioned capability bundles (recipes, preferences, patterns, policies)
Engine Templates → domain-specific engine configurations (startup, research, creative, ops)
Capability Composer → merges template + packs + overrides + constraints → composition plan
```
