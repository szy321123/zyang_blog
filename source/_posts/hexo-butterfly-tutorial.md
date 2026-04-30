---
title: 从零搭建 Hexo + Butterfly 博客教程
date: 2026-04-22 18:00:00
cover: /img/covers/posts/hexo-butterfly-tutorial.png
categories:
  - 建站教程
  - 静态博客
tags:
  - Hexo
  - Butterfly
  - 博客搭建
  - Nginx
  - SSL
  - VPS
  - 自动部署
description: 从零开始，手把手教你搭建与我同款的 Hexo + Butterfly 博客，包含从购买域名、服务器配置到完整部署的全流程。
---

# 从零搭建 Hexo + Butterfly 博客教程

> 本教程将从购买域名、服务器选购开始，手把手教你搭建一个完整的 Hexo + Butterfly 个人博客。

## 📋 目录

- [一、环境准备](#一环境准备)
- [二、服务器与域名](#二服务器与域名)
- [三、安装 Hexo 框架](#三安装-hexo-框架)
- [四、安装 Butterfly 主题](#四安装-butterfly-主题)
- [五、主题配置](#五主题配置)
- [六、写作与部署](#六写作与部署)
- [七、优化与美化](#七优化与美化)

---

## 一、环境准备

### 1.1 安装 Node.js

Hexo 基于 Node.js 运行，需要先安装 Node.js 环境。

**Linux/macOS（通过 nvm 安装）：**

```bash
# 安装 nvm（Node.js 版本管理工具）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载终端配置
source ~/.bashrc  # 或 source ~/.zshrc

# 安装最新版 Node.js（建议 v18+）
nvm install 20
nvm use 20

# 验证安装
node -v   # v20.x.x
npm -v    # 10.x.x
```

**Windows：**

直接下载安装包：[https://nodejs.org/](https://nodejs.org/)，选择 LTS 版本即可。

---

### 1.2 安装 Git

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install -y git

# macOS（已自带）
git --version
```

---

## 二、服务器与域名

### 2.1 选购服务器

推荐使用 **1核1G** 以上的 VPS，以下服务商均可：

| 服务商 | 特点 |
|--------|------|
| [DigitalOcean](https://www.digitalocean.com/) | 稳定、价格适中 |
| [Vultr](https://www.vultr.com/) | 按小时计费，灵活 |
| [阿里云/腾讯云](https://www.aliyun.com/) | 国内访问快，需要备案 |
| [CloudCone](https://cloudcone.com/) | 性价比高 |

> 💡 如果面向国内用户，建议选择国内服务器并完成 ICP 备案。

---

### 2.2 域名购买与解析

推荐域名注册商：

- [Namecheap](https://www.namecheap.com/) — 价格便宜
- [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) — 隐私保护好
- [阿里云](https://www.aliyun.com/)/[腾讯云](https://cloud.tencent.com/) — 国内主流

**添加 DNS 解析：**

1. 登录域名服务商后台
2. 添加 A 记录指向服务器 IP：
   - **主机记录：** `@`（或 `zyang.me`）
   - **记录值：** `你的服务器公网IP`
3. 如需 `www` 子域名，再添加一条：
   - **主机记录：** `www`
   - **记录值：** `你的服务器公网IP`

---

### 2.3 服务器环境配置

连接服务器并安装基础软件：

```bash
# 连接服务器（替换为你的 IP）
ssh root@你的服务器IP

# 安装必要软件
apt update && apt install -y nginx python3-certbot-python3

# 启动 nginx
systemctl enable nginx
systemctl start nginx
```

---

## 三、安装 Hexo 框架

### 3.1 创建博客目录

```bash
# 在本地电脑上操作（不是服务器）
# 选择一个合适的目录创建博客项目
mkdir -p ~/blog
cd ~/blog
```

### 3.2 初始化 Hexo 项目

```bash
# 使用 npm 安装 Hexo CLI（如果遇到权限问题加 sudo）
npm install -g hexo-cli

# 初始化博客（my-blog 是项目名，可自定义）
hexo init my-blog
cd my-blog

# 安装依赖
npm install
```

初始化完成后，目录结构如下：

```
my-blog/
├── _config.yml          # Hexo 主配置文件
├── package.json         # 项目依赖
├── scaffolds/          # 文章模板
├── source/             # 博客源码（写在这里）
│   └── _posts/         # 文章存放目录
└── themes/             # 主题目录
```

### 3.3 本地预览

```bash
# 启动本地服务器
hexo server

# 浏览器访问 http://localhost:4000
# 按 Ctrl+C 停止
```

---

## 四、安装 Butterfly 主题

### 4.1 下载主题

在博客目录下执行：

```bash
# 进入主题目录
cd themes

# 方式一：Git 下载（推荐）
git clone https://github.com/jerryc127/hexo-theme-butterfly.git butterfly

# 方式二：如果你在国内，克隆速度慢，可以手动下载后上传
# 下载地址：https://github.com/jerryc127/hexo-theme-butterfly/releases
```

### 4.2 安装主题依赖

Butterfly 主题有一些额外依赖需要安装：

```bash
# 回到博客根目录
cd ..

# 安装主题依赖
npm install hexo-renderer-pug hexo-renderer-stylus hexo-generator-searchdb hexo-wordcount
```

依赖说明：
- `hexo-renderer-pug` — Pug 模板引擎
- `hexo-renderer-stylus` — Stylus CSS 预处理器
- `hexo-generator-searchdb` — 本地搜索
- `hexo-wordcount` — 文章字数统计

### 4.3 启用主题

打开博客根目录下的 `_config.yml`，找到 `theme` 字段并修改：

```yaml
# Extensions
## Plugins: https://hexo.io/plugins/
## Themes: https://hexo.io/themes/
theme: butterfly
```

### 4.4 复制主题配置

Butterfly 主题有独立配置文件，在主题目录下：

```bash
# 从主题目录复制示例配置
cp themes/butterfly/_config.yml _config.butterfly.yml
```

> ⚠️ **重要：** Butterfly 主题的所有配置都在 `_config.butterfly.yml` 中修改，**不要**直接修改主题目录内的 `_config.yml`。

---

## 五、主题配置

### 5.1 基础信息配置

打开 `_config.yml`（博客根目录），修改以下内容：

```yaml
# Site
title: 你的博客名称
subtitle: '博客副标题'
description: '博客描述'
author: 你的名字
language: zh-CN
timezone: 'Asia/Shanghai'
```

### 5.2 Butterfly 导航菜单

打开 `_config.butterfly.yml`，找到 `menu` 部分：

```yaml
menu:
  首页: / || fas fa-home
  文章||fas fa-pen-nib||hide:
    分类: /categories/ || fas fa-folder-open
  资源||fas fa-box-open||hide:
    工具: /tools/ || fas fa-wrench
    宝藏网站: /sites/ || fas fa-gem
  关于: /about/ || fas fa-user
```

菜单格式：`显示名称: 路径 || 图标`

图标可以去 [Font Awesome](https://fontawesome.com/) 挑选。

### 5.3 头像与图标

```yaml
# 网站图标（放在 source/img/ 目录下）
favicon: /img/touxiang.jpg

# 头像设置
avatar:
  img: /img/touxiang.jpg
  effect: true  # 悬停旋转效果
```

### 5.4 社交链接

```yaml
social:
  fab fa-github: https://github.com/你的用户名 || Github || '#24292e'
  fas fa-envelope: mailto:your@email.com || Email || '#4a7dbe'
```

### 5.5 首页横幅图片

```yaml
# 索引页横幅
index_img: /img/lunbo2.png

# 禁用顶部图片（全局）
disable_top_img: false
```

### 5.6 代码块配置

```yaml
code_blocks:
  theme: light
  macStyle: true
  height_limit: 320
  word_wrap: true
  copy: true
  language: true
  shrink: true
  fullpage: true
```

---

## 六、写作与部署

### 6.1 创建文章

```bash
# 创建新文章（自动生成 md 文件）
hexo new "我的第一篇文章"

# 创建自定义模板的文章
hexo new page "about"    # 创建关于页面
hexo new page "tools"    # 创建工具页面
```

文章会保存在 `source/_posts/` 目录下，使用 Markdown 编写。

### 6.2 文章Front-matter

每篇文章头部需要填写元信息：

```yaml
---
title: 文章标题
date: 2026-04-22 18:00:00
categories:
  - 分类1
  - 分类2
tags:
  - 标签1
  - 标签2
description: 文章描述
top_img: /img/xxx.jpg    # 顶部图片
---
```

### 6.3 本地预览

```bash
hexo clean     # 清理缓存
hexo generate # 生成静态文件
hexo server   # 本地预览
```

### 6.4 部署到服务器

#### 方式一：Git 自动部署

在服务器上配置 Git 钩子，实现 push 自动部署：

**服务器端：**

```bash
# 创建 Git 仓库
mkdir -p /var/repo/zyang_blog.git
cd /var/repo/zyang_blog.git
git init --bare

# 创建 Git 钩子
cat > hooks/post-receive << 'EOF'
#!/bin/bash
GIT_REPO=/var/repo/zyang_blog.git
TMP_GIT_CLONE=/tmp/zyang_blog
PUBLIC_WWW=/var/www/zyang_blog

git clone $GIT_REPO $TMP_GIT_CLONE
cd $TMP_GIT_CLONE
npm install
hexo clean
hexo generate
rm -rf $PUBLIC_WWW/*
cp -r $TMP_GIT_CLONE/public/* $PUBLIC_WWW/
rm -rf $TMP_GIT_CLONE
EOF

chmod +x hooks/post-receive
```

**本地端：**

安装部署插件：

```bash
npm install hexo-deployer-git --save
```

修改 `_config.yml`：

```yaml
deploy:
  type: git
  repo: root@你的服务器IP:/var/repo/zyang_blog.git
  branch: master
```

部署命令：

```bash
hexo deploy
```

#### 方式二：手动部署（简单直接）

```bash
# 在本地博客目录
hexo clean
hexo generate

# 上传到服务器
rsync -avz --delete public/ root@你的服务器IP:/var/www/zyang_blog/
```

### 6.5 配置 Nginx

在服务器上创建 Nginx 配置文件：

```bash
cat > /etc/nginx/sites-available/yourblog << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/zyang_blog;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

ln -sf /etc/nginx/sites-available/yourblog /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 6.6 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 certbot
apt install -y python3-certbot-nginx

# 获取并自动配置 SSL 证书
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 自动续期测试
certbot renew --dry-run
```

---

## 七、优化与美化

### 7.1 添加自定义 CSS

在 `source/css/` 目录下创建 `custom.css`：

```css
/* 自定义字体 */
body {
  font-family: 'Noto Sans SC', sans-serif;
}

/* 自定义代码高亮颜色 */
code {
  background: #f5f5f5;
  color: #e74c3c;
}
```

在 `_config.butterfly.yml` 中引入：

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/custom.css">
```

### 7.2 添加评论区

Butterfly 支持多种评论系统，推荐使用 **Twikoo**（轻量、免费）：

1. 去 [Twikoo 官网](https://twikoo.js.org/) 注册并获取 API
2. 在 `_config.butterfly.yml` 中配置：

```yaml
comments:
  use:
    - Twikoo
  text: true
  tirkkoo:
    env_id: 你的环境ID
```

### 7.3 添加网站统计

推荐使用 **不蒜子** 或 **Google Analytics**：

```yaml
# 不蒜子统计
busuanzi: true
```

### 7.4 SEO 优化

安装 SEO 插件：

```bash
npm install hexo-generator-sitemap hexo-generator-baidu-url --save
```

在 `_config.yml` 中添加：

```yaml
sitemap:
  path: sitemap.xml

baidu_url:
  slug: 
```

---

## 🎉 恭喜！

你的 Hexo + Butterfly 博客已经搭建完成！现在你可以：

- 📝 开始写文章
- 🎨 自定义主题样式
- 🚀 完善内容并推广

有任何问题欢迎留言交流！

---

> **我的博客源码：** [https://github.com/szy321123/zyang_blog](https://github.com/szy321123/zyang_blog)
> 
> 完整配置可参考我的项目，有问题欢迎提 Issue。
