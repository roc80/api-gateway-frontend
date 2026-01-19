import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Helmet, history, useModel } from '@umijs/max';
import { App, Button, Space } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Footer } from '@/components';
import { signIn, signUp } from '@/services/api-gateway/signController';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
    glassButton: {
      background: 'rgba(135, 206, 235, 0.25) !important',
      backdropFilter: 'blur(10px) !important',
      WebkitBackdropFilter: 'blur(10px) !important',
      border: '1px solid rgba(135, 206, 235, 0.3) !important',
      borderRadius: '12px !important',
      boxShadow: '0 8px 32px rgba(135, 206, 235, 0.15) !important',
      color: '#fff !important',
      fontWeight: '500 !important',
      transition: 'all 0.3s ease !important',
      '&:hover': {
        background: 'rgba(135, 206, 235, 0.4) !important',
        border: '1px solid rgba(135, 206, 235, 0.5) !important',
        boxShadow: '0 12px 40px rgba(135, 206, 235, 0.25) !important',
        transform: 'translateY(-2px) !important',
      },
      '&:active': {
        transform: 'translateY(0) !important',
        boxShadow: '0 4px 16px rgba(135, 206, 235, 0.2) !important',
      },
    },
    glassButtonPrimary: {
      background: 'rgba(135, 206, 235, 0.5) !important',
      backdropFilter: 'blur(10px) !important',
      WebkitBackdropFilter: 'blur(10px) !important',
      border: '1px solid rgba(135, 206, 235, 0.6) !important',
      borderRadius: '12px !important',
      boxShadow: '0 8px 32px rgba(135, 206, 235, 0.3) !important',
      color: '#fff !important',
      fontWeight: '600 !important',
      transition: 'all 0.3s ease !important',
      '&:hover': {
        background: 'rgba(135, 206, 235, 0.7) !important',
        border: '1px solid rgba(135, 206, 235, 0.8) !important',
        boxShadow: '0 12px 40px rgba(135, 206, 235, 0.4) !important',
        transform: 'translateY(-2px) !important',
      },
      '&:active': {
        transform: 'translateY(0) !important',
        boxShadow: '0 4px 16px rgba(135, 206, 235, 0.3) !important',
      },
    },
  };
});
const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<'login' | 'register'>('login');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message } = App.useApp();

  // 如果已登录，跳转到首页
  useEffect(() => {
    const checkLoginStatus = async () => {
      if (initialState?.currentUser) {
        history.push('/');
      }
    };
    checkLoginStatus();
  }, []);
  const fetchUserInfo = async () => {
    if (!initialState?.fetchUserInfo) {
      console.warn('fetchUserInfo 函数不存在');
      return undefined;
    }

    try {
      const userInfo = await initialState.fetchUserInfo();
      if (userInfo) {
        // 使用 flushSync 确保状态更新是同步的
        flushSync(() => {
          setInitialState((s) => ({
            ...s,
            currentUser: userInfo,
          }));
        });
        return userInfo;
      } else {
        console.warn('获取用户信息返回空值');
        return undefined;
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return undefined;
    }
  };
  const handleSubmit = async (body: API.SignInDto) => {
    try {
      // 登录 - 后端成功时只返回 200 状态码并设置 cookie，没有响应体
      await signIn(body);
      const defaultLoginSuccessMessage = '登录成功！';
      message.success(defaultLoginSuccessMessage);

      // 登录成功后，立即获取用户信息以验证登录状态
      // 这时候后端应该已经在 cookie 中设置了 token
      const userInfo = await fetchUserInfo();

      if (userInfo) {
        // 成功获取到用户信息，说明登录状态已正确设置
        const urlParams = new URL(window.location.href).searchParams;
        const redirectUrl = urlParams.get('redirect') || '/';

        // 使用 replace 而不是 href 来避免页面历史记录问题
        history.replace(redirectUrl);
      } else {
        // 如果获取用户信息失败，可能是 token 设置有问题或有其他错误
        message.error('获取用户信息失败，请重新登录');
      }
    } catch (error: any) {
      console.log('登录异常:', error.response.data.detail);
      message.error(error.response.data.detail);
    }
  };
  const handleRegister = async (body: API.SignUpDto) => {
    try {
      // 注册 - 调用注册接口
      await signUp(body);

      const defaultRegisterSuccessMessage = '注册成功！请登录';
      message.success(defaultRegisterSuccessMessage);

      // 注册成功后切换到登录页面
      setLoginType('login');
    } catch (error: any) {
      const defaultRegisterFailureMessage = '注册失败，请重试！';
      console.log('注册异常:', error);

      // 处理不同的错误状态码
      const statusCode = error?.response?.status;
      let errorMessage = defaultRegisterFailureMessage;

      if (statusCode === 400) {
        errorMessage = '请求参数错误或用户名已存在';
      } else if (statusCode === 500) {
        errorMessage = '服务器内部错误';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    }
  };
  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {'登录'}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="API Gateway"
          subTitle={
            loginType === 'login'
              ? 'API Gateway——管理 API 的访问和流量。'
              : '创建您的 API Gateway 账户'
          }
          submitter={{
            searchConfig: {
              submitText: loginType === 'login' ? '登录' : '注册',
            },
            submitButtonProps: {
              className: styles.glassButtonPrimary,
              style: {
                height: '44px',
                fontSize: '16px',
                fontWeight: 600,
                width: '100%',
              },
            },
          }}
          onFinish={async (values) => {
            if (loginType === 'login') {
              await handleSubmit(values as API.SignInDto);
            } else {
              await handleRegister(values as API.SignUpDto);
            }
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Space>
              <Button
                className={
                  loginType === 'login'
                    ? styles.glassButtonPrimary
                    : styles.glassButton
                }
                onClick={() => setLoginType('login')}
              >
                登录
              </Button>
              <Button
                className={
                  loginType === 'register'
                    ? styles.glassButtonPrimary
                    : styles.glassButton
                }
                onClick={() => setLoginType('register')}
              >
                注册
              </Button>
            </Space>
          </div>

          {loginType === 'login' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {loginType === 'register' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'用户名'}
                rules={[
                  {
                    required: true,
                    message: '用户名是必填项！',
                  },
                  {
                    min: 3,
                    message: '用户名至少3个字符！',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                  {
                    min: 6,
                    message: '密码至少6个字符！',
                  },
                ]}
              />
              <ProFormText.Password
                name="confirmPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'确认密码'}
                rules={[
                  {
                    required: true,
                    message: '请确认密码！',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error('两次输入的密码不一致！'),
                      );
                    },
                  }),
                ]}
              />
            </>
          )}
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};
export default Login;
