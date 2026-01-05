import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import { AvatarDropdown, AvatarName, Footer } from '@/components';
import { currentUser as queryCurrentUser } from '@/services/api-gateway/userRolePermissionController';
import '@ant-design/v5-patch-for-react-19';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { envConfig } from '../config/environments';
import { errorConfig } from './requestErrorConfig';

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

// 在开发环境输出环境配置信息
console.log('当前环境配置:', {
  NODE_ENV: process.env.NODE_ENV,
  UMI_ENV: process.env.UMI_ENV,
  baseURL: envConfig.baseURL,
  enableMock: envConfig.enableMock,
  logLevel: envConfig.logLevel,
});

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.UserRolePermissionDto;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.UserRolePermissionDto | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      console.log('正在获取当前用户信息...');
      const userInfo = await queryCurrentUser({
        skipErrorHandler: true,
      });
      console.log('获取用户信息成功:', userInfo);
      return userInfo;
    } catch (error: any) {
      console.warn('获取用户信息失败:', error);

      // 如果是 401 错误，说明未认证或 token 失效
      if (error?.response?.status === 401) {
        console.log('用户未认证或登录已过期，跳转到登录页面');
        // 只有当前不在登录页面时才跳转
        if (history.location.pathname !== loginPath) {
          history.push(loginPath);
        }
      } else {
        // 其他错误，也尝试跳转到登录页面
        console.log('其他认证错误，跳转到登录页面');
        if (history.location.pathname !== loginPath) {
          history.push(loginPath);
        }
      }
      return undefined;
    }
  };
  const currentUser = await fetchUserInfo();
  return {
    fetchUserInfo,
    currentUser,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    avatarProps: {
      // todo@lp
      src: 'https://rocli.cn/favicon.ico',
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.username,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  // 从环境配置中读取 baseURL
  baseURL: envConfig.baseURL,
  // 合并错误配置
  ...errorConfig,
};
