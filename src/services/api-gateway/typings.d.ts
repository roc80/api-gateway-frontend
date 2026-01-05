declare namespace API {
  type bindPermissionToRoleParams = {
    roleId: number;
  };

  type bindRoleToUserParams = {
    userId: number;
  };

  type delete1Params = {
    /** 接口版本ID */
    id: number;
  };

  type deletePermissionParams = {
    permissionId: number;
  };

  type deleteRoleParams = {
    roleId: number;
  };

  type deleteUserParams = {
    userId: number;
  };

  type deleteUsingDELETEParams = {
    /** 接口ID */
    id: number;
  };

  type getById1Params = {
    /** 接口版本ID */
    id: number;
  };

  type getById2Params = {
    /** 接口调用日志ID */
    id: number;
  };

  type getByIdParams = {
    /** 接口ID */
    id: number;
  };

  type InterfaceBatchDeleteDto = {
    /** 要删除的接口ID列表 */
    ids: number[];
  };

  type InterfaceCallLogDto = {
    id?: number;
    /** 被调用的接口ID */
    apiId?: number;
    /** 该接口的版本ID */
    versionId?: number;
    /** 调用者 */
    caller?: string;
    /** 请求JSON */
    requestData?: JSONB;
    /** 响应JSON */
    responseData?: JSONB;
    /** 响应状态码 */
    statusCode?: number;
    /** 是否调用成功 */
    success?: boolean;
    /** 请求耗时（ms） */
    durationMs?: number;
    /** 调用日志创建时间 */
    createTime?: string;
  };

  type InterfaceCallLogQueryDto = {
    /** 被调用的接口ID */
    apiId?: number;
    /** 该接口的版本ID */
    versionId?: number;
    /** 调用者 */
    caller?: string;
    /** 响应状态码 */
    statusCode?: number;
    /** 是否调用成功 */
    success?: boolean;
    /** 请求耗时（ms） */
    durationMs?: number;
    /** 调用日志创建时间 */
    createTimeStart?: string;
    /** 调用日志创建时间 */
    createTimeEnd?: string;
  };

  type InterfaceCreateDto = {
    name: string;
    description?: string;
    /** 接口分类 */
    category?: string;
    owner: string;
  };

  type InterfaceDto = {
    id?: number;
    /** 接口名称 */
    name?: string;
    /** 接口唯一标识 */
    code?: string;
    /** 接口描述 */
    description?: string;
    /** 接口是否启用 */
    enabled?: boolean;
    /** 接口分类 */
    category?: string;
    /** 接口所有者 */
    owner?: string;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
  };

  type InterfaceQueryDto = {
    /** 接口名称 */
    name?: string;
    /** 接口唯一标识 */
    code?: string;
    /** 接口描述 */
    description?: string;
    /** 接口是否启用 */
    enabled?: boolean;
    /** 接口分类 */
    category?: string;
    /** 接口所有者 */
    owner?: string;
    /** 创建时间开始 */
    createTimeStart?: string;
    /** 创建时间结束 */
    createTimeEnd?: string;
    /** 更新时间开始 */
    updateTimeStart?: string;
    /** 更新时间结束 */
    updateTimeEnd?: string;
  };

  type InterfaceUpdateDto = {
    name: string;
    description?: string;
    /** 接口分类 */
    category?: string;
  };

  type InterfaceVersionBatchDeleteDto = {
    /** 要删除的接口版本ID列表 */
    ids: number[];
  };

  type InterfaceVersionCreateDto = {
    /** 接口id */
    apiId: number;
    /** 接口版本 */
    version: string;
    /** 是否是当前版本 */
    current?: boolean;
    /** HTTP请求方法 */
    httpMethod: string;
    /** HTTP请求路径 */
    path: string;
    /** HTTP请求头 */
    requestHeaders?: JSONB;
    /** HTTP请求参数 */
    requestParams?: JSONB;
    /** HTTP请求体 */
    requestBody?: JSONB;
    /** HTTP响应体 */
    responseBody?: JSONB;
    /** HTTP响应示例 */
    responseExample?: JSONB;
    /** CURL请求示例 */
    exampleCurl?: string;
    /** 代码示例 */
    exampleCode?: JSONB;
    /** 认证方式 */
    authType?: string;
  };

  type InterfaceVersionDto = {
    id?: number;
    /** 接口id */
    apiId?: number;
    /** 接口版本 */
    version?: string;
    /** 是否是当前版本 */
    current?: boolean;
    /** HTTP方法 */
    httpMethod?: string;
    /** 接口路径 */
    path?: string;
    /** 请求头 */
    requestHeaders?: JSONB;
    /** 请求参数 */
    requestParams?: JSONB;
    /** 请求体 */
    requestBody?: JSONB;
    /** 响应体 */
    responseBody?: JSONB;
    /** 响应示例 */
    responseExample?: JSONB;
    /** 示例curl */
    exampleCurl?: string;
    /** 示例代码 */
    exampleCode?: JSONB;
    /** 认证类型 */
    authType?: string;
    /** 是否允许调用 */
    allowInvoke?: boolean;
    /** 创建时间 */
    createTime?: string;
    /** 更新时间 */
    updateTime?: string;
  };

  type InterfaceVersionQueryDto = {
    /** 接口id */
    apiId?: number;
    /** 接口版本 */
    version?: string;
    /** 是否是当前版本 */
    current?: boolean;
    /** HTTP请求方法 */
    httpMethod?: string;
    /** HTTP请求路径 */
    path?: string;
    /** HTTP请求头 */
    requestHeaders?: JSONB;
    /** 认证方式 */
    authType?: string;
    /** 是否允许调用 */
    allowInvoke?: boolean;
    /** 创建时间开始 */
    createTimeStart?: string;
    /** 创建时间结束 */
    createTimeEnd?: string;
    /** 更新时间开始 */
    updateTimeStart?: string;
    /** 更新时间结束 */
    updateTimeEnd?: string;
  };

  type InterfaceVersionUpdateDto = {
    /** 是否是当前版本 */
    current?: boolean;
    /** HTTP请求方法 */
    httpMethod?: string;
    /** HTTP请求路径 */
    path?: string;
    /** HTTP请求头 */
    requestHeaders?: JSONB;
    /** HTTP请求参数 */
    requestParams?: JSONB;
    /** HTTP请求体 */
    requestBody?: JSONB;
    /** HTTP响应体 */
    responseBody?: JSONB;
    /** HTTP响应示例 */
    responseExample?: JSONB;
    /** CURL请求示例 */
    exampleCurl?: string;
    /** 代码示例 */
    exampleCode?: JSONB;
    /** 认证方式 */
    authType?: string;
    /** 是否允许调用 */
    allowInvoke?: boolean;
  };

  type JSONB = Record<string, any>;

  type PageRequestDto = {
    page?: number;
    size?: number;
    request?: any;
    /** 排序字段 */
    sortBy?: string;
    offset?: number;
    sortFields?: SortFieldObject[];
  };

  type PageRequestDtoInterfaceCallLogQueryDto = {
    page?: number;
    size?: number;
    request?: InterfaceCallLogQueryDto;
    /** 排序字段 */
    sortBy?: string;
    offset?: number;
    sortFields?: SortFieldObject[];
  };

  type PageRequestDtoInterfaceQueryDto = {
    page?: number;
    size?: number;
    request?: InterfaceQueryDto;
    /** 排序字段 */
    sortBy?: string;
    offset?: number;
    sortFields?: SortFieldObject[];
  };

  type PageRequestDtoInterfaceVersionQueryDto = {
    page?: number;
    size?: number;
    request?: InterfaceVersionQueryDto;
    /** 排序字段 */
    sortBy?: string;
    offset?: number;
    sortFields?: SortFieldObject[];
  };

  type PageResponseDtoListInterfaceCallLogDto = {
    total?: number;
    data?: InterfaceCallLogDto[];
  };

  type PageResponseDtoListInterfaceDto = {
    total?: number;
    data?: InterfaceDto[];
  };

  type PageResponseDtoListInterfaceVersionDto = {
    total?: number;
    data?: InterfaceVersionDto[];
  };

  type PageResponseDtoListPermissionDto = {
    total?: number;
    data?: PermissionDto[];
  };

  type PageResponseDtoListRoleDto = {
    total?: number;
    data?: RoleDto[];
  };

  type PageResponseDtoListUserRolePermissionDto = {
    total?: number;
    data?: UserRolePermissionDto[];
  };

  type patchEnabledParams = {
    /** 接口ID */
    id: number;
    /** 是否启用 */
    enabled: boolean;
  };

  type PermissionDto = {
    id?: number;
    code?: string;
    name?: string;
  };

  type PermissionQueryDto = {
    roleId?: number;
    permissionId?: number;
    permissionCode?: string;
    permissionName?: string;
    permissionIdList?: number[];
  };

  type PermissionUpsertDto = {
    id?: number;
    code: string;
    name: string;
  };

  type queryPermissionsParams = {
    pageRequestDto: PageRequestDto;
    permissionQueryDto: PermissionQueryDto;
  };

  type queryRolesParams = {
    pageRequestDto: PageRequestDto;
    roleQueryDto: RoleQueryDto;
  };

  type queryUsersParams = {
    pageRequestDto: PageRequestDto;
    userQueryDto: UserQueryDto;
  };

  type RoleDto = {
    id?: number;
    code?: string;
    name?: string;
    permissions?: PermissionDto[];
  };

  type RoleQueryDto = {
    userId?: number;
    roleId?: number;
    roleCode?: string;
    roleName?: string;
    roleIdList?: number[];
  };

  type RoleUpsertDto = {
    id?: number;
    code: string;
    name: string;
  };

  type SignInDto = {
    username: string;
    password: string;
  };

  type SignUpDto = {
    username: string;
    password: string;
  };

  type SortFieldObject = {
    name?: string;
    order?: "ASC" | "DESC" | "DEFAULT";
  };

  type update1Params = {
    /** 接口版本ID */
    id: number;
  };

  type updateParams = {
    /** 接口ID */
    id: number;
  };

  type UserQueryDto = {
    username?: string;
  };

  type UserRolePermissionDto = {
    id?: number;
    username?: string;
    password?: string;
    enable?: boolean;
    roles?: RoleDto[];
    createTime?: string;
    permissions?: PermissionDto[];
  };

  type UserUpsertDto = {
    id?: number;
    username: string;
    password: string;
    enable: boolean;
  };
}
