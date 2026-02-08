import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Helmet, history, useModel } from '@umijs/max';
import { App, Button, Space, theme } from 'antd';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Footer } from '@/components';
import { signIn, signUp } from '@/services/api-gateway/signController';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => ({
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
    position: 'relative',
    background: '#f5f5f5',
  },
  canvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
  },
  button: {
    background: `${token.colorBgContainer} !important`,
    border: `1px solid ${token.colorBorder} !important`,
    borderRadius: token.borderRadius,
    color: `${token.colorPrimary} !important`,
    fontWeight: 500,
    '&:hover': {
      background: `${token.colorPrimaryBg} !important`,
      borderColor: `${token.colorPrimary} !important`,
      color: `${token.colorPrimary} !important`,
    },
  },
  buttonPrimary: {
    background: `${token.colorPrimary} !important`,
    border: `1px solid ${token.colorPrimary} !important`,
    borderRadius: token.borderRadius,
    color: `${token.colorTextLightSolid} !important`,
    fontWeight: 600,
    '&:hover': {
      background: `${token.colorPrimaryActive} !important`,
      borderColor: `${token.colorPrimaryActive} !important`,
      color: `${token.colorTextLightSolid} !important`,
    },
  },
  input: {
    background: '#ffffff !important',
    border: `1px solid ${token.colorBorder} !important`,
    borderRadius: token.borderRadius,
    '&:hover': {
      borderColor: `${token.colorPrimary} !important`,
    },
    '&:focus': {
      borderColor: `${token.colorPrimary} !important`,
      boxShadow: `0 0 0 2px ${token.colorPrimaryBg} !important`,
    },
  },
}));
const Login: React.FC = () => {
  const [loginType, setLoginType] = useState<'login' | 'register'>('login');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // 粒子动画效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 粒子类
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;

      constructor(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2 + 1;
      }

      update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;

        // 边界反弹
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }

      draw(context: CanvasRenderingContext2D, colorPrimary: string) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = colorPrimary + '40';
        context.fill();
      }
    }

    // 创建粒子
    const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }

    // 连接粒子的线段
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const opacity = (1 - distance / maxDistance) * 0.3;
            ctx.strokeStyle =
              token.colorPrimary +
              Math.floor(opacity * 255)
                .toString(16)
                .padStart(2, '0');
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    // 动画循环
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw(ctx, token.colorPrimary);
      });
      drawLines();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [token]);

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
      <canvas ref={canvasRef} className={styles.canvas} />
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
          position: 'relative',
          zIndex: 1,
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
              className: styles.buttonPrimary,
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
                  loginType === 'login' ? styles.buttonPrimary : styles.button
                }
                onClick={() => setLoginType('login')}
              >
                登录
              </Button>
              <Button
                className={
                  loginType === 'register'
                    ? styles.buttonPrimary
                    : styles.button
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
                  className: styles.input,
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
                  className: styles.input,
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
                  className: styles.input,
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
                  className: styles.input,
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
                  className: styles.input,
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
