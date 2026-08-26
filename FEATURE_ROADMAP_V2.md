# PittCo Fishing — Competitive Feature Roadmap V2

## Product identity
PittCo should be a bass-fishing decision system: lake intelligence + live conditions + personal history -> an actionable fishing plan.

## P0 — Current build
- Today's Game Plan / bite score
- Pattern Memory from personal catch history
- Lake Command Center intelligence engine
- Water-level trend interpretation
- Bass-specific seasonal depth/area/bait suggestions
- Fishing Layers preference framework
- Target-depth-band support
- Catch privacy model: Private / Water Only / Public

## P1 — Wire into UI
- Command Center cards on every lake profile
- Start Trip button that snapshots weather/lake conditions
- Automatic conditions attached to catch logs
- Personal Best and lake-specific records
- Favorite lake status chips: rising/falling/stable + bite score
- Fishing Layers drawer on map
- Private waypoint CRUD

## P2 — Data expansion
- Public fish attractors
- Regulations by lake/state
- Ramp/access status
- Water clarity where authoritative data exists
- Vegetation and bottom-composition layers where licensed/open data exists
- Historical condition comparison

## P3 — Tournament mode
- Tournament clock
- Five-fish / configurable limit livewell
- Cull board and smallest-fish indicator
- Running weight and target weight
- Spot rotation / run plan
- Offline emergency snapshot of selected lake, ramps and saved waypoints

## Guardrails
- Never label stale agency readings as live.
- Never fabricate bathymetry, clarity, vegetation, fishing reports, or crowd trends.
- Personal spots default private.
- Explain why a recommendation was made; avoid unexplained AI scores.
- Distinguish personal-history recommendations from community/agency data.
