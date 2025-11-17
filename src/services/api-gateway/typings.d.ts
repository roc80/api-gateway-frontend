declare namespace API {
  type bindPermissionToRoleParams = {
    roleId: number;
  };

  type bindRoleToUserParams = {
    userId: number;
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

  type PageRequestDto = {
    page?: number;
    size?: number;
    /** 排序字段 */
    sortBy?: string;
    offset?: number;
    sortFields?: SortFieldObject[];
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
