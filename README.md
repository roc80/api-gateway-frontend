# 环境配置说明

本项目支持多环境配置，可以根据不同的环境变量自动切换 API 地址等配置。

## 环境文件

项目根目录下的环境文件：

- `.env` - 默认环境变量（所有环境共享）
- `.env.development` - 开发环境配置
- `.env.test` - 测试环境配置
- `.env.production` - 生产环境配置

## 支持的环境

### 开发环境 (development)
- 默认 API 地址: `http://localhost:8080/api`
- 启用 Mock 数据: `true`
- 日志级别: `debug`

### 测试环境 (test)
- 默认 API 地址: `http://test-api.example.com/api`
- 启用 Mock 数据: `false`
- 日志级别: `info`

### 预发布环境 (pre)
- 默认 API 地址: `http://pre-api.example.com/api`
- 启用 Mock 数据: `false`
- 日志级别: `warn`

### 生产环境 (production)
- 默认 API 地址: `https://api.example.com/api`
- 启用 Mock 数据: `false`
- 日志级别: `error`

## 环境变量

### 基础环境变量
- `NODE_ENV` - 环境类型 (development/test/production)
- `UMI_ENV` - UmiJS 特有的环境变量，可以用来指定环境

### API 配置
- `API_BASE_URL` - API 基础地址

### 其他配置
- `ENABLE_MOCK` - 是否启用 Mock 数据 (true/false)
- `LOG_LEVEL` - 日志级别 (debug/info/warn/error)

## 使用方式

### 1. 修改环境文件
直接编辑对应的 `.env` 文件来修改配置。

### 2. 启动不同环境
```bash
# 开发环境
npm run start:dev

# 测试环境
npm run start:test

# 预发布环境
npm run start:pre
```

### 3. 构建不同环境
```bash
# 开发环境构建
npm run build

# 测试环境构建
npm run build:test

# 预发布环境构建
npm run build:pre

# 生产环境构建
npm run build:prod
```

## 环境配置文件说明

`config/environments.ts` 文件定义了不同环境的配置，你可以在这里：

1. 添加新的环境配置
2. 修改现有环境的默认值
3. 添加新的配置项

### 添加新环境示例
```typescript
const environments = {
  // ... 现有环境配置

  // 添加新的 staging 环境
  staging: {
    name: 'staging',
    baseURL: process.env.API_BASE_URL || 'http://staging-api.example.com/api',
    enableMock: process.env.ENABLE_MOCK === 'true',
    logLevel: process.env.LOG_LEVEL || 'warn',
  },
};
```

## 注意事项

1. 环境变量优先级：`.env.{environment}` > `.env`
2. 代码中可以通过 `process.env.VAR_NAME` 访问环境变量
3. 生产环境的敏感信息不应该直接写在环境文件中，应该通过 CI/CD 或部署工具注入
4. 所有 `.env` 文件都应该提交到版本控制，但敏感的配置文件应该添加到 `.gitignore`

---

<div align="center">
  
[![wakatime](https://wakatime.com/badge/github/roc80/api-gateway-frontend.svg)](https://wakatime.com/badge/github/roc80/api-gateway-frontend)

</div>

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=roc80/api-gateway-frontend&type=Date)](https://www.star-history.com/#roc80/api-gateway-frontend&Date)
