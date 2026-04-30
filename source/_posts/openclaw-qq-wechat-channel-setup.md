---
title: OpenClaw 接入 QQ 机器人和微信：详细配置教程
date: 2026-04-29 22:30:00
cover: /img/covers/posts/openclaw-qq-wechat-channel-setup.png
categories:
  - OpenClaw
  - AI 助手
tags:
  - OpenClaw
  - QQ
  - 微信
  - 消息通道
description: 详细介绍如何将 OpenClaw 接入 QQ 机器人和个人微信，包含完整配置步骤、参数说明及常见问题解决方案。
---

# OpenClaw 接入 QQ 机器人和微信：详细配置教程

## 目录

- [前提条件](#前提条件)
- [QQ 机器人接入](#qq-机器人接入)
- [个人微信接入](#个人微信接入)
- [常见问题](#常见问题)
- [两种通道对比](#两种通道对比)

---

## 前提条件

| 项目 | 说明 |
|------|------|
| OpenClaw 已部署 | 未部署参考：`bash <(curl -sL kejilion.sh) claw` |
| 腾讯云账号（QQ 接入） | 用于创建 QQ 机器人 |
| 服务器公网 IP | QQ 机器人需要服务端通信 |
| Node.js / npm / pnpm | 插件运行环境 |

---

## QQ 机器人接入

### 第一步：创建 QQ 机器人

1. 访问 [QQ 开放平台](https://q.qq.com/qqbot/openclaw/login.html)，登录 QQ 号
2. 点击「创建机器人」→ 填写名称、描述、上传头像
3. 创建完成后进入「开发配置」页面，获取以下信息：
   - **AppID**
   - **AppSecret**
   - **机器人 Token**

> 以上凭据为机器人身份证明，请妥善保存，切勿泄露。

### 第二步：安装 QQ 插件

```bash
openclaw plugins install @sliverp/qqbot@latest
```

安装成功后验证：

```bash
openclaw plugins list | grep qqbot
```

### 第三步：配置通道

```bash
openclaw channels add --channel qqbot --token "你的_QQBot_Token"
```

> 将 `你的_QQBot_Token` 替换为 QQ 开放平台获取的实际 Token。

### 第四步：重启 Gateway

```bash
openclaw gateway restart
```

验证运行状态：

```bash
openclaw gateway status
```

### 第五步：配置 IP 白名单

在 QQ 开放平台的机器人设置中，找到「安全设置」→「IP 白名单」，添加服务器公网 IP。

查看服务器公网 IP：

```bash
curl -s https://api.ipify.org
```

### 第六步：测试

在 QQ 中搜索机器人账号，发送消息测试响应。

---

## 个人微信接入

### 第一步：安装 OpenClaw（如未安装）

```bash
bash <(curl -sL kejilion.sh) claw
```

### 第二步：安装微信插件

```bash
# 如无 pnpm，先安装
npm install -g pnpm

# 安装微信插件
pnpm -y @tencent-weixin/openclaw-weixin-cli@latest install
```

### 第三步：扫码绑定

1. 执行命令后终端显示二维码
2. 微信「扫一扫」扫描二维码
3. 微信端确认登录

### 第四步：验证

登录成功后会看到以下提示：

```
[INFO] WeChat connection established successfully
```

在微信中向该账号发送消息测试。

---

## 常见问题

### QQ 机器人相关

**Q1：插件安装失败**

```bash
# 检查网络连通性
curl -s https://www.npmjs.com/package/@sliverp/qqbot

# 切换 npm 源
npm config set registry https://registry.npmmirror.com
npm install -g pnpm

# 重新安装
openclaw plugins install @sliverp/qqbot@latest
```

**Q2：Token 配置后不生效**

```bash
# 确认 token 已配置
openclaw channels list

# 确认插件已加载
openclaw plugins list | grep qqbot

# 确认 Gateway 运行中
openclaw gateway status

# 查看错误日志
openclaw logs --tail 100
```

**Q3：机器人无法接收消息**

最常见原因：IP 白名单未配置。

1. 确认服务器公网 IP：
   ```bash
   curl -s https://api.ipify.org
   ```
2. 在 QQ 开放平台「安全设置」→「IP 白名单」中添加该 IP
3. 检查服务器安全组是否放行 8080 端口

**Q4：提示"机器人已下线"**

原因：机器人长时间无活跃被回收。

解决：保持机器人定期使用，查看 OpenClaw 日志确认运行状态。

### 微信接入相关

**Q5：二维码不显示**

1. 使用 SSH 客户端（FinalShell、Xshell）而非网页终端
2. 确认终端编码为 UTF-8
3. 通过 WebUI 查看二维码：
   ```bash
   openclaw webui
   ```

**Q6：扫码后提示"登录环境异常"**

1. 更新微信至最新版本
2. 切换网络（尝试手机 4G 或不同 WiFi）
3. 多次尝试扫码
4. 确认服务器 IP 未被微信风控

**Q7：微信掉线后如何重连？**

```bash
# 重新执行安装命令，会重新生成二维码
pnpm -y @tencent-weixin/openclaw-weixin-cli@latest install

# 检查运行状态
openclaw gateway status
openclaw logs --tail 50
```

### 通用问题

**Q8：Gateway 重启失败**

```bash
# 检查端口占用
netstat -tlnp | grep 8080

# 查看错误日志
openclaw logs --tail 100

# 手动启动
openclaw gateway start
```

**Q9：消息响应延迟**

- 检查模型是否正常，尝试更换响应更快的模型
- 检查服务器资源使用：`top` 或 `htop`
- 检查网络延迟

---

## 两种通道对比

| 项目 | QQ 机器人 | 个人微信 |
|------|----------|---------|
| 接入方式 | 插件 + Token | 插件 + 扫码 |
| 群聊支持 | ✅ | ❌ |
| 平台审核 | 需要 QQ 开放平台审核 | 无需审核 |
| 多设备在线 | ✅ | ❌ |
| 部署难度 | 中等（需配置白名单） | 简单 |

**选择建议：**
- 需要群聊功能 → QQ 机器人
- 个人日常使用，追求简单 → 微信
- 两者可同时接入，互不冲突

---

## 接入后建议配置

- **记忆**：`openclaw memory` 管理持久记忆
- **技能**：通过 SkillHub 安装更多能力
- **TTS**：语音输出，适合移动场景
- **定时任务**：定时提醒、自动化执行

---

*有问题欢迎在评论区留言。*
