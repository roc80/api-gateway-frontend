/**
 * 环境配置文件
 * 根据不同的环境变量配置不同的 API 地址等
 */

// 获取当前环境
const getEnv = () => {
  return process.env.NODE_ENV || 'development';
};

// 环境配置
const environments = {
  // 开发环境
  development: {
    name: 'development',
    baseURL: process.env.API_BASE_URL || 'http://localhost:8090/api',
    // 可以添加其他开发环境配置
    enableMock: process.env.ENABLE_MOCK === 'true',
    logLevel: process.env.LOG_LEVEL || 'debug',
  },

  // 测试环境
  test: {
    name: 'test',
    baseURL: process.env.API_BASE_URL || 'http://test-api.example.com/api',
    enableMock: process.env.ENABLE_MOCK === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // 预发布环境
  pre: {
    name: 'pre',
    baseURL: process.env.API_BASE_URL || 'http://pre-api.example.com/api',
    enableMock: process.env.ENABLE_MOCK === 'true',
    logLevel: process.env.LOG_LEVEL || 'warn',
  },

  // 生产环境
  production: {
    name: 'production',
    baseURL: process.env.API_BASE_URL || 'https://api.example.com/api',
    enableMock: process.env.ENABLE_MOCK === 'true',
    logLevel: process.env.LOG_LEVEL || 'error',
  },
};

// 获取当前环境的配置
const getCurrentEnvConfig = () => {
  const env = getEnv();

  // 支持通过环境变量 UMI_ENV 来指定环境（UmiJS 特有）
  const umiEnv = process.env.UMI_ENV;
  const targetEnv = umiEnv || env;

  console.log(`当前环境: ${targetEnv}`);

  // 如果配置中不存在该环境，使用开发环境作为默认
  if (!environments[targetEnv as keyof typeof environments]) {
    console.warn(`环境 ${targetEnv} 未配置，使用开发环境配置`);
    return environments.development;
  }

  return environments[targetEnv as keyof typeof environments];
};

// 导出当前环境配置
export const envConfig = getCurrentEnvConfig();

// 导出所有环境配置（用于调试或特殊需求）
export { environments };

// 导出环境类型
export type EnvironmentType = keyof typeof environments;
