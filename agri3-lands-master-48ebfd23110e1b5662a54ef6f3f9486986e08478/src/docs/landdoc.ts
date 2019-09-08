import { ApiDoc } from "sakura-node-3";
import { LandController } from "../controller/landcontroller";

/* tslint:disable:ter-max-len */
export const doc: ApiDoc = {
  groupName: "land",
  descriptions: [
    {
      function: LandController.getGeojson,
      description: "获取所有地块中心 geojson",
      detailDescription: "获取所有地块中心 geojson",
      method: "GET",
      uri: "/api/lands/geojson",
      queryParameters: [
        {
          key: "department",
          example: 1,
          type: "number?",
          description: "部门 id"
        }
      ],
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "type": "FeatureCollection",
        "crs": {
          "type": "name",
          "properties": {
            "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
          }
        },
        "features": [
          {
            "type": "Feature",
            "landId": 704,
            "geometry": {
              "type": "Point",
              "coordinates": [
                120.837714041813,
                37.155704305565
              ]
            },
            "properties": {
              "id": 704,
              "name": "D01",
              "inputArea": 19.6,
              "owner": "唐中"
            }
          }
        ]
      },
      additionalConditions: [
        {
          keyPath: "data/features/0/landId",
          type: "KeyExist"
        },
        {
          keyPath: "data/features/0/geometry",
          type: "KeyExist"
        },
        {
          keyPath: "data/features/0/geometry/coordinates/0",
          type: "KeyExist"
        },
        {
          keyPath: "data/features/0/geometry/coordinates/1",
          type: "KeyExist"
        },
        {
          keyPath: "data/features/0/properties/id",
          type: "KeyExist"
        },
        {
          keyPath: "data/features/0/properties/name",
          type: "KeyExist"
        },
        {
          keyPath: "data/features/0/properties/inputArea",
          type: "KeyExist"
        },
        {
          keyPath: "data/features/0/properties/owner",
          type: "KeyExist"
        }
      ]
    },
    {
      function: LandController.getLandStatistics,
      description: "获取地块统计信息",
      detailDescription: "获取地块统计信息",
      method: "GET",
      uri: "/api/lands/statistics",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "data": {
          "info": [
            {
              "bounds": {
                "minLat": 37.0971893089395,
                "maxLat": 37.474432722792,
                "minLon": 120.547745869276,
                "maxLon": 120.926591552158
              },
              "center": {
                "lat": 37.28581101586575,
                "lon": 120.737168710717
              },
              "totalSize": 718,
              "totalArea": 8347.24032558797,
              "departmentId": 1
            }
          ],
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/info",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/bounds",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/bounds/minLat",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/bounds/maxLat",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/bounds/minLon",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/bounds/maxLon",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/center",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/center/0",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/center/0/lat",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/center/0/lon",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/totalSize",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/totalArea",
          type: "KeyExist"
        },
        {
          keyPath: "data/info/0/departmentId",
          type: "KeyExist"
        }
      ]
    },
    {
      function: LandController.getLands,
      description: "获取地块列表",
      detailDescription: "获取地块列表",
      method: "GET",
      uri: "/api/lands",
      queryParameters: [
        {
          key: "department",
          example: 1,
          type: "number?",
          description: "部门 id"
        },
        {
          key: "query",
          example: "地块名",
          type: "string?",
          description: "地块名称或权属人"
        },
        {
          key: "sort_type",
          example: 1,
          type: "string?",
          description: "ASC or DESC"
        },
        {
          key: "model",
          example: 1,
          type: "string?",
          description: "要带的话，只能是 simple，不返回 geojson"
        },
      ],
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "data": {
          "lands": [
            {
              "id": 772,
              "name": "地块 772",
              "remark": "",
              "measuredArea": 57.7,
              "inputArea": 57.7,
              "crop": "",
              "ridgeCount": 0,
              "ridgeLength": 0,
              "createdBy": "13021184411",
              "createdAt": 1536028998,
              "geojson": {
                "coordinates": [
                  [
                    [
                      120.66411395750782,
                      37.20620979823039
                    ]
                  ]
                ],
                "type": "Polygon"
              },
              "landCenter": {
                "type": "Point",
                "coordinates": [
                  120.66551906391737,
                  37.20560546453499
                ]
              },
              "sapling": 0,
              "surviveRatio": 0,
              "supervisorName": null,
              "pmName": null,
              "supervisorTelephone": null,
              "pmTelephone": null,
              "owner": ""
            }
          ]
        }
      },
      additionalConditions: [
        {
          keyPath: "data/lands",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/id",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/name",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/remark",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/measuredArea",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/inputArea",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/crop",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/ridgeCount",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/createdBy",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/createdAt",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/geojson",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/landCenter",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/sapling",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/surviveRatio",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/supervisorName",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/pmName",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/supervisorTelephone",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/pmTelephone",
          type: "KeyExist"
        },
        {
          keyPath: "data/lands/0/owner",
          type: "KeyExist"
        }
      ]
    },
    {
      function: LandController.contouringLand,
      description: "新增地块",
      detailDescription: "新增地块",
      method: "POST",
      uri: "/api/lands/contouring",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      requestBody: {
        "createdBy": "aaa",
        "measureSize": 777,
        "landCenter": {
          "type": "Point",
          "coordinates": [
            116.305298277981,
            39.9850563878281
          ]
        },
        "landGeojson": { "type": "Polygon", "coordinates": [[[121.15052802637206, 48.742500785449444], [121.15194285377615, 48.74276867598439], [121.15404140452907, 48.74390760015295], [121.15498344128699, 48.74483501845686], [121.15557357910754, 48.74514419710935], [121.15610251524984, 48.74519909950203], [121.15794136610525, 48.744887299218036], [121.1598450643939, 48.744953368812496], [121.16033849277709, 48.744706538967776], [121.15899992710453, 48.74334426438155], [121.15852739227333, 48.7426691132799], [121.15374798412957, 48.738383291956715], [121.15324746080603, 48.73850198527994], [121.14915203402306, 48.741617145441566], [121.15052802637206, 48.742500785449444]]] }
      },
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/id",
          type: "KeyExist"
        }
      ]
    },
    {
      function: LandController.contouringLand,
      description: "修改地块 geometry",
      detailDescription: "修改地块 geometry",
      method: "POST",
      uri: "/api/lands/contouring/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "地块 ID"
        }
      ],
      requestBody: {
        "createdBy": "aaa",
        "measureSize": 777,
        "landCenter": {
          "type": "Point",
          "coordinates": [
            116.305298277981,
            39.9850563878281
          ]
        },
        "landGeojson": { "type": "Polygon", "coordinates": [[[121.15052802637206, 48.742500785449444], [121.15194285377615, 48.74276867598439], [121.15404140452907, 48.74390760015295], [121.15498344128699, 48.74483501845686], [121.15557357910754, 48.74514419710935], [121.15610251524984, 48.74519909950203], [121.15794136610525, 48.744887299218036], [121.1598450643939, 48.744953368812496], [121.16033849277709, 48.744706538967776], [121.15899992710453, 48.74334426438155], [121.15852739227333, 48.7426691132799], [121.15374798412957, 48.738383291956715], [121.15324746080603, 48.73850198527994], [121.14915203402306, 48.741617145441566], [121.15052802637206, 48.742500785449444]]] }
      },
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/id",
          type: "KeyExist"
        }
      ]
    },
    {
      function: LandController.contouringLand,
      description: "修改地块 geometry",
      detailDescription: "修改地块 geometry",
      method: "POST",
      uri: "/api/lands/contouring/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "地块 ID"
        }
      ],
      requestBody: {
        "createdBy": "aaa",
        "measureSize": 777,
        "landCenter": {
          "type": "Point",
          "coordinates": [
            116.305298277981,
            39.9850563878281
          ]
        },
        "landGeojson": { "type": "Polygon", "coordinates": [[[121.15052802637206, 48.742500785449444], [121.15194285377615, 48.74276867598439], [121.15404140452907, 48.74390760015295], [121.15498344128699, 48.74483501845686], [121.15557357910754, 48.74514419710935], [121.15610251524984, 48.74519909950203], [121.15794136610525, 48.744887299218036], [121.1598450643939, 48.744953368812496], [121.16033849277709, 48.744706538967776], [121.15899992710453, 48.74334426438155], [121.15852739227333, 48.7426691132799], [121.15374798412957, 48.738383291956715], [121.15324746080603, 48.73850198527994], [121.14915203402306, 48.741617145441566], [121.15052802637206, 48.742500785449444]]] }
      },
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/id",
          type: "KeyExist"
        }
      ]
    },
    {
      function: LandController.updateLandInfo,
      description: "修改地块信息",
      detailDescription: "修改地块信息",
      method: "PUT",
      uri: "/api/lands/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "地块 ID"
        }
      ],
      requestBody: {
        "crop": "aaa",
        "remark": "ccc",
        "inputSize": 777,
        "landName": "vvv",
        "ridgeCount": 1,
        "ridgeLength": 2
      },
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      }
    },
    {
      function: LandController.updateLandInfo,
      description: "删除地块",
      detailDescription: "删除地块",
      method: "DELETE",
      uri: "/api/lands/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "地块 ID"
        }
      ],
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      }
    }
  ]
};
