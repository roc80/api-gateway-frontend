// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 此处后端没有提供注释 GET /urp/me */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.UserRolePermissionDto>("/urp/me", {
    method: "GET",
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /urp/me */
export async function upsertMe(
  body: API.UserUpsertDto,
  options?: { [key: string]: any }
) {
  return request<any>("/urp/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /urp/permission */
export async function upsertPermission(
  body: API.PermissionUpsertDto,
  options?: { [key: string]: any }
) {
  return request<any>("/urp/permission", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /urp/permission */
export async function deletePermission(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deletePermissionParams,
  options?: { [key: string]: any }
) {
  return request<any>("/urp/permission", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /urp/permissions */
export async function queryPermissions(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryPermissionsParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseDtoListPermissionDto>("/urp/permissions", {
    method: "GET",
    params: {
      ...params,
      pageRequestDto: undefined,
      ...params["pageRequestDto"],
      permissionQueryDto: undefined,
      ...params["permissionQueryDto"],
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /urp/role */
export async function upsertRole(
  body: API.RoleUpsertDto,
  options?: { [key: string]: any }
) {
  return request<any>("/urp/role", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /urp/role */
export async function deleteRole(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteRoleParams,
  options?: { [key: string]: any }
) {
  return request<any>("/urp/role", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /urp/roles */
export async function queryRoles(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryRolesParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseDtoListRoleDto>("/urp/roles", {
    method: "GET",
    params: {
      ...params,
      pageRequestDto: undefined,
      ...params["pageRequestDto"],
      roleQueryDto: undefined,
      ...params["roleQueryDto"],
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /urp/roles/${param0}/bind-permission */
export async function bindPermissionToRole(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.bindPermissionToRoleParams,
  body: number[],
  options?: { [key: string]: any }
) {
  const { roleId: param0, ...queryParams } = params;
  return request<any>(`/urp/roles/${param0}/bind-permission`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /urp/user */
export async function upsertUser(
  body: API.UserUpsertDto,
  options?: { [key: string]: any }
) {
  return request<any>("/urp/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /urp/user */
export async function deleteUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUserParams,
  options?: { [key: string]: any }
) {
  return request<any>("/urp/user", {
    method: "DELETE",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /urp/users */
export async function queryUsers(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryUsersParams,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseDtoListUserRolePermissionDto>("/urp/users", {
    method: "GET",
    params: {
      ...params,
      pageRequestDto: undefined,
      ...params["pageRequestDto"],
      userQueryDto: undefined,
      ...params["userQueryDto"],
    },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 POST /urp/users/${param0}/bind-role */
export async function bindRoleToUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.bindRoleToUserParams,
  body: number[],
  options?: { [key: string]: any }
) {
  const { userId: param0, ...queryParams } = params;
  return request<any>(`/urp/users/${param0}/bind-role`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
