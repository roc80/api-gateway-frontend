# API Gateway Frontend

<div style="text-align: center">

[![wakatime](https://wakatime.com/badge/github/roc80/api-gateway-frontend.svg)](https://wakatime.com/badge/github/roc80/api-gateway-frontend)

</div>

---



## 环境配置

**`config/environments.ts` 文件定义了不同环境的配置**

- `.env` - 默认环境变量（所有环境共享）
- `.env.development` - 开发环境
- `.env.test` - 测试环境
- `.env.production` - 生产环境

### 基础环境变量
- `NODE_ENV` - 环境类型 (development/test/production)
- `UMI_ENV` - UmiJS 特有的环境变量，可以用来指定环境

### 启动不同环境
```bash

# 开发环境
pnpm run start:dev

# 测试环境
pnpm run start:test
```

### 构建不同环境
```bash

# 开发环境构建
npm run build

# 测试环境构建
npm run build:test

# 生产环境构建
npm run build:prod
```

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=roc80/api-gateway-frontend&type=Date)](https://www.star-history.com/#roc80/api-gateway-frontend&Date)
