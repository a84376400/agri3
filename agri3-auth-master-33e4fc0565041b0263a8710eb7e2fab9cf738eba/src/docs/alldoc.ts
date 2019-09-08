import { ApiDoc, ApiDocContext } from "sakura-node-3";
import { UserController } from "../controller/usercontroller";
import { DepartmentController } from "../controller/departmentcontroller";

/* tslint:disable:ter-max-len no-empty */
export const doc: ApiDoc = {
  groupName: "user",
  descriptions: [
    {
      function: UserController.login,
      description: "用户登录",
      detailDescription: "用户登录",
      method: "POST",
      uri: "/api/auth/login",
      requestBody: {
        "username": "13021184411",
        "password": "123456"
      },
      responseBody: {
        "data": {
          "token": "318f62f3c422ac4b95c92ba5d051901140439ccb61db92387d3ecc55cdcb15430c962e6cef4a4416891127ecc4cbd5b3",
          "userId": 1,
          "username": "13021184411",
          "displayName": "13021184411",
          "role": "admin",
          "enterpriseId": -1,
          "dataAuthorityId": 2,
          "departments": [
            {
              "departmentId": 1,
              "departmentName": "栖霞木村",
              "haveUsers": true,
              "parentDepartmentId": null
            }
          ],
          "departmentId": 1,
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/token",
          type: "KeyExist"
        },
        {
          keyPath: "data/userId",
          type: "KeyExist"
        },
        {
          keyPath: "data/username",
          type: "KeyExist"
        },
        {
          keyPath: "data/displayName",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0/departmentId",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0/departmentName",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0/parentDepartmentId",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/departmentId",
          type: "KeyExist"
        }
      ]
    },
    {
      function: UserController.getUsers,
      description: "获取所有用户",
      detailDescription: "获取所有用户",
      method: "GET",
      uri: "/api/auth/users",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "data": {
          "users": [
            {
              "userId": 2,
              "username": "13552785696",
              "telephone": "13552785696",
              "displayName": "栖霞木村",
              "enterpriseId": -1,
              "departmentId": 1,
              "dataAuthorityId": 2,
              "dataAuthorityName": "所在部门及子部门数据",
              "role": "user",
              "createdAt": "2018-08-27T05:57:22.000Z"
            }
          ],
          "totalSize": 11,
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/totalSize",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/userId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/username",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/telephone",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/displayName",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/enterpriseId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/departmentId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/dataAuthorityId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/dataAuthorityName",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/role",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/createdAt",
          type: "KeyExist"
        }
      ]
    },
    {
      function: UserController.updateUser,
      description: "修改用户",
      detailDescription: "根据用户 id 来修改用户信息",
      method: "PUT",
      uri: "/api/auth/users/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      requestBody: {
        "displayName": "13021184411"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "用户 ID"
        }
      ],
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      },
    },
    {
      function: UserController.removeUser,
      description: "删除用户",
      detailDescription: "删除用户",
      method: "DELETE",
      uri: "/api/auth/users/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "用户 ID"
        }
      ],
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      }
    },
    {
      function: UserController.addUser,
      description: "新增用户",
      detailDescription: "新增用户",
      method: "POST",
      uri: "/api/auth/users",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      requestBody: {
        "displayName": "myname",
        "telephone": "123456789",
        "username": "myname",
        "departmentId": 1,
        "dataAuthorityId": 2
      },
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      }
    },
    {
      function: DepartmentController.getSubDepartment,
      description: "获取所有部门",
      detailDescription: "获取所有部门",
      method: "GET",
      uri: "/api/auth/departments",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "data": {
          "users": [
            {
              "userId": 2,
              "username": "13552785696",
              "telephone": "13552785696",
              "displayName": "栖霞木村",
              "enterpriseId": -1,
              "departmentId": 1,
              "dataAuthorityId": 2,
              "dataAuthorityName": "所在部门及子部门数据",
              "role": "user",
              "createdAt": "2018-08-27T05:57:22.000Z"
            }
          ],
          "totalSize": 11,
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/totalSize",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/userId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/username",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/telephone",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/displayName",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/enterpriseId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/departmentId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/dataAuthorityId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/dataAuthorityName",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/role",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/createdAt",
          type: "KeyExist"
        }
      ]
    },
    {
      function: DepartmentController.getDepartmentsInfo,
      description: "获取用户可获取的所有部门",
      detailDescription: "获取用户可获取的所有部门",
      method: "GET",
      uri: "/api/auth/departments/info",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "data": {
          "departments": [
            {
              "departmentId": 1,
              "departmentName": "栖霞木村",
              "parentDepartmentId": null,
              "childDepartments": []
            }
          ],
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/departments",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0/departmentId",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0/departmentName",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0/parentDepartmentId",
          type: "KeyExist"
        },
        {
          keyPath: "data/departments/0/childDepartments",
          type: "KeyExist"
        }
      ]
    },
    {
      function: DepartmentController.getSubDepartmentsByUserId,
      description: "根据 token 获取用户最新的部门信息",
      detailDescription: "根据 token 获取用户最新的部门信息",
      method: "GET",
      uri: "/api/auth/users/departments",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      responseBody: {
        "data": {
          "displayName": "13021184411",
          "childDepartmentsHaveUser": [
            1,
          ],
          "childDepartments": [
            1,
          ],
          "relation": ":2,:3,:4,:5,:6,7:9,7:10,:7,:11,:1",
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/displayName",
          type: "KeyExist"
        },
        {
          keyPath: "data/childDepartmentsHaveUser",
          type: "KeyExist"
        },
        {
          keyPath: "data/childDepartments",
          type: "KeyExist"
        },
        {
          keyPath: "data/relation",
          type: "KeyExist"
        }
      ]
    },
    {
      function: DepartmentController.getSubDepartment,
      description: "获取 parent_id 下第一层级的部门和用户",
      detailDescription: "获取 parent_id 下第一层级的部门和用户",
      method: "GET",
      uri: "/api/auth/departments",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "parent_id",
          example: 1,
          type: "number",
          description: "父部门 ID"
        }
      ],
      responseBody: {
        "data": {
          "departments": [],
          "users": [
            {
              "userId": 3,
              "username": "15866477773",
              "displayName": "栖霞木村",
              "role": "user",
              "dataAuthorityId": 2,
              "telephone": "15866477773"
            },
          ],
          "code": 200
        }
      },
      additionalConditions: [
        {
          keyPath: "data/departments",
          type: "KeyExist"
        },
        {
          keyPath: "data/users",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/userId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/username",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/displayName",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/role",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/dataAuthorityId",
          type: "KeyExist"
        },
        {
          keyPath: "data/users/0/telephone",
          type: "KeyExist"
        }
      ]
    },
    {
      function: DepartmentController.addDepartment,
      description: "新增部门",
      detailDescription: "新增部门",
      method: "POST",
      uri: "/api/auth/departments",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      requestBody: {
        "parentId": 1,
        "name": "new_department"
      },
      responseBody: {
        "data": {
          "id": 2,
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
      function: DepartmentController.updateDepartment,
      description: "修改部门",
      detailDescription: "修改部门",
      method: "PUT",
      uri: "/api/auth/departments/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "部门 ID"
        }
      ],
      requestBody: {
        "name": "new_name"
      },
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      }
    },
    {
      function: DepartmentController.removeDepartment,
      description: "删除部门",
      detailDescription: "删除部门",
      method: "DELETE",
      uri: "/api/auth/departments/{id}",
      requestHeaders: {
        "token": "f7ce2aae08d917292fb20c8ec4a41ea707bea715f61a89729a77116f3cc9cb6f2a73e1f2e97ebf5cdc384e458b592e4e"
      },
      queryParameters: [
        {
          key: "id",
          example: 1,
          type: "number",
          description: "部门 ID"
        }
      ],
      responseBody: {
        "data": {
          "id": 1,
          "code": 200
        }
      }
    },
    {
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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
    },
    {
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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
      function: () => {},
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

ApiDocContext.generateMonitorConfig({ appId: 1390496724, host: "https://agri3-dev.gagogroup.cn", timeInterval: 10, outputFilePath: "/Users/huangtaihu/Desktop/model.config.json", docs: [doc] });
