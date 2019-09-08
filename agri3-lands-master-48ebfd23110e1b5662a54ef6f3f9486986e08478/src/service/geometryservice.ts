const CRS: any = { "crs": { "type": "name", "properties": { "name": "EPSG:4326" } } };

export class GeometryService {

  static processGeojson(geojson: any): any {
    return Object.assign({}, CRS, geojson);
  }
}
