# zyang_blog

基于 [Hexo](https://hexo.io/) + [Butterfly](https://butterfly.js.org/) 搭建的个人博客仓库。

## 项目简介

这个仓库用于管理博客的文章、主题配置和自定义样式/脚本，支持本地预览、静态构建与一键部署。

## 技术栈

- Hexo `8.x`
- Butterfly 主题
- Node.js + npm

## 目录结构

```text
zyang_blog/
├─ source/
│  ├─ _posts/          # 博客文章（Markdown）
│  ├─ css/             # 自定义样式
│  └─ js/              # 自定义脚本
├─ themes/
│  └─ butterfly/       # 主题目录
├─ _config.yml                 # Hexo 主配置
├─ _config.butterfly.yml       # Butterfly 主题配置
└─ package.json
```

## 本地开发

1. 安装依赖

```bash
npm install
```

2. 启动本地预览

```bash
npm run server
```

3. 浏览器访问

```text
http://localhost:4000
```

## 常用命令

```bash
# 清理缓存与生成文件
npm run clean

# 生成静态文件
npm run build

# 部署到远程
npm run deploy
```

## 写作流程

1. 在 `source/_posts/` 新建 `.md` 文章文件
2. 添加 Front Matter（`title`、`date`、`categories`、`tags` 等）
3. 本地运行 `npm run server` 预览
4. 确认无误后提交并推送

## 许可证

仅供个人博客使用与学习参考。
