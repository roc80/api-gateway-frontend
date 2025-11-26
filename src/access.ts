/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(
  initialState: { currentUser?: API.UserRolePermissionDto } | undefined,
) {
  const {currentUser} = initialState ?? {};
  return {
    canAdmin: currentUser &&
      currentUser.permissions
        ?.flatMap((item) => item.name)
        .includes('admin'),
  };
}
