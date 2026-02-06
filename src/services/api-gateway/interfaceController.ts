// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 创建接口 创建新的接口信息 POST /api/interfaces */
export async function create(
  body: API.InterfaceCreateDto,
  options?: { [key: string]: any }
) {
  return request<API.InterfaceDto>("/api/interfaces", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询接口详情 根据 ID 查询接口详细信息 GET /api/interfaces/${param0} */
export async function getById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByIdParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InterfaceDto>(`/api/interfaces/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新接口 根据 ID 更新接口信息 PUT /api/interfaces/${param0} */
export async function update(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateParams,
  body: API.InterfaceUpdateDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InterfaceDto>(`/api/interfaces/${param0}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除接口 根据 ID 删除接口 DELETE /api/interfaces/${param0} */
export async function deleteUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/interfaces/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新接口启用状态 启用或禁用接口 PATCH /api/interfaces/${param0}/enabled */
export async function patchEnabled(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.patchEnabledParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InterfaceDto>(`/api/interfaces/${param0}/enabled`, {
    method: "PATCH",
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 批量删除接口 根据 ID 列表批量删除接口 DELETE /api/interfaces/batch */
export async function batchDeleteInterfaces(
  body: API.InterfaceBatchDeleteDto,
  options?: { [key: string]: any }
) {
  return request<any>("/api/interfaces/batch", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页查询接口列表 根据条件分页查询接口列表 POST /api/interfaces/search */
export async function searchInterfaces(
  body: API.PageRequestDtoInterfaceQueryDto,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseDtoListInterfaceDto>(
    "/api/interfaces/search",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
