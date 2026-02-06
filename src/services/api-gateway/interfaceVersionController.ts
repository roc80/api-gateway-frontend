// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 新增接口版本 POST /api/interfaces/versions */
export async function createInterfaceVersion(
  body: API.InterfaceVersionCreateDto,
  options?: { [key: string]: any }
) {
  return request<API.InterfaceVersionDto>("/api/interfaces/versions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 查询接口版本详情 根据 ID 查询接口版本详细信息 GET /api/interfaces/versions/${param0} */
export async function getById1(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getById1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InterfaceVersionDto>(
    `/api/interfaces/versions/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    }
  );
}

/** 更新接口版本 POST /api/interfaces/versions/${param0} */
export async function updateInterfaceVersion(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.update1Params,
  body: API.InterfaceVersionUpdateDto,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InterfaceVersionDto>(
    `/api/interfaces/versions/${param0}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      params: { ...queryParams },
      data: body,
      ...(options || {}),
    }
  );
}

/** 删除接口版本 DELETE /api/interfaces/versions/${param0} */
export async function deleteInterfaceVersion(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.delete1Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/api/interfaces/versions/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 批量删除接口版本 DELETE /api/interfaces/versions/batch */
export async function batchDeleteInterfaceVersion(
  body: API.InterfaceVersionBatchDeleteDto,
  options?: { [key: string]: any }
) {
  return request<any>("/api/interfaces/versions/batch", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 分页查询接口版本列表 根据条件分页查询接口版本列表 POST /api/interfaces/versions/search */
export async function searchInterfaceVersion(
  body: API.PageRequestDtoInterfaceVersionQueryDto,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseDtoListInterfaceVersionDto>(
    "/api/interfaces/versions/search",
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
