export default [
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './user/login' }],
  },
  { path: '/welcome', name: '欢迎', icon: 'smile', component: './Welcome' },
  {
    path: '/admin',
    name: '管理页',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/admin/user-manage',
        name: '用户管理',
        component: './user/user-list',
      },
      {
        path: '/admin/role-manage',
        name: '角色管理',
        component: './user/role-list',
      },
    ],
  },
  {
    path: '/api',
    name: '接口调用',
    icon: 'api',
    routes: [
      {
        path: '/api/workspace',
        name: '工作台',
        component: './api/workspace',
      },
      {
        path: '/api/list',
        name: '接口列表',
        component: './api/api-list',
      },
      {
        path: '/api/version',
        name: 'API版本',
        component: './api/api-version-list',
        hideInMenu: true,
      },
      {
        path: '/api/debug',
        name: '在线调试',
        component: './api/api-debug',
        hideInMenu: true,
      },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
