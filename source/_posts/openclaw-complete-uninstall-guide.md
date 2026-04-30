---
title: OpenClaw（小龙虾）彻底卸载指南 — 完整清理不留死角
date: 2026-04-27 15:00:00
cover: /img/covers/posts/openclaw-complete-uninstall-guide.png
tags:
  - OpenClaw
  - 环境清理
  - 卸载教程
categories:
  - 工具推荐
---

# OpenClaw（小龙虾）彻底卸载指南 — 完整清理不留死角

使用 OpenClaw 一段时间后，可能因为 Token 费用超支、功能不符合预期、或者单纯玩腻了，想干干净净地把它从系统里移除。但很多人会发现——明明删了 CLI，后台 Gateway 还在跑；重启后服务又自动回来了。

这篇教程解决的就是这个问题：**无论你用哪种方式安装的，都能找到对应的卸载方案**，从官方脚本到强制清理，全部覆盖。

<!-- more -->

## 一、确认安装方式

在卸载之前，先搞清楚自己用的是哪种安装方式，不同方式对应不同的卸载命令。

### 快速判断

```bash
# 方式一：npm/pnpm/bun 全局安装
which openclaw && openclaw --version

# 方式二：Docker 容器运行
docker ps -a | grep openclaw

# 方式三：源码 git clone
ls ~/openclaw 2>/dev/null || ls /opt/openclaw 2>/dev/null
```

如果三个命令都没有输出，说明可能没装、或者装在其他路径，可以用以下命令全盘搜索：

```bash
find / -name "openclaw" -type f 2>/dev/null | head -20
```

---

## 二、官方脚本卸载（最推荐）

如果你当初是用官方脚本安装的，最简单的方式是用官方提供的自动卸载命令：

```bash
# 交互式（会弹出确认提示）
openclaw uninstall

# 非交互式（一行命令搞定，适合服务器）
openclaw uninstall --all --yes --non-interactive

# 没有安装 CLI 但想跑卸载？用 npx 直接跑
npx -y openclaw uninstall --all --yes --non-interactive
```

> ⚠️ **注意**：官方卸载脚本会移除核心组件（Gateway 服务、Agent 运行时、配置、工作区），但**配置文件和残留物可能清理不彻底**，建议完成后手动做一遍第三节的扫尾检查。

---

## 三、分步骤手动卸载

如果你想自己掌控每一步，或者官方脚本不生效，按以下顺序操作。

### 第一步：停止 Gateway 服务

这是最重要的一步——先停服务，再删文件，否则可能删了还在跑。

```bash
# 停止 Gateway
openclaw gateway stop
```

### 第二步：卸载 Gateway 启动项

防止重启后服务自动复活：

```bash
openclaw gateway uninstall
```

### 第三步：删除状态、配置与工作区

```bash
# 删除主配置目录
rm -rf "${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"

# 删除工作区（所有项目数据在这里）
rm -rf ~/.openclaw/workspace

# 如果用过多个 profile（类似多账号）
rm -rf ~/.openclaw-*
```

> ⚠️ **危险操作**：上面命令会删除所有数据，包括项目文件、聊天记录、配置文件。如果有重要内容，**先备份**：
> ```bash
> # 备份工作区
> cp -r ~/.openclaw/workspace ~/backup_workspace
> ```

### 第四步：根据安装方式卸载 CLI

**npm / pnpm / bun 安装：**

```bash
npm rm -g openclaw
pnpm remove -g openclaw
bun remove -g openclaw
```

**Homebrew 安装（macOS）：**

```bash
brew uninstall openclaw-cli       # CLI 版本
brew uninstall --cask openclaw  # 带 GUI 的 App 版本
```

**源码安装（git clone）：**

```bash
# 同样先停服务
openclaw gateway uninstall

# 再删源码目录（路径换成你实际的）
rm -rf ~/openclaw
```

---

## 四、强制清理（服务关不掉的救星）

很多人遇到的问题是：明明执行了卸载，Gateway 后台还在跑，重启后又自动复活。这是因为启动项没有被清除。下面按系统分开处理。

### Linux（systemd 用户服务）

```bash
# 查看所有 openclaw 相关服务
systemctl --user list-units-files | grep -i openclaw
systemctl --user list-units | grep -i openclaw

# 停止并禁用用户服务
systemctl --user disable --now openclaw-gateway.service
rm -f ~/.config/systemd/user/openclaw-gateway.service
systemctl --user daemon-reload

# 如果安装为系统级服务（root 权限）
sudo systemctl disable --now openclaw-gateway.service
sudo rm -f /etc/systemd/system/openclaw-gateway.service
sudo systemctl daemon-reload
```

