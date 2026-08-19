#!/usr/bin/env python3
"""Convert a TWDB reservoir shapefile ZIP into lightweight PittCo contour GeoJSON."""
from __future__ import annotations
import argparse,json,tempfile,zipfile
from pathlib import Path
DEPTH_NAMES=("depth","depth_ft","depthfeet")
ELEV_NAMES=("elev","elevation","elev_ft","elevationft","contourelev","contour_elev")
GENERIC_NAMES=("contour","contour_ft","value","gridcode")
def norm(v):return str(v).lower().replace(" ","").replace("_","").replace("-","")
def exact(cols,names):
    lookup={norm(c):c for c in cols}
    for n in names:
        if norm(n) in lookup:return lookup[norm(n)]
    return None
def classify(g,cols,pool):
    d=exact(cols,DEPTH_NAMES)
    if d:return d,True
    e=exact(cols,ELEV_NAMES)
    if e:return e,False
    for c in cols:
        s=str(c).lower()
        if 'depth' in s:return c,True
        if 'elev' in s:return c,False
    c=exact(cols,GENERIC_NAMES)
    if not c:
        for x in cols:
            if 'contour' in str(x).lower():c=x;break
    if not c:return None,None
    if pool is None:return c,True
    try:
        vals=g[c].dropna().astype(float)
        med=float(vals.median())
        # Generic TWDB contour values near the reservoir datum are elevations.
        return c, not (med>pool*0.45 and float(vals.max())<=pool+25)
    except Exception:return c,True
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--zip',required=True);ap.add_argument('--lake',required=True);ap.add_argument('--out',required=True);ap.add_argument('--pool-elevation',type=float);ap.add_argument('--survey',default='');ap.add_argument('--simplify-m',type=float,default=2.5);args=ap.parse_args()
    try:import geopandas as gpd
    except ImportError as e:raise SystemExit('Install geopandas + pyogrio/fiona first') from e
    with tempfile.TemporaryDirectory() as td:
        with zipfile.ZipFile(args.zip) as z:z.extractall(td)
        candidates=[]
        for shp in Path(td).rglob('*.shp'):
            try:
                g=gpd.read_file(shp);geom=set(g.geometry.geom_type.dropna().unique());cols=[c for c in g.columns if c!='geometry'];field,is_depth=classify(g,cols,args.pool_elevation)
                if field and geom & {'LineString','MultiLineString'}:candidates.append((len(g),shp,g,field,is_depth))
            except Exception:pass
        if not candidates:raise SystemExit('No line shapefile with a recognizable depth/elevation contour field found')
        _,src,g,field,is_depth=max(candidates,key=lambda x:x[0])
        if g.crs is None:raise SystemExit(f'Contour source has no CRS: {src}')
        if not is_depth and args.pool_elevation is None:raise SystemExit(f'{src.name} appears elevation-based ({field}); pass --pool-elevation')
        g=g[[field,'geometry']].dropna().to_crs(3857);g['geometry']=g.geometry.simplify(args.simplify_m,preserve_topology=True);g=g[~g.geometry.is_empty].to_crs(4326)
        features=[];depths=[]
        for _,r in g.iterrows():
            try:raw=float(r[field])
            except Exception:continue
            depth=raw if is_depth else args.pool_elevation-raw
            if depth<-.25:continue
            depth=max(0.,depth);depths.append(depth);features.append({'type':'Feature','properties':{'depth_ft':round(depth,2),'source_value':round(raw,3),'source_field':field,'source_kind':'depth' if is_depth else 'elevation','lake':args.lake,'source':'TWDB','survey':args.survey},'geometry':r.geometry.__geo_interface__})
        if not features:raise SystemExit('No valid underwater contours remained after conversion')
        out=Path(args.out);out.parent.mkdir(parents=True,exist_ok=True);payload={'type':'FeatureCollection','pittco':{'lake':args.lake,'provider':'TWDB','survey':args.survey,'reference_pool_elevation':args.pool_elevation,'depth_units':'ft','navigation':False,'min_depth_ft':round(min(depths),2),'max_depth_ft':round(max(depths),2),'feature_count':len(features)},'features':features};out.write_text(json.dumps(payload,separators=(',',':')))
        print(f'{args.lake}: {len(features)} contours, {min(depths):.1f}-{max(depths):.1f} ft -> {out} ({out.stat().st_size/1024/1024:.2f} MB); source {src.name}; field {field}; kind={"depth" if is_depth else "elevation"}')
if __name__=='__main__':main()
