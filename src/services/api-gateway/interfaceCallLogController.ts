// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 查询接口调用日志详情 根据 ID 查询接口调用日志详细信息 GET /interfaces/logs/${param0} */
export async function getById2(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getById2Params,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params;
  return request<API.InterfaceCallLogDto>(`/interfaces/logs/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 分页查询接口调用日志列表 根据条件分页查询接口调用日志列表 POST /interfaces/logs/search */
export async function searchInterfaceCallLog(
  body: API.PageRequestDtoInterfaceCallLogQueryDto,
  options?: { [key: string]: any }
) {
  return request<API.PageResponseDtoListInterfaceCallLogDto>(
    "/interfaces/logs/search",
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
