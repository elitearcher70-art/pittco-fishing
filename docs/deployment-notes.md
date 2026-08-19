# PittCo deployment notes

## Current safe state

- Production remains on the known-working chunked Vercel deployment.
- GitHub `main` contains the newer nationwide lake directory, Community, Settings, More menu, and the preserved legacy fishing-tool page.
- Catch logging, photos, GPS, maps, waypoints, trips, tackle, tournaments, and live weather remain preserved in `legacy.html` and the current production build has not been overwritten.

## Current blocker

The connected Vercel deployment action is currently exposing an inconsistent schema: the visible tool accepts no arguments, while the underlying action rejects the call unless `target`, `name`, and `files` are supplied. Because a verified preview cannot currently be created through that action, production should not be replaced blindly.

## Release rule

Only promote the integrated GitHub build after a preview can be loaded and checked for:

- homepage/navigation load
- Catch/Trips/Tackle/Tournaments access
- photo capture/upload behavior on iOS Safari
- geolocation permission flow
- Leaflet map, catches, waypoints, and boat-ramp overlays
- live weather
- nationwide lake search/filter/favorites/recent/home-lake behavior
- lake deep-links into Community
- Settings persistence/privacy defaults

## Latest integration work

- Lake directory now supports favorites, recent lakes, geolocation sorting, home-lake synchronization with Settings, and lake profile actions for map, Community, and fishing tools.
- Community now accepts `?lake=<lake-id-or-name>` deep links and preselects the correct lake board/composer.
- Community posts use the saved angler profile name when available.
- Mobile Safari touch/scroll behavior was hardened on new lake/community surfaces.
