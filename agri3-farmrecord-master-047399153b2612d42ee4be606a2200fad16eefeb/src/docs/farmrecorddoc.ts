import { ApiDoc, ApiDocContext } from "sakura-node-3";
import { Farmrecordcontroller } from "../controller/farmrecordcontroller";

export const doc: ApiDoc = {
  groupName: "farm-record",
  descriptions: [
    {
      function: Farmrecordcontroller.getAllFarmrecordsByQuery,
      description: "获取所有农事记录",
      detailDescription: "获取所有农事记录",
      queryParameters: [
        {
          key: "department",
          example: 8,
          type: "number",
          description: "option，部门 id，0 和不带任何变量为显示有权限的所有部门"
        },
        {
          key: "enterprise",
          example: 1,
          type: "number",
          description: "option，企业 id，不带为显示用户所属企业"
        },
        {
          key: "query",
          example: "下雨",
          type: "string",
          description: "option，模糊查询用户名或备注"
        },
        {
          key: "start",
          example: "2018-08-01",
          type: "string",
          description: "option，农事时间在 start 以后的时间"
        },
        {
          key: "end",
          example: "2018-10-01",
          type: "string",
          description: "option，农事时间在 end 以后的时间"
        },
        {
          key: "sort_type",
          example: "ASC",
          type: "string",
          description: "option，default 是 DESC，只接受 asc, desc 两个"
        },
      ],
      method: "GET",
      uri: "/api/farmrecord/all",
      requestHeaders: {
        "token": "eccb7dff5d52a0bf20906be10abb4b6d57fd3f84f29c19b90f423d1e9c32479efb27e2137a1b44627dff7c1ca59f0c89"
      },
      responseBody: {
        "data": {
          "farmrecords": [
            {
              "id": 445,
              "recordLatitude": 37.20937100428181,
              "recordLongitude": 120.63112306813393,
              "recordText": "把玩桃核没保安头就是不一样啊。",
              "recordAudioUrl": "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/14-0.0015465769743243651-iat.mp3",
              "recordAudioLen": 12,
              "recordPictureUrls": [
                "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/14-0.0015465769743243651-1535414232000.jpg",
                "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/14-0.0015465769743243651-1535414232287.jpg",
                "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/14-0.0015465769743243651-1535414232152.jpg"
              ],
              "userName": "栖霞木村",
              "userId": 14,
              "updatedAt": "2018-08-28T06:09:21.000Z"
            }
          ],
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/farmrecords/0/id",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/recordLatitude",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/recordLongitude",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/recordText",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/recordAudioLen",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/recordPictureUrls/0",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/recordPictureUrls/1",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/userName",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/userId",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecords/0/updatedAt",
          type: "KeyExist"
        }
      ]
    },
    {
      function: Farmrecordcontroller.getGeojson,
      description: "获取农事标签 geojson",
      detailDescription: "获取农事标签 geojson",
      method: "GET",
      uri: "/api/farmrecord/geojson",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "data": {
          "geojson": {
            "type": "FeatureCollection",
            "crs": {
              "type": "name",
              "properties": {
                "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
              }
            },
            "features": [
              // there will contain multiple features
              {
                "type": "Feature",
                "id": 20,
                "geometry": {
                  "type": "Point",
                  "coordinates": [
                    120.688490288926,
                    37.1753335325916
                  ]
                },
                "properties": {
                  "id": 20
                }
              }
            ]
          },
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/geojson/features",
          type: "KeyExist"
        },
        {
          keyPath: "data/geojson/features/0/type",
          type: "KeyExist"
        },
        {
          keyPath: "data/geojson/features/0/id",
          type: "KeyExist"
        },
        {
          keyPath: "data/geojson/features/0/geometry/coordinates",
          type: "KeyExist"
        },
        {
          keyPath: "data/geojson/features/0/properties/id",
          type: "KeyExist"
        },
      ]
    },
    {
      function: Farmrecordcontroller.getFarmrecordById,
      description: "根据农事 id 获取详细信息",
      detailDescription: "获取农事标签 geojson",
      method: "GET",
      uri: "/api/farmrecord/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 66,
          type: "number",
          description: "农事记录的 ID"
        }
      ],
      responseBody: {
        "data": {
          "farmrecord": {
            "id": 66,
            "recordLatitude": 37.20400952512757,
            "recordLongitude": 120.63993982023601,
            "recordText": "请专家们看看这是什么病啊。",
            "recordAudioUrl": "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/7-0.403064967225073-iat.mp3",
            "recordAudioLen": 0,
            "recordPictureUrls": [
              "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/7-0.403064967225073-1533891686390.jpg",
              "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/7-0.403064967225073-1533891686690.jpg",
              "https://gago-data.oss-cn-beijing.aliyuncs.com/agri3/7-0.403064967225073-1533891686558.jpg"
            ],
            "userName": "栖霞木村",
            "userId": 2,
            "updatedAt": "2018-08-10T09:01:28.000Z"
          },
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/farmrecord/recordLatitude",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/recordLongitude",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/recordText",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/recordAudioUrl",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/recordAudioLen",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/recordPictureUrls",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/userName",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/userId",
          type: "KeyExist"
        },
        {
          keyPath: "data/farmrecord/updatedAt",
          type: "KeyExist"
        }
      ]
    },
    {
      function: Farmrecordcontroller.deleteFarmRecordById,
      description: "删除农事记录",
      detailDescription: "删除农事记录",
      method: "DELETE",
      uri: "/api/farmrecord/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "农事记录的 ID"
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

ApiDocContext.generateMonitorConfig({ appId: 1390496724, host: "https://agri3-dev.gagogroup.cn", timeInterval: 2, outputFilePath: "/Users/huangtaihu/Desktop/model.config.json", docs: [doc] });
