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
      {
        path: '/admin/api-manage',
        name: 'API管理',
        routes: [
          // {
          //   path: '/admin/api-call-log-list',
          //   name: 'API调用日志',
          //   component: './api/api-call-log-list',
          // },
        ],
      },
    ],
  },
  {
    path: '/api',
    name: '接口调用',
    icon: 'api',
    routes: [
      {
        path: '/api/list',
        name: 'API列表',
        component: './api/api-list',
      },
      // {
      //   path: '/api/version',
      //   name: 'API版本',
      //   component: './api/api-version-list',
      // },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
