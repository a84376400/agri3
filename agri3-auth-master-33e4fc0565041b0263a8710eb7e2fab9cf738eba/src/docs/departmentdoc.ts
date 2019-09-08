import { ApiDoc } from "sakura-node-3";
import { DepartmentController } from "../controller/departmentcontroller";

export const doc: ApiDoc = {
  groupName: "department",
  descriptions: [
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
    }
  ]
};
