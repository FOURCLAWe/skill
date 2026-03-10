# SkillHub - 技能分享平台

一个功能完善的技能分享社区平台，类似 Tencent SkillHub。

## 功能特性

### 用户功能
- ✅ 用户注册/登录
- ✅ 个人主页
- ✅ 关注/粉丝系统
- ✅ 个人技能管理

### 技能功能
- ✅ 技能发布与编辑
- ✅ 技能分类浏览
- ✅ 技能搜索与筛选
- ✅ 技能点赞/收藏
- ✅ 浏览量统计
- ✅ 难度等级标记

### 社区功能
- ✅ 评论系统
- ✅ 评分系统
- ✅ 社区动态
- ✅ 标签系统

### 其他功能
- ✅ 响应式设计
- ✅ 平滑滚动
- ✅ 实时搜索
- ✅ 数据统计

## 技术栈

### 前端
- HTML5 + CSS3
- Tailwind CSS
- Vanilla JavaScript
- 响应式设计

### 后端
- Node.js + Express
- MongoDB + Mongoose
- RESTful API
- JWT 认证

## 快速开始

### 前端部署

1. 直接打开前端页面：
```bash
cd skillhub-clone/frontend
# 使用任意 HTTP 服务器
python3 -m http.server 8080
# 或
npx serve .
```

2. 访问 http://localhost:8080

### 后端部署

1. 安装依赖：
```bash
cd skillhub-clone/backend
npm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，配置 MongoDB 连接
```

3. 启动 MongoDB：
```bash
# 确保 MongoDB 已安装并运行
mongod
```

4. 启动后端服务：
```bash
npm start
# 或开发模式
npm run dev
```

5. API 运行在 http://localhost:3000

## API 文档

### 认证相关

#### 注册
```
POST /api/auth/register
Body: { username, email, password }
```

#### 登录
```
POST /api/auth/login
Body: { email, password }
```

### 用户相关

#### 获取用户信息
```
GET /api/users/:id
```

### 技能相关

#### 获取技能列表
```
GET /api/skills?page=1&limit=12&category=编程开发&sort=latest
```

#### 获取技能详情
```
GET /api/skills/:id
```

#### 创建技能
```
POST /api/skills
Body: { title, description, category, tags, content, difficulty, authorId }
```

#### 点赞技能
```
POST /api/skills/:id/like
Body: { userId }
```

### 评论相关

#### 添加评论
```
POST /api/comments
Body: { skillId, authorId, content, rating }
```

#### 获取评论
```
GET /api/skills/:id/comments
```

### 分类相关

#### 获取所有分类
```
GET /api/categories
```

#### 创建分类
```
POST /api/categories
Body: { name, icon, description }
```

### 搜索相关

#### 全局搜索
```
GET /api/search?q=关键词
```

### 统计相关

#### 获取平台统计
```
GET /api/stats
```

## 项目结构

```
skillhub-clone/
├── frontend/
│   └── index.html          # 前端页面
├── backend/
│   ├── server.js           # 后端服务器
│   ├── package.json        # 依赖配置
│   └── .env.example        # 环境变量示例
└── README.md               # 项目文档
```

## 数据模型

### User（用户）
- username: 用户名
- email: 邮箱
- password: 密码
- avatar: 头像
- bio: 个人简介
- skills: 发布的技能
- followers: 粉丝列表
- following: 关注列表

### Skill（技能）
- title: 标题
- description: 描述
- category: 分类
- tags: 标签
- author: 作者
- content: 内容
- difficulty: 难度
- rating: 评分
- views: 浏览量
- likes: 点赞用户
- comments: 评论列表

### Comment（评论）
- skill: 所属技能
- author: 作者
- content: 内容
- rating: 评分
- likes: 点赞用户

### Category（分类）
- name: 名称
- icon: 图标
- description: 描述
- skillCount: 技能数量

## 功能扩展建议

### 短期优化
- [ ] 添加图片上传功能
- [ ] 实现 JWT 认证
- [ ] 添加密码加密
- [ ] 实现邮箱验证
- [ ] 添加富文本编辑器

### 中期优化
- [ ] 实现实时通知
- [ ] 添加私信功能
- [ ] 实现技能推荐算法
- [ ] 添加数据可视化
- [ ] 实现支付功能

### 长期优化
- [ ] 移动端 App
- [ ] 视频课程支持
- [ ] 直播功能
- [ ] AI 智能推荐
- [ ] 国际化支持

## 部署建议

### 前端部署
- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS

### 后端部署
- 阿里云 ECS
- 腾讯云服务器
- AWS EC2
- Heroku

### 数据库
- MongoDB Atlas（云数据库）
- 自建 MongoDB

## 性能优化

1. 前端优化
   - 图片懒加载
   - 代码分割
   - CDN 加速
   - 缓存策略

2. 后端优化
   - 数据库索引
   - Redis 缓存
   - API 限流
   - 负载均衡

## 安全建议

1. 密码加密（bcrypt）
2. JWT 令牌认证
3. HTTPS 加密传输
4. XSS 防护
5. CSRF 防护
6. SQL 注入防护
7. 文件上传验证
8. API 访问限流

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发者。

---

**注意**：这是一个演示项目，生产环境使用前请完善安全措施和性能优化。
