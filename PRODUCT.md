# Product

## Register

product

## Users

Today: a single owner-operator using this during fantasy football draft prep and live drafts — building position and overall rankings, tiering players, jotting notes, reordering via drag-and-drop, then scanning the list quickly mid-draft to make a pick under time pressure.

Planned direction: a login-gated multi-user product where each user maintains their own rankings, with a layer that compares and consolidates rankings across users into consensus/"world" rankings. Not built yet — today's design should stay legible and utilitarian rather than being redesigned around this, but layout and component choices shouldn't paint the UI into a single-user-only corner.

## Product Purpose

A fast, dense tool for building and maintaining fantasy football player rankings. Success is being able to glance at the list mid-draft and instantly read a player's name, team, position, and tier with zero friction, and to reorder or re-tier players in as few actions as possible.

## Brand Personality

Utilitarian, Linear-like: dense, fast, minimal chrome, dark by default, information-first. No decoration that doesn't serve scanning or reading speed.

## Anti-references

No specific named anti-reference. Generally avoid generic AI/SaaS dashboard-template tropes (gradient text, glassy decorative cards, hero-metric tiles) — the shared design laws already ban these outright.

## Design Principles

- Legibility under speed: this tool is used live, during a draft, under time pressure — the player name is the single most important piece of information on a row and must be scannable at a glance, ahead of every other field.
- Density without clutter: favor compact, scannable rows over card sprawl; this is a long list that gets scrolled and reordered constantly.
- Clear information hierarchy: name first, team/position second, tier/notes/metadata last — expressed through scale and weight, not just position.
- Utilitarian minimalism: no ornament for its own sake, matching a Linear-style tool aesthetic rather than a consumer sports-app one.

## Accessibility & Inclusion

WCAG AA contrast minimum. No specific accommodation requirements beyond comfortable, solid readability for normal use.
