# 部署指南

Qiaomu Blog Open Source 使用 `OpenNext + Cloudflare Workers` 部署。

---

## 一、前置条件

- **Cloudflare 账号**（免费版即可）
- **GitHub 账号**（用于 Giscus 评论）
- **Node.js 18+** 和 npm
- 一个域名（可选，部署后可用 `*.workers.dev` 预览）

---

## 二、首次部署

### 1. 安装依赖与本地环境

```bash
npm install
cp .env.example .env.local
```

编辑 `.env.local`，至少填写：

```env
ADMIN_PASSWORD=你的后台密码
ADMIN_TOKEN_SALT=openssl rand -hex 32 生成的随机串
AI_CONFIG_ENCRYPTION_SECRET=openssl rand -hex 32 生成的随机串
NEXT_PUBLIC_SITE_URL=https://你的域名.com
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 自动初始化（推荐）

```bash
# 正式部署（域名必填）
npm run cf:init -- --site-url=https://你的域名.com

# 本地开发测试（可跳过域名）
npm run cf:init -- --site-url=http://localhost:8788
```

> **域名参数说明**： `--site-url` 是可选的，默认值为 `https://your-domain.com`。本地开发可用 localhost，生产部署必须填写真实域名（会影响 RSS、sitemap 等功能的 URL 生成）。

此命令会一键完成：
- 创建 `wrangler.local.toml`（**本地配置，不要提交到 git**）
- 在 Cloudflare 上创建 **D1 数据库**
- 在 Cloudflare 上创建 **R2 存储桶**
- 执行 `db/schema.sql` 初始化数据库表
- 执行 `db/seed-template.sql` 写入默认设置

如需启用 KV 缓存加速：

```bash
npm run cf:init -- --site-url=https://你的域名.com --with-kv
```

### 4. 数据库迁移

`schema.sql` 初始化后，应用启动时会自动通过 `ensureSchema()` 补充 `region`、`votes_up`、`votes_down` 等新字段。

**如果你是从旧版本升级**，需手动执行迁移：

```bash
npx wrangler d1 execute DB --remote --file=db/migrations/001_add_finance_fields.sql -c wrangler.local.toml
```

### 5. 设置 Secrets

```bash
npx wrangler secret put ADMIN_PASSWORD -c wrangler.local.toml
# 输入你的后台登录密码

npx wrangler secret put ADMIN_TOKEN_SALT -c wrangler.local.toml
npx wrangler secret put AI_CONFIG_ENCRYPTION_SECRET -c wrangler.local.toml
```

可选（启用 AI 功能时）：
```bash
npx wrangler secret put AI_API_KEY -c wrangler.local.toml
```

### 6. 配置 Giscus 评论

> 如果你不需要评论功能，可跳过此步，文章页面底部不会显示评论区域。

**在 GitHub 上：**
1. 创建一个公开仓库（或使用已有仓库）
2. 进入 **Settings → General**，勾选 **Discussions**
3. 访问 [https://giscus.app/zh-CN](https://giscus.app/zh-CN)
4. 按指引配置，获取 `data-repo`、`data-repo-id`、`data-category-id`

**在 `wrangler.local.toml` 的 `[vars]` 中添加：**

```toml
NEXT_PUBLIC_GISCUS_REPO = "你的用户名/仓库名"
NEXT_PUBLIC_GISCUS_REPO_ID = "你的仓库ID"
NEXT_PUBLIC_GISCUS_CATEGORY_ID = "你的分类ID"
```

本地开发则在 `.env.local` 中添加同名的三个变量。

### 7. 生成类型并部署

```bash
npm run cf-typegen
npm run deploy
```

部署后你会得到一个 `*.workers.dev` 的预览域名。可以在 Cloudflare Dashboard 绑定自定义域名。

---

## 三、配置清单

部署完成后，确认下列配置已完成：

| 配置项 | 位置 | 必填 |
|--------|------|------|
| `ADMIN_PASSWORD` | wrangler secret | ✅ |
| `ADMIN_TOKEN_SALT` | wrangler secret | ✅ |
| `AI_CONFIG_ENCRYPTION_SECRET` | wrangler secret | ✅ |
| `NEXT_PUBLIC_SITE_URL` | `wrangler.local.toml` [vars] | ✅ |
| `NEXT_PUBLIC_GISCUS_REPO` | `wrangler.local.toml` [vars] | 可选 |
| `NEXT_PUBLIC_GISCUS_REPO_ID` | `wrangler.local.toml` [vars] | 可选 |
| `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | `wrangler.local.toml` [vars] | 可选 |
| D1 数据库 | `wrangler.local.toml` | ✅（`npm run cf:init` 自动配置） |
| R2 存储桶 | `wrangler.local.toml` | ✅（`npm run cf:init` 自动配置） |

---

## 四、本地开发

```bash
npm run dev
```

默认运行在 `http://localhost:3000`。本地开发不会连接 Cloudflare D1，数据库相关功能需通过 `npm run preview` 在本地 Workers 模拟环境中测试。

---

## 五、验证功能

部署后测试以下功能是否正常：

- **首页访问** — 打开域名
- **后台登录** — 访问 `/admin`，用 `ADMIN_PASSWORD` 登录
- **文章发布** — 创建并发布一篇文章
- **区域分类** — 编辑文章时选"港股/A股/美股"，首页区域筛选按钮应能正确过滤
- **投票** — 文章底部的点赞/点踩
- **股票代码链接** — 在文章中写 `AAPL`、`00700.HK`、`600519.SS` 等，发布后查看是否自动转为雪球链接
- **股票 Tooltip** — 鼠标悬停在股票链接上，应显示实时行情
- **图表** — 编辑器中通过斜杠菜单 `/` 插入财经图表
- **评论** — 文章底部出现 Giscus 评论区

---

## 六、日常更新

```bash
git pull
npm install
npm run verify
npm run deploy
```

---

## 七、故障排查

### schema.sql 执行报错（表已存在）

旧数据库已有表时 `CREATE TABLE` 会失败。这是预期的：`ensureSchema()` 会在应用启动时自动补充新字段。

### 评论不显示

检查：
- `wrangler.local.toml` 中三个 Giscus 变量是否正确配置
- GitHub 仓库是否开启 Discussions
- 浏览器 F12 控制台是否有报错（跨域、script 加载失败等）

### 股票链接不转换

`processStockCodes()` 在文章页面渲染时执行。如果是部署前已有的文章，需要重新编辑保存才会生效。

### 区域筛选不生效

确认 D1 数据库中文章的 `region` 字段有值（`HK`、`A-shares`、`US`）。编辑文章时选择区域并保存即可。

### RSS / sitemap 域名错误

检查 `wrangler.local.toml` 和 `.env.local` 中的 `NEXT_PUBLIC_SITE_URL` 是否一致。

### AI Provider Key 解密失败

`AI_CONFIG_ENCRYPTION_SECRET` 被修改会导致已保存的 AI API Key 无法解密。部署后不要随意更改此值。
