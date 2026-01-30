/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.UserRolePermissionDto } | undefined,
) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin:
      currentUser &&
      currentUser.roles
        ?.map((item) => item.code)
        ?.some((code) => code?.toLowerCase() === 'admin'),
  };
}
