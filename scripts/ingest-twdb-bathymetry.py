#!/usr/bin/env python3
"""Convert a TWDB reservoir shapefile ZIP into lightweight PittCo contour GeoJSON.

Usage:
  python scripts/ingest-twdb-bathymetry.py --zip Shapefiles.zip --lake tx-fork --out data/bathymetry/tx-fork.geojson

Requires: geopandas, pyogrio/fiona, shapely, pyproj.
The script intentionally runs offline/build-time; mobile clients never download raw TWDB archives.
"""
from __future__ import annotations
import argparse, json, tempfile, zipfile
from pathlib import Path

DEPTH_NAMES=("depth","depth_ft","depthfeet","contour","contour_ft","elev","elevation","z")

def pick_depth(cols):
    lookup={c.lower().replace(" ","").replace("_",""):c for c in cols}
    for n in DEPTH_NAMES:
        k=n.replace("_","")
        if k in lookup:return lookup[k]
    for c in cols:
        s=c.lower()
        if "depth" in s or "contour" in s:return c
    return None

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--zip",required=True)
    ap.add_argument("--lake",required=True)
    ap.add_argument("--out",required=True)
    ap.add_argument("--simplify",type=float,default=0.000025,help="WGS84 simplification tolerance")
    args=ap.parse_args()
    try: import geopandas as gpd
    except ImportError as e: raise SystemExit("Install geopandas + pyogrio/fiona first") from e
    with tempfile.TemporaryDirectory() as td:
        with zipfile.ZipFile(args.zip) as z:z.extractall(td)
        candidates=[]
        for shp in Path(td).rglob("*.shp"):
            try:
                g=gpd.read_file(shp)
                geom=set(g.geometry.geom_type.dropna().unique())
                d=pick_depth([c for c in g.columns if c!="geometry"])
                if d and geom & {"LineString","MultiLineString"}: candidates.append((len(g),shp,g,d))
            except Exception: pass
        if not candidates: raise SystemExit("No line shapefile with a recognizable depth/contour field found")
        _,src,g,depth=max(candidates,key=lambda x:x[0])
        if g.crs is None: raise SystemExit(f"Contour source has no CRS: {src}")
        g=g[[depth,"geometry"]].dropna().to_crs(4326)
        g["geometry"]=g.geometry.simplify(args.simplify,preserve_topology=True)
        g=g[~g.geometry.is_empty]
        features=[]
        for _,r in g.iterrows():
            try:d=float(r[depth])
            except Exception:continue
            geom=r.geometry.__geo_interface__
            features.append({"type":"Feature","properties":{"depth":round(d,2),"lake":args.lake,"source":"TWDB"},"geometry":geom})
        out=Path(args.out);out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(json.dumps({"type":"FeatureCollection","features":features},separators=(",",":")))
        print(f"{args.lake}: {len(features)} contours -> {out} ({out.stat().st_size/1024/1024:.2f} MB); source {src.name}; field {depth}")
if __name__=="__main__":main()