> 💡 **提示**：服务名称在不同版本可能不同，常见名称还有 `openclaw.service`、`clawdbot.service`、`com.openclaw.gateway.service`。如果上面命令没效果，用 `systemctl --user list-units-files | grep -i claw` 查一下。

### macOS（launchd）

```bash
# 查找所有 openclaw 相关启动项
launchctl list | grep -i openclaw
ls ~/Library/LaunchAgents/ | grep -i openclaw
ls /Library/LaunchAgents/ | grep -i openclaw

# 强制停止并移除（把 $UID 换成你的用户 UID，用 id 命令查看）
launchctl bootout gui/$UID/ai.openclaw.gateway
rm -f ~/Library/LaunchAgents/ai.openclaw.gateway.plist

# 也可能是这些名称，逐个检查
# ai.openclaw.gateway
# com.openclaw.gateway
# com.clawdbot.gateway
```

### Windows（任务计划）

以**管理员身份**运行 PowerShell：

```powershell
# 删除计划任务
schtasks /Delete /F /TN "OpenClaw Gateway"

# 删除启动脚本
Remove-Item -Force "$env:USERPROFILE\.openclaw\gateway.cmd"
```

---

## 五、Docker 容器卸载（最简单）

如果你用的是 Docker 运行 OpenClaw，卸载非常轻松，因为容器环境是隔离的，不会污染宿主机：

```bash
# 查看所有 openclaw 容器
docker ps -a | grep openclaw

# 停止并删除容器
docker rm -f $(docker ps -a | grep openclaw | awk '{print $1}')

# 删除镜像（节省空间）
docker rmi $(docker images | grep openclaw | awk '{print $3}')
```

---

## 六、彻底扫尾 — 确认无残留

做完以上步骤，运行以下命令做最终确认：

### 检查进程

```bash
# Linux/macOS
ps aux | grep -i openclaw | grep -v grep
lsof -iTCP -sTCP:LISTEN -P -n | grep -i openclaw
ss -lptn | grep -i openclaw
```

### 检查启动项

```bash
# systemd
systemctl --user list-units-files | grep -i openclaw

# launchd (macOS)
launchctl list | grep -i openclaw

# crontab 定时任务（可能有人在这里埋了自启动）
crontab -l | grep -i openclaw

# 查看所有用户的 crontab
sudo cat /var/spool/cron/crontabs/* | grep -i openclaw
```

### 检查残留文件

```bash
# 常见安装路径
ls -la ~/.openclaw 2>/dev/null && echo "残留！" || echo "干净"
ls -la ~/.config/openclaw 2>/dev/null && echo "残留！" || echo "干净"
ls -la /opt/openclaw 2>/dev/null && echo "残留！" || echo "干净"
ls -la /usr/local/bin/openclaw 2>/dev/null && echo "残留！" || echo "干净"
```

如果以上所有命令都显示「干净」或无输出，恭喜你，OpenClaw 已彻底卸载。

---

## 七、卸载后的额外注意事项

### 云服务检查

如果你是在云服务器（VPS）上安装的，检查：

- **服务器是否还需要**：如果不再使用，及时销毁实例避免继续计费
- **有无附带收费服务**：有些活动套餐可能附带 Token 包或附加服务，确认是否会自动续费

### API Key 安全

如果决定不再使用模型 API，建议去对应厂商的管理后台删除不再使用的 API Key，防止泄露或被盗用造成额外费用：

- OpenAI API Key 管理：https://platform.openai.com/api-keys
- Anthropic API Key 管理：https://console.anthropic.com/settings/keys
- 国内各大模型厂商均可在各自控制台管理

### 备份与恢复

如果以后还可能回来玩，卸载前可以导出配置和工作区：

```bash
# 备份工作区
cp -r ~/.openclaw/workspace ~/backup_workspace

# 备份配置文件
cp ~/.openclaw/config.json ~/backup_config.json 2>/dev/null
```

下次安装时，官方支持从备份恢复，工作区和聊天记录都能回来。

---

## 总结

| 场景 | 操作 |
|------|------|
| 官方脚本安装 | `openclaw uninstall --all --yes --non-interactive` |
| Docker 安装 | `docker rm -f $(docker ps -a -q)` |
| npm/pnpm/bun 安装 | `npm rm -g openclaw` |
| 服务删不掉（Linux） | `systemctl --user disable --now openclaw-gateway.service` |
| 服务删不掉（macOS） | `launchctl bootout gui/$UID/ai.openclaw.gateway` |
| 服务删不掉（Windows） | `schtasks /Delete /F /TN "OpenClaw Gateway"` |

关键原则：**先停服务，再删文件，最后清启动项**。按这个顺序来，没有删不掉的。

