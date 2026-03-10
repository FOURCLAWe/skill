const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillhub';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB 连接成功'))
  .catch(err => console.error('❌ MongoDB 连接失败:', err));

// ==================== 数据模型 ====================

// 用户模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 技能模型
const SkillSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: [String],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { type: String, default: '' },
  content: { type: String, required: true },
  difficulty: { type: String, enum: ['初级', '中级', '高级'], default: '初级' },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Skill = mongoose.model('Skill', SkillSchema);

// 评论模型
const CommentSchema = new mongoose.Schema({
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', CommentSchema);

// 分类模型
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: '' },
  description: { type: String, default: '' },
  skillCount: { type: Number, default: 0 }
});

const Category = mongoose.model('Category', CategorySchema);

// ==================== API 路由 ====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillHub API 运行中' });
});

// ========== 用户相关 ==========

// 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 检查用户是否存在
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: '用户名或邮箱已存在' });
    }
    
    // 创建新用户（实际应用中需要加密密码）
    const user = new User({ username, email, password });
    await user.save();
    
    res.status(201).json({ 
      message: '注册成功', 
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: '注册失败', details: error.message });
  }
});

// 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }
    
    res.json({ 
      message: '登录成功',
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ error: '登录失败', details: error.message });
  }
});

// 获取用户信息
app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('skills');
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: '获取用户信息失败', details: error.message });
  }
});

// ========== 技能相关 ==========

// 获取所有技能（支持分页和筛选）
app.get('/api/skills', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, search, sort = 'latest' } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (search) query.$or = [
      { title: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { tags: new RegExp(search, 'i') }
    ];
    
    let sortOption = {};
    if (sort === 'latest') sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { views: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    
    const skills = await Skill.find(query)
      .populate('author', 'username avatar')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Skill.countDocuments(query);
    
    res.json({
      skills,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: '获取技能列表失败', details: error.message });
  }
});

// 获取单个技能详情
app.get('/api/skills/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'username avatar' }
      });
    
    if (!skill) {
      return res.status(404).json({ error: '技能不存在' });
    }
    
    // 增加浏览量
    skill.views += 1;
    await skill.save();
    
    res.json(skill);
  } catch (error) {
    res.status(500).json({ error: '获取技能详情失败', details: error.message });
  }
});

// 创建技能
app.post('/api/skills', async (req, res) => {
  try {
    const { title, description, category, tags, content, difficulty, authorId } = req.body;
    
    const skill = new Skill({
      title,
      description,
      category,
      tags,
      content,
      difficulty,
      author: authorId
    });
    
    await skill.save();
    
    // 更新用户的技能列表
    await User.findByIdAndUpdate(authorId, { $push: { skills: skill._id } });
    
    res.status(201).json({ message: '技能创建成功', skill });
  } catch (error) {
    res.status(500).json({ error: '创建技能失败', details: error.message });
  }
});

// 点赞技能
app.post('/api/skills/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ error: '技能不存在' });
    }
    
    const likeIndex = skill.likes.indexOf(userId);
    if (likeIndex > -1) {
      skill.likes.splice(likeIndex, 1);
    } else {
      skill.likes.push(userId);
    }
    
    await skill.save();
    res.json({ message: '操作成功', likes: skill.likes.length });
  } catch (error) {
    res.status(500).json({ error: '操作失败', details: error.message });
  }
});

// ========== 评论相关 ==========

// 添加评论
app.post('/api/comments', async (req, res) => {
  try {
    const { skillId, authorId, content, rating } = req.body;
    
    const comment = new Comment({
      skill: skillId,
      author: authorId,
      content,
      rating
    });
    
    await comment.save();
    
    // 更新技能的评论列表和评分
    const skill = await Skill.findById(skillId);
    skill.comments.push(comment._id);
    
    if (rating) {
      const totalRating = skill.rating * skill.ratingCount + rating;
      skill.ratingCount += 1;
      skill.rating = totalRating / skill.ratingCount;
    }
    
    await skill.save();
    
    res.status(201).json({ message: '评论成功', comment });
  } catch (error) {
    res.status(500).json({ error: '评论失败', details: error.message });
  }
});

// 获取技能的评论
app.get('/api/skills/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ skill: req.params.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: '获取评论失败', details: error.message });
  }
});

// ========== 分类相关 ==========

// 获取所有分类
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: '获取分类失败', details: error.message });
  }
});

// 创建分类
app.post('/api/categories', async (req, res) => {
  try {
    const { name, icon, description } = req.body;
    
    const category = new Category({ name, icon, description });
    await category.save();
    
    res.status(201).json({ message: '分类创建成功', category });
  } catch (error) {
    res.status(500).json({ error: '创建分类失败', details: error.message });
  }
});

// ========== 搜索相关 ==========

// 全局搜索
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: '搜索关键词不能为空' });
    }
    
    const skills = await Skill.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { tags: new RegExp(q, 'i') }
      ]
    }).populate('author', 'username avatar').limit(20);
    
    const users = await User.find({
      $or: [
        { username: new RegExp(q, 'i') },
        { bio: new RegExp(q, 'i') }
      ]
    }).select('-password').limit(10);
    
    res.json({ skills, users });
  } catch (error) {
    res.status(500).json({ error: '搜索失败', details: error.message });
  }
});

// ========== 统计相关 ==========

// 获取平台统计数据
app.get('/api/stats', async (req, res) => {
  try {
    const totalSkills = await Skill.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();
    const totalCategories = await Category.countDocuments();
    
    res.json({
      totalSkills,
      totalUsers,
      totalComments,
      totalCategories
    });
  } catch (error) {
    res.status(500).json({ error: '获取统计数据失败', details: error.message });
  }
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '服务器错误', details: err.message });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 SkillHub API 服务器运行在 http://localhost:${PORT}`);
  console.log(`📚 API 文档: http://localhost:${PORT}/api/health`);
});
