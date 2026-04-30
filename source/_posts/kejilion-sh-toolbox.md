---
title: Linux 服务器运维神器：一个脚本搞定所有
date: 2026-04-24 04:15:00
cover: /img/covers/posts/kejilion-sh-toolbox.png
tags:
  - Linux
  - 运维脚本
  - Kejilion
  - Docker
  - LDNMP
categories:
  - Linux运维
  - 工具推荐
---

# Linux 服务器运维神器：一个脚本搞定所有

如果你管理着多台 Linux 服务器，一定会有过这样的烦恼——装 Docker 要查教程、配 Nginx 要翻文档、申请 SSL 证书又是一堆命令。今天推荐一个 **49万+ 安装量** 的开源脚本，轻轻一句命令，所有日常运维操作都能搞定。

<!-- more -->

## 前置准备：安装 curl

如果你的系统默认没有 curl，先装好：

```bash
# Debian / Ubuntu
apt update -y && apt install -y curl
```

```bash
# CentOS / RedHat / Fedora / AlmaLinux / Rocky Linux
yum update -y && yum install -y curl
```

```bash
# Alpine
apk update && apk add curl
```

## 快速启动

一条命令进入交互式菜单，支持 Ubuntu、Debian、CentOS、Alpine、Kali、Arch 等主流发行版：

```bash
bash <(curl -sL kejilion.sh)
```

## 核心功能一览

| 模块 | 说明 |
|------|------|
| **系统管理** | 系统信息查询、更新维护、性能优化 |
| **Docker 管理** | 容器管理、镜像部署，无需安装任何面板 |
| **LDNMP 建站** | Nginx + MySQL + PHP 一键部署，SSL 证书、域名绑定一条龙 |
| **工具集合** | BBR 加速、WARP 管理、性能测试、FRP 内网穿透 |

## 常用快捷命令

不想进交互菜单？直接传参执行指定功能，更高效。

### 建站与反向代理

```bash
# 一键安装 WordPress
bash <(curl -sL kejilion.sh) en wp

# Nginx 反向代理
bash <(curl -sL kejilion.sh) en fd

# 申请 SSL 证书
bash <(curl -sL kejilion.sh) en ssl
```

### 系统与网络优化

```bash
# Docker 快速安装
bash <(curl -sL kejilion.sh) en docker install

# BBRv3 加速
bash <(curl -sL kejilion.sh) en bbr3

# 系统内核调优
bash <(curl -sL kejilion.sh) en nhyh
```

### 内网穿透与部署

```bash
# FRP 服务器
bash <(curl -sL kejilion.sh) en frps

# FRP 客户端
bash <(curl -sL kejilion.sh) en frpc

# 负载均衡部署
bash <(curl -sL kejilion.sh) en loadbalance
```

### 系统重装

```bash
# DD 重装系统（预装好自动化环境）
bash <(curl -sL kejilion.sh) en dd
```

> {% note warning %}DD 重装系统会清空当前服务器所有数据，操作前请务必备份重要文件！{% endnote %}

## 适用人群

- **新手站长**：不想记命令，建站、SSL、备案一条龙
- **多服管理**：统一工具链，多台服务器批量操作更高效
- **临时环境**：快速拉起 Docker、LNMP 测试环境，用完即删

## 项目信息

| 项目 | 地址 |
|------|------|
| 官网 | [https://kejilion.sh](https://kejilion.sh) |
| GitHub | [https://github.com/kejilion/sh](https://github.com/kejilion/sh) ⭐ 2.7k |
| 安装量 | 496,000+ |

---

一个脚本替代一堆工具箱，省心省力。
