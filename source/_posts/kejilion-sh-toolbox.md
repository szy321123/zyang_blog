---
title: Linux 服务器运维神器：一个脚本搞定所有
date: 2026-04-24 04:15:00
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

如果你管理着多台 Linux 服务器，一定会想要一个统一的工具箱来简化日常操作。今天推荐一个 **49万+ 安装量** 的开源脚本 —— **kejilion.sh**。

<!-- more -->

## 安装 curl

部分系统默认没有 curl，先执行对应命令：

```bash
# Debian / Ubuntu
apt update -y && apt install -y curl

# CentOS / RedHat / Fedora / AlmaLinux / Rocky Linux
yum update -y && yum install -y curl

# Alpine
apk update && apk add curl
```

## 一行命令启动

```bash
bash <(curl -sL kejilion.sh)
```

支持 Ubuntu、Debian、CentOS、Alpine、Kali、Arch 等主流发行版。

## 核心功能

| 模块 | 说明 |
|------|------|
| **系统管理** | 系统信息查询、更新维护、性能优化 |
| **Docker 管理** | 容器管理、镜像部署，无需安装任何面板 |
| **LDNMP 建站** | Nginx + MySQL + PHP 一键部署，SSL 证书、域名绑定一条龙 |
| **工具集合** | BBR 加速、WARP 管理、性能测试、FRP 内网穿透 |

## 常用快捷命令

不想进入交互菜单？直接执行指定功能：

```bash
# 一键安装 WordPress
bash <(curl -sL kejilion.sh) en wp

# Nginx 反向代理
bash <(curl -sL kejilion.sh) en fd

# DD 重装系统
bash <(curl -sL kejilion.sh) en dd

# SSL 证书申请
bash <(curl -sL kejilion.sh) en ssl

# Docker 快速安装
bash <(curl -sL kejilion.sh) en docker install

# BBRv3 加速
bash <(curl -sL kejilion.sh) en bbr3

# 系统内核调优
bash <(curl -sL kejilion.sh) en nhyh

# FRP 服务器
bash <(curl -sL kejilion.sh) en frps

# FRP 客户端
bash <(curl -sL kejilion.sh) en frpc

# 负载均衡部署
bash <(curl -sL kejilion.sh) en loadbalance
```

## 适用场景

- **新手站长**：不想记命令，建站、SSL、备案一条龙
- **多服管理**：统一工具链，批量操作更高效
- **临时环境**：快速拉起 Docker、LNMP，用完即删

## 项目信息

- 官网：[https://kejilion.sh](https://kejilion.sh)
- GitHub：[https://github.com/kejilion/sh](https://github.com/kejilion/sh) ⭐ 2.7k
- 安装量：496,000+

---

一个脚本替代一堆工具箱，省心省力。
