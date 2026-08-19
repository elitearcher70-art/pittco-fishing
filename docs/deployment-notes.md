# PittCo deployment notes

## Current production state

PittCo Fishing is deployed to the connected Vercel production project. The public app entry is `https://pittco-fishing.vercel.app` and the current production deployment is `dpl_74XNXYiqfP5uRWXVfbFgscE3d8QK`.

GitHub `main` is the source for the approved PittCo pages and data. Vercel serves a small same-origin release loader plus direct-route stubs, allowing all loaded PittCo screens to share the same browser local storage for catches, trips, tackle, settings, favorites, community data, and private waypoints.

The release loader also feeds the scalable nationwide lake catalog into the preserved core fishing engine at runtime. This removes the old four-lake Oklahoma limitation from catch/trip/tournament lake selectors and the fishing map without rewriting the proven logging, photo, GPS, waypoint, weather, or map code. A lake profile can pass its lake ID directly into Fishing Tools so that lake is prioritized when the fishing map opens.

## Verified release checks

- Vercel production deployment reports `READY` and targets `production`.
- Public root returns HTTP 200.
- Direct Fishing Tools route returns HTTP 200.
- Direct Lake Directory route returns HTTP 200.
- Direct Community route, including a lake query such as `?lake=al-guntersville`, returns HTTP 200 and preserves the route query for the loaded Community screen.
- Direct Settings and Profile routes return HTTP 200.
- Vercel runtime error report for the release window contains no errors.
- GitHub/Vercel release entry loader is query-safe and supports direct/bookmarked routes.

## Working MVP features

- Catch logging with photos, weight, species, lure, depth, area, date, optional GPS, and saved weather context.
- Trip journal.
- Tackle locker.
- Tournament tracker.
- Leaflet fishing map with street/satellite layers, catch markers, private waypoints, nearby boat-ramp overlays, and device geolocation.
- Live weather.
- Nationwide lake directory/search architecture with state/region search, tier filters, favorites, recent lakes, home lake, geolocation/distance sorting, live lake weather, maps, Community links, and Fishing Tools links.
- Core fishing-tool lake selectors and map are now populated from the same nationwide catalog rather than an Oklahoma-only hard-coded list.
- 31 nationwide seed fisheries in `data/lakes.json`, structured so the catalog can expand to thousands of waters without hard-coded page logic.
- Lake-specific Community boards with reports, catches, tournament talk, tackle/technique posts, questions, lake updates, reactions, saves, local posting, and reporting scaffold.
- Profile and Settings with angler name, home lake, target bass species, skill level, preferred techniques, units, appearance, privacy controls, notifications, and JSON data export.
- Exact catch GPS and private waypoints remain private by default. Community does not automatically pull exact coordinates from catches or waypoints.
- Premium PittCo home, drawer/menu navigation, Help/About, and Shopify-ready Merch entry.
- Social links are configuration-driven and remain disabled when no official URL is supplied.

## Known future/backend work

The current release is usable as a device-local PittCo MVP. Community posts/reactions/saves are local to the browser until authentication and a shared backend are added. Profiles are device-local rather than cloud accounts. Follow relationships and server-side moderation/report queues are scaffolded concepts, not a live backend service yet.

Merch becomes an external live storefront when an official Shopify/store URL is added to `data/app-config.json`. YouTube, Instagram, Facebook, and TikTok buttons activate only after official PittCo account URLs are configured.

Weather, maps, satellite imagery, boat-ramp lookups, and geolocation depend on their respective browser/public network services and user permissions.
