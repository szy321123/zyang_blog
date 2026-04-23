---
title: Linux 系统常用命令完全指南
date: 2026-04-23 11:20:00
categories:
  - 技术教程
tags:
  - Linux
  - 命令行
  - 服务器
  - 运维
description: 覆盖文件管理、权限、软件包、进程、网络、磁盘等场景的 Linux 常用命令详解，并附各主流发行版的差异对比。
top_img: /img/lunbo2.png
---

# Linux 系统常用命令完全指南

> Linux 命令行是每个开发者、运维工程师的必备技能。本文系统梳理最常用的命令及参数，并注明 Debian/Ubuntu 与其他主流发行版的差异，帮助你在任何 Linux 环境都能游刃有余。

## 📋 目录

- [一、文件与目录操作](#一文件与目录操作)
- [二、文本查看与编辑](#二文本查看与编辑)
- [三、权限与用户管理](#三权限与用户管理)
- [四、软件包管理](#四软件包管理)
- [五、进程管理](#五进程管理)
- [六、系统信息](#六系统信息)
- [七、磁盘与文件系统](#七磁盘与文件系统)
- [八、网络操作](#八网络操作)
- [九、搜索与过滤](#九搜索与过滤)
- [十、压缩与归档](#十压缩与归档)
- [十一、SSH 远程连接](#十一ssh-远程连接)
- [十二、定时任务](#十二定时任务)
- [十三、其他高频命令](#十三其他高频命令)

---

## 一、文件与目录操作

### 1.1 基础导航

```bash
# 显示当前所在目录
pwd

# 切换目录
cd /path/to/dir      # 切换到绝对路径
cd ..                # 返回上一级
cd ~                 # 返回用户主目录
cd -                 # 返回上一次所在的目录

# 列出目录内容
ls                   # 不显示隐藏文件
ls -a                # 显示所有文件（包括以 . 开头的隐藏文件）
ls -l                # 详细列表（权限、大小、修改时间）
ls -lh               # -l 配合 -h 以人类可读的单位显示大小
ls -lt               # 按修改时间排序（最新在前）
ls -ltr              # 按修改时间倒序（最旧在前）
ls -la /var/log      # 查看指定目录
```

### 1.2 文件与目录的创建、复制、移动、删除

```bash
# 创建目录
mkdir dirname              # 创建单个目录
mkdir -p path/to/dir       # 递归创建目录（父目录不存在时自动创建）
mkdir -p dir1 dir2 dir3    # 同时创建多个目录

# 创建文件
touch filename.txt         # 创建空文件（若存在则更新修改时间）
touch file1.txt file2.md   # 同时创建多个文件

# 复制文件或目录
cp source.txt /dest/           # 复制文件到目标目录
cp -r source_dir/ /dest/       # 递归复制目录
cp -a source_dir/ /dest/       # 保留所有属性（权限、时间戳、链接）
cp -v source.txt /dest/        # 显示复制过程（verbose）
cp file1.txt file2.txt /dest/  # 复制多个文件到目标目录

# 移动或重命名
mv oldname.txt newname.txt  # 重命名（同一目录）
mv file.txt /new/path/      # 移动到其他目录
mv -i file.txt /dest/        # 目标存在时提示确认（interactive）
mv -v file.txt /dest/       # 显示移动过程

# 删除文件或目录
rm filename.txt            # 删除单个文件（会提示确认）
rm -f filename.txt         # 强制删除，不提示（force）
rm -rf /path/to/dir        # 递归强制删除目录（危险！慎用）
rm -v filename.txt         # 显示删除过程

# 批量删除（符合某条件的文件）
rm *.log                   # 删除所有 .log 文件
rm -f file{1..10}.txt     # 删除 file1.txt ~ file10.txt
```

> ⚠️ **`rm -rf /` 是自杀命令**，永远不要执行。生产环境中删除前用 `ls` 预览一下目标路径。

### 1.3 链接文件

```bash
# 硬链接（同一文件的不同名字，共享 inode）
ln /path/to/file /path/to/hardlink

# 软链接（符号链接，类似 Windows 快捷方式）
ln -s /path/to/file /path/to/symlink

# 查看链接指向
readlink /path/to/symlink

# 删除软链接（不要加 trailing slash）
rm /path/to/symlink
```

### 1.4 查看文件类型

```bash
file filename.txt       # 查看文件类型（text, binary, directory 等）
stat filename.txt       # 查看详细元信息（大小、inode、权限、时间戳）
```

---

## 二、文本查看与编辑

### 2.1 快速查看文件内容

```bash
# 显示文件全部内容
cat filename.txt

# 带行号显示
cat -n filename.txt

# 显示文件开头 / 结尾
head filename.txt            # 默认显示前 10 行
head -n 20 filename.txt      # 显示前 20 行
tail filename.txt            # 默认显示最后 10 行
tail -n 20 filename.txt      # 显示最后 20 行
tail -f /var/log/syslog      # 实时跟踪文件新增内容（Ctrl+C 退出）
tail -f /var/log/nginx/access.log --pid=$$  # 跟踪并指定 pid（进程退出自动停止）

# 分页查看（适合大文件）
less /var/log/syslog         # 上下翻页，q 退出，/搜索，n 跳到下一个匹配
more filename.txt            # 只能向下翻页（已逐渐被 less 取代）
```

### 2.2 统计信息

```bash
wc filename.txt           # 输出：行数 单词数 字节数 文件名
wc -l filename.txt        # 只看行数
wc -c filename.txt        # 只看字节数
wc -m filename.txt        # 只看字符数
wc -w filename.txt        # 只看单词数

# 统计目录或项目的代码行数
find /path -name "*.py" | xargs wc -l
```

### 2.3 文本处理

```bash
# 排序
sort filename.txt              # 按字典序排序
sort -n numbers.txt            # 按数字大小排序
sort -r filename.txt           # 倒序
sort -u filename.txt           # 去重后排序
sort -t',' -k2 filename.csv    # 按 CSV 第二列排序

# 去重
uniq filename.txt           # 去除相邻的重复行（通常配合 sort 使用）
uniq -c filename.txt         # 显示每行重复次数
uniq -d filename.txt         # 只显示出现多次的行

# 截取列（awk）或字段（cut）
awk '{print $1}' filename.txt       # 打印第一列（以空格分隔）
awk -F',' '{print $2}' file.csv     # 以逗号为分隔符，打印第二列
cut -d':' -f1 /etc/passwd            # 以冒号为分隔符，打印第一列
cut -c1-10 filename.txt             # 截取每行第 1~10 个字符

# 替换和转换
tr 'a-z' 'A-Z' < filename.txt          # 小写转大写
tr -d '[:space:]' < filename.txt       # 删除所有空白字符
sed 's/old/new/g' filename.txt         # 全局替换（s= substitution, g= global）
sed -i 's/old/new/g' filename.txt      # 直接修改文件（-i = in-place）
sed -n '5,10p' filename.txt            # 只显示第 5~10 行
awk 'NR>=5 && NR<=10' filename.txt     # 同上，sed 也可以

# 合并列（paste）
paste file1.txt file2.txt      # 按行合并两个文件
```

### 2.4 diff 对比

```bash
diff file1.txt file2.txt          # 比较两个文件差异
diff -u file1.txt file2.txt       # unified 格式（适合给 patch 使用）
diff -r dir1/ dir2/                # 递归比较两个目录
diff <(cmd1) <(cmd2)                # 比较两个命令输出（bash 进程替换）
```

---

## 三、权限与用户管理

### 3.1 权限基础

Linux 文件权限分为三组：**所有者（owner）**、**所属组（group）**、**其他人（others）**。

每组三位：`r`（读=4）+ `w`（写=2）+ `x`（执行=1）。

```
-rwxr-xr--  1 root  staff   4096 Apr 23 11:20 script.sh
 ↑↑↑↑↑↑↑↑↑
 ││└┬┘│└┬┘
 ││ │ │ └── 其他人的权限  (r-- = 4)
 ││ │ └────── 所属组权限  (r-x = 5)
 ││ └──────── 所有者权限 (rwx = 7)
 │└────────── 链接数
 └─────────── 文件类型（- = 普通文件，d = 目录，l = 链接）
```

### 3.2 修改权限

```bash
# 方式一：数字法（最常用）
chmod 755 script.sh       # 所有者 rwx，组 rx，其他人 rx
chmod 644 file.txt        # 所有者 rw，组 r，其他人 r
chmod 600 id_rsa           # 只有所有者可读写（SSH 私钥）
chmod 700 ~/.ssh           # 只有所有者可访问（.ssh 目录）
chmod +x script.sh         # 给所有人添加执行权限
chmod u+x script.sh        # 只给所有者添加执行权限
chmod g-x script.sh        # 从组移除执行权限
chmod o-r file.txt         # 从其他人移除读权限

# 方式二：字母法
# u = user(所有者), g = group, o = others, a = all
# +/-/= = 添加/移除/设置
chmod u=rwx,go=rx script.sh
```

### 3.3 修改所有者与所属组

```bash
# 修改所有者
chown user filename.txt

# 修改所有者和所属组
chown user:group filename.txt

# 递归修改（目录及所有子文件）
chown -R user:group /path/to/dir

# 只修改所属组
chgrp group filename.txt
```

### 3.4 用户管理

```bash
# 查看当前用户
whoami          # 显示当前用户名
id              # 显示用户 UID、GID 及所属组
who             # 显示当前登录的所有用户

# 添加 / 删除用户
# Debian/Ubuntu:
sudo adduser username          # 交互式创建用户（推荐，自动创建主目录）
sudo useradd -m username       # 非交互式创建用户（CentOS/RHEL 风格）
sudo userdel -r username        # 删除用户及其主目录

# 修改密码
sudo passwd username

# 切换用户
su - username        # 切换到指定用户（同时切换环境变量）
su username          # 切换用户但不加载目标用户环境

# sudo 权限管理（Debian/Ubuntu）
sudo usermod -aG sudo username   # 把用户加入 sudo 组
sudo visudo                             # 编辑 sudoers 文件（安全的编辑方式）
```

> 💡 **Debian/Ubuntu vs CentOS/RHEL**：Ubuntu 默认管理员组是 `sudo`，CentOS/RHEL 是 `wheel`。添加用户到相应组即可获得 sudo 权限。

---

## 四、软件包管理

### 4.1 Debian/Ubuntu（apt）

```bash
# 更新软件包列表（每次安装前强烈建议执行）
sudo apt update

# 升级所有可升级的软件包
sudo apt upgrade             # 不自动删除依赖包
sudo apt full-upgrade        # 会自动删除/安装依赖（版本升级时必要）

# 安装软件
sudo apt install nginx       # 安装单个包
sudo apt install nginx vim git   # 同时安装多个包
sudo apt install ./package.deb   # 从本地 .deb 文件安装

# 卸载软件
sudo apt remove nginx        # 卸载但保留配置文件
sudo apt purge nginx         # 卸载并删除配置文件
sudo apt autoremove          # 自动清理不再需要的依赖
sudo apt autoremove --purge  # 清理 + 删除配置文件

# 搜索软件包
apt search nginx
apt-cache search "^nginx$"  # 精确搜索

# 查看包信息
apt show nginx               # 查看包详情（版本、依赖、大小、描述）
apt list --installed         # 列出所有已安装的包
apt list --installed | grep nginx

# 修复依赖
sudo apt install -f          # 修复损坏的依赖关系
sudo dpkg --configure -a     # 重新配置所有已解压但未配置的包
```

### 4.2 CentOS/RHEL（yum/dnf）

```bash
# 安装
sudo yum install nginx       # 或 sudo dnf install nginx

# 卸载
sudo yum remove nginx        # 或 sudo dnf remove nginx

# 更新
sudo yum update
sudo yum check-update        # 检查更新但不安装

# 搜索
yum search nginx
yum info nginx               # 查看包详细信息

# 列出已安装
yum list installed
yum list installed | grep nginx
```

### 4.3 Arch Linux（pacman）

```bash
sudo pacman -S nginx         # 安装
sudo pacman -R nginx         # 卸载
sudo pacman -Syu             # 同步 + 更新整个系统
pacman -Ss nginx             # 搜索
pacman -Qs nginx             # 搜索已安装
pacman -Qdt                  # 列出不再被依赖的孤立包
sudo pacman -Rns $(pacman -Qdtq)  # 清理孤立包
```

### 4.4 pip（Python 包管理）

```bash
pip install requests              # 安装 Python 包
pip install -r requirements.txt   # 从文件批量安装
pip uninstall requests            # 卸载
pip list                         # 列出已安装的包
pip freeze                        # 导出当前环境所有包及版本
pip freeze > requirements.txt    # 导出到文件
pip install --upgrade pip         # 升级 pip 本身
```

---

## 五、进程管理

### 5.1 查看进程

```bash
# 实时进程监视器（交互界面）
top                  # 按 q 退出
htop                 # 更友好的增强版（需要 apt install htop）
btop                 # 更现代化，支持更多信息（可选）

# 静态查看进程
ps aux                    # 显示所有进程（最常用）
ps -ef                    # 显示完整格式（PID、PPID 等）
ps aux | grep nginx       # 查找特定进程
ps -u username            # 查看指定用户的进程

# 常用组合（排除 grep 本身）
ps aux | grep python | grep -v grep
```

### 5.2 进程操作

```bash
# 终止进程
kill PID              # 正常终止（SIGTERM，优雅退出）
kill -9 PID           # 强制杀死（SIGKILL，紧急情况）
kill -15 PID          # 同 SIGTERM，明确写法
kill -STOP PID        # 暂停进程（挂起）
kill -CONT PID        # 继续被暂停的进程

# 批量终止（杀死所有匹配进程名的进程）
pkill nginx           # 杀死所有 nginx 进程
killall nginx         # 同上，但更老派
killall -9 nginx      # 强制杀死

# 查看特定进程的 PID
pgrep -f "nginx"      # 查找进程名含 nginx 的 PID
pidof nginx           # 精确匹配进程名的 PID
```

### 5.3 后台进程与任务管理

```bash
# 将前台任务放到后台
Ctrl+Z                # 挂起当前任务（暂停）
bg                    # 将挂起的任务在后台继续运行

# 以后台方式运行（不占用终端）
nohup ./script.sh &          # 即使终端关闭也继续运行
nohup ./script.sh > output.log 2>&1 &   # 重定向输出到日志文件
./script.sh &                 # 普通后台运行（终端关闭则终止）

# 查看后台任务
jobs                  # 列出当前终端的后台任务
fg %1                 # 把第 1 个后台任务恢复到前台
bg %1                 # 让第 1 个后台任务继续运行

# 甩掉当前终端独立运行（已在后台的进程）
disown %1             # 让任务脱离终端控制
```

### 5.4 系统服务管理（systemd）

```bash
# 基本操作（Debian/Ubuntu/CentOS 7+）
sudo systemctl start nginx        # 启动服务
sudo systemctl stop nginx         # 停止服务
sudo systemctl restart nginx      # 重启服务
sudo systemctl reload nginx       # 重载配置文件（不中断连接）
sudo systemctl status nginx       # 查看运行状态
sudo systemctl enable nginx       # 开机自启
sudo systemctl disable nginx      # 取消开机自启
sudo systemctl is-active nginx    # 检查是否正在运行
sudo systemctl is-enabled nginx   # 检查是否开机自启

# 查看日志
sudo journalctl -u nginx                    # 查看 nginx 服务日志
sudo journalctl -u nginx -f                  # 实时跟踪
sudo journalctl -u nginx --since "1 hour ago"  # 查看最近 1 小时
sudo journalctl -xe --since today            # 查看今天所有日志
```

---

## 六、系统信息

### 6.1 查看系统与内核版本

```bash
uname -a                # 完整系统信息（内核、架构、日期等）
uname -r                # 只看内核版本
cat /etc/os-release     # 发行版信息（Debian/Ubuntu/CentOS 通用）
lsb_release -a          # 发行版详细信息（需要 apt install lsb-release）
cat /etc/debian_version  # Debian 特有
hostnamectl             # 主机名 + 系统信息（systemd 机器）
```

### 6.2 查看硬件信息

```bash
# CPU
lscpu                   # CPU 详细信息（型号、核心数、线程、频率、缓存）
cat /proc/cpuinfo       # 更底层的 CPU 信息

# 内存
free -h                 # 内存使用情况（human-readable）
free -m                 # 以 MB 为单位显示
cat /proc/meminfo       # 更详细的内存信息

# 磁盘
lsblk                   # 查看所有块设备（磁盘、分区、挂载点）
fdisk -l                # 查看磁盘分区表（需要 sudo）
df -h                   # 磁盘使用情况（human-readable）
df -h /home             # 查看指定挂载点
du -sh /var/log         # 查看目录大小（summary）
du -h --max-depth=1 /  # 查看根目录下各子目录大小

# PCI 设备
lspci                   # 列出所有 PCI 设备
lspci | grep -i network # 查找网卡

# USB 设备
lsusb                   # 列出所有 USB 设备
```

### 6.3 系统运行状态

```bash
uptime                  # 运行时长 + 当前负载
w                       # 当前登录用户 + 系统负载
who                     # 当前登录用户列表
last                    # 最近登录记录
last reboot             # 历史重启记录

# 系统负载详情
cat /proc/loadavg       # 1分钟/5分钟/15分钟 平均负载
```

---

## 七、磁盘与文件系统

### 7.1 磁盘分区（fdisk / parted）

> ⚠️ 分区操作有数据丢失风险，请在有备份的情况下谨慎操作。

```bash
# 查看现有分区
sudo fdisk -l /dev/sda

# 分区（交互式）
sudo fdisk /dev/sda
# 常用交互命令：
#   n = 新建分区
#   p = 主分区，e = 扩展分区
#   w = 保存并退出
#   q = 不保存退出

# parted（支持 >2TB 磁盘）
sudo parted /dev/sdb
(parted) mklabel gpt
(parted) mkpart primary ext4 0% 100%
(parted) quit
```

### 7.2 格式化与挂载

```bash
# 格式化（常用文件系统）
sudo mkfs.ext4 /dev/sdb1      # ext4（Linux 最常用）
sudo mkfs.xfs /dev/sdb1        # XFS（Red Hat/CentOS 默认，企业级）
sudo mkfs.ntfs /dev/sdb1       # NTFS（Windows 兼容）
sudo mkfs.vfat /dev/sdb1       # FAT32（U盘常见）

# 挂载
sudo mount /dev/sdb1 /mnt/data   # 挂载到 /mnt/data
mount                              # 查看当前所有挂载
mount | grep /mnt                  # 查找特定挂载点

# 卸载
sudo umount /mnt/data

# 开机自动挂载（编辑 fstab）
sudo blkid /dev/sdb1              # 查看磁盘 UUID 和文件系统类型
sudo nano /etc/fstab
# 添加一行：
# UUID=xxxx-xxxx  /mnt/data  ext4  defaults  0  2
```

### 7.3 磁盘 I/O 监控

```bash
iostat -x 1 5              # 每秒刷新一次，共 5 次（查看磁盘利用率）
iotop                      # 交互式查看 I/O 占用（需要 apt install iotop）
```

---

## 八、网络操作

### 8.1 网络配置查看

```bash
ip addr show              # 查看 IP 地址和网络接口（现代命令）
ip link show              # 查看网络接口状态
ip route show             # 查看路由表
ip neigh show             # 查看 ARP 表

# 传统命令（仍广泛使用）
ifconfig                  # 查看 IP（需要 apt install net-tools）
route -n                  # 查看路由表
arp -a                    # 查看 ARP 缓存
netstat -tulnp            # 查看监听端口（需要 apt install net-tools）
ss -tulnp                 # 同上，更现代（socket statistics）
```

### 8.2 网络测试

```bash
# 测试连通性
ping -c 4 8.8.8.8           # ping 4 次
ping -c 4 google.com         # 也可以 ping 域名

# 跟踪路由（数据包经过的节点）
traceroute google.com        # 需要 apt install traceroute
tracert google.com            # Windows 命令

# DNS 查询
nslookup google.com           # DNS 解析
dig google.com                 # 更详细的 DNS 信息
dig +short google.com          # 只返回 IP 地址
host google.com                # 简单 DNS 查询

# 测试端口连通性
nc -zv 8.8.8.8 443            # 测试 TCP 443 端口
nc -zv google.com 443 2>&1 | grep -i succeeded

# 速度测试
curl -s -o /dev/null -w "%{speed_download}" http://speedtest.example.com/file
```

### 8.3 下载与上传

```bash
# 文件下载
curl -O https://example.com/file.zip           # 下载文件
curl -L -o output.zip https://example.com/file  # -L 跟随重定向，-o 指定文件名
wget https://example.com/file.zip              # 经典下载工具
wget -c https://example.com/largefile.zip      # 断点续传

# 上传（curl）
curl -X PUT -d "data" http://example.com/api
curl -F "file=@/path/to/file" http://example.com/upload

# 传输文件（SCP）
scp local.txt user@remote:/path/      # 上传到远程
scp user@remote:/path/file.txt ./     # 从远程下载
scp -r ./dir user@remote:/path/        # 递归上传目录
scp -P 2222 user@remote:/path/file.txt .   # 指定 SSH 端口

# rsync（增量同步，效率极高）
rsync -avz ./dir/ user@remote:/path/   # 归档 + 压缩 + 显示过程
rsync -avz --delete ./dir/ user@remote:/path/  # 同步删除（两边完全一致）
rsync -avz -e "ssh -p 2222" ./dir/ user@remote:/path/  # 指定 SSH 端口
```

### 8.4 网络统计

```bash
netstat -i                  # 查看各网络接口的统计信息
netstat -s                  # 各协议汇总统计
ss -tlnp                    # 所有监听 TCP 端口
ss -tan | grep ESTAB        # 查看所有已建立的连接
```

---

## 九、搜索与过滤

### 9.1 文件名搜索

```bash
# 在文件系统中查找文件
find /path -name "filename.txt"         # 按文件名查找
find /path -name "*.log"                # 查找所有 .log 文件
find /path -name "*.conf" -type f      # 只找普通文件，不找目录
find /path -type d -name "node_modules" # 查找目录

# 查找并配合操作
find /path -name "*.tmp" -exec rm {} \;   # 找到后删除（危险）
find /path -name "*.log" -mtime +7        # 查找 7 天前的 log 文件
find /path -size +100M                    # 查找大于 100MB 的文件
find /path -user username                 # 查找属于某用户的文件

# locate（基于预建索引，更快，需要定期 updatedb）
locate filename.txt
sudo updatedb                    # 更新文件索引数据库
```

### 9.2 文件内容搜索

```bash
# 在文件中搜索文本
grep "keyword" filename.txt              # 基本搜索
grep -r "keyword" /path/to/dir          # 递归搜索目录
grep -rn "keyword" /path/to/dir         # -n 显示行号，-r 递归
grep -i "keyword" filename.txt           # -i 忽略大小写
grep -v "keyword" filename.txt           # -v 反向选择（不包含关键词的行）
grep -c "keyword" filename.txt           # -c 统计匹配行数
grep -A 3 "keyword" filename.txt         # -A 显示匹配行及之后 3 行
grep -B 3 "keyword" filename.txt         # -B 显示匹配行及之前 3 行
grep -E "error|warning" filename.txt     # -E 使用正则，匹配多个关键词（OR）

# 常用组合
grep -rn "TODO" --include="*.py" /path   # 只搜索 .py 文件
grep -rn "TODO" --exclude-dir=node_modules /path  # 排除某目录

# ack / ag / rg（更快的代码搜索）
apt install silversearcher-ag    # Debian/Ubuntu 安装 ag
ag "keyword" /path              # 比 grep 快很多（适合大项目）
rg "keyword" /path              # ripgrep，更快更强
```

### 9.3 命令历史

```bash
history                        # 显示所有历史命令
history | grep apt             # 搜索包含 apt 的历史命令
!!                             # 执行上一条命令
!n                             # 执行第 n 条历史命令
!$-1                           # 执行倒数第二条命令
Ctrl+R                         # 交互式反向搜索（输入关键词回溯）
```

---

## 十、压缩与归档

### 10.1 tar（最常用的归档工具）

```bash
# 打包（不压缩）
tar -cvf archive.tar /path/to/dir     # 创建归档（c=create, v=verbose, f=file）
tar -xvf archive.tar                    # 解开归档（x=extract）
tar -xvf archive.tar -C /dest/         # 解压到指定目录

# 打包并压缩
tar -czvf archive.tar.gz /path/       # gzip 压缩（最常用，速度快）
tar -cjvf archive.tar.bz2 /path/      # bzip2 压缩（压缩率更高，慢）
tar -cJvf archive.tar.xz /path/        # xz 压缩（最高压缩率，最慢）

# 解压
tar -xzvf archive.tar.gz             # 解 gzip
tar -xjvf archive.tar.bz2            # 解 bzip2
tar -xJvf archive.tar.xz            # 解 xz
tar -xzvf archive.tar.gz -C /dest/  # 解压到指定目录

# 查看压缩包内容（不解压）
tar -tzf archive.tar.gz

# 追加文件到已有压缩包
tar -rvf archive.tar newfile.txt
```

### 10.2 zip / unzip

```bash
zip -r archive.zip /path/to/dir        # 压缩目录
zip archive.zip file1.txt file2.txt    # 压缩多个文件
unzip archive.zip                      # 解压到当前目录
unzip archive.zip -d /dest/            # 解压到指定目录
unzip -l archive.zip                   # 只查看内容，不解压
unzip -q archive.zip                    # 静默模式，不显示过程
```

### 10.3 其他压缩格式

```bash
# .gz 单文件压缩（不打包）
gzip filename.txt          # 生成 filename.txt.gz，原文件删除
gunzip filename.txt.gz     # 解压
gzip -k filename.txt       # 保留原文件
gzcat filename.txt.gz      # 查看压缩文件内容（不解压）

# .xz
xz filename.txt
unxz filename.txt.xz

# .7z（需要安装 p7zip）
7z a archive.7z /path/      # 创建
7z x archive.7z            # 解压
```

---

## 十一、SSH 远程连接

### 11.1 基本连接

```bash
ssh user@hostname               # 标准连接
ssh -p 2222 user@hostname        # 指定端口（默认 22）
ssh -i ~/.ssh/id_rsa user@hostname  # 使用指定私钥连接
```

### 11.2 SSH 密钥管理

```bash
# 生成 SSH 密钥对
ssh-keygen -t ed25519 -C "your_email@example.com"   # 推荐的现代算法
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"  # 传统 RSA

# 默认保存位置：~/.ssh/id_ed25519（私钥）, ~/.ssh/id_ed25519.pub（公钥）

# 将公钥复制到远程服务器（最简方式）
ssh-copy-id user@hostname

# 手动复制公钥
cat ~/.ssh/id_ed25519.pub | ssh user@hostname "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 修改密钥权限（必须）
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
```

### 11.3 SSH 配置优化

```bash
nano ~/.ssh/config
```

```
Host myserver
    HostName 192.168.1.100
    User root
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    ForwardAgent yes

Host *
    ServerAliveInterval 60      # 防止空闲断开
    ServerAliveCountMax 3
    AddKeysToAgent yes
```

### 11.4 SSH 隧道（端口转发）

```bash
# 本地端口转发：把远程端口映射到本地
ssh -L 8080:localhost:80 user@remote    # 访问远程的 80 端口，映射到本地的 8080

# 远程端口转发：把本地端口映射到远程
ssh -R 8080:localhost:80 user@remote

# SOCKS 代理（科学上网/调试）
ssh -D 1080 user@hostname    # 在本地创建 SOCKS5 代理
```

### 11.5 远程执行命令

```bash
ssh user@hostname "df -h && free -h"   # 执行远程命令并获取输出
ssh user@hostname "sudo systemctl restart nginx"  # 远程执行 sudo 命令
```

---

## 十二、定时任务

### 12.1 cron（系统级定时任务）

```bash
# 查看当前用户的 crontab
crontab -l

# 编辑 crontab
crontab -e

# 清空 crontab
crontab -r
```

**crontab 时间格式：**

```
┌───────────── 分钟 (0-59)
│ ┌─────────── 小时 (0-23)
│ │ ┌───────── 日 (1-31)
│ │ │ ┌─────── 月 (1-12)
│ │ │ │ ┌───── 星期 (0-7，0 和 7 都是周日)
│ │ │ │ │
* * * * * command
```

**常用示例：**

```bash
# 每分钟执行一次
* * * * * /path/to/script.sh

# 每天凌晨 3 点执行
0 3 * * * /path/to/backup.sh

# 每周一早上 6 点执行
0 6 * * 1 /path/to/job.sh

# 每月 1 日零点执行
0 0 1 * * /path/to/job.sh

# 每隔 5 分钟执行
*/5 * * * * /path/to/check.sh

# 每小时的第 15 分钟执行
15 * * * * /path/to/job.sh

# 每天 8:00-18:00 每小时执行
0 8-18 * * * /path/to/job.sh

# 每年 1 月 1 日零点执行
0 0 1 1 * /path/to/newyear.sh

# 排除某时段（如：工作时间外每分钟备份）
* * 9-18 * * 2-6 /path/to/backup.sh   # 工作日 9-18 点
```

**日志和输出：** cron 任务的输出会通过邮件发送（系统），建议重定向到日志：

```bash
0 3 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

### 12.2 systemd timer（更现代的方式）

```bash
# 创建 service 文件
sudo nano /etc/systemd/system/mytask.service
```

```ini
[Unit]
Description=My scheduled task

[Service]
Type=oneshot
ExecStart=/path/to/script.sh
```

```bash
# 创建 timer 文件
sudo nano /etc/systemd/system/mytask.timer
```

```ini
[Unit]
Description=Run mytask.service daily at 3am

[Timer]
OnCalendar=*-*-* 03:00:00
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mytask.timer
sudo systemctl list-timers --all
```

### 12.3 at（一次性任务）

```bash
# 在指定时间执行一次
at 3:00 tomorrow
at now + 5 minutes
at 17:00

# 进入 at 交互界面，输入要执行的命令，按 Ctrl+D 保存
at> /path/to/script.sh
at> <EOT>

# 查看待执行任务
atq

# 删除任务
atrm 3
```

---

## 十三、其他高频命令

### 13.1 alias（命令别名）

```bash
# 临时设置 alias（当前终端有效）
alias ll='ls -la'
alias gs='git status'
alias ..='cd ..'
alias ...='cd ../..'

# 永久保存 alias（写入 ~/.bashrc 或 ~/.zshrc）
echo "alias ll='ls -la'" >> ~/.bashrc
source ~/.bashrc

# 取消 alias
unalias ll
```

### 13.2 环境变量

```bash
# 查看环境变量
echo $PATH
env
printenv

# 临时设置（当前终端有效）
export PATH="/new/path:$PATH"
export EDITOR=vim

# 永久设置
echo "export PATH=\"/new/path:\$PATH\"" >> ~/.bashrc
source ~/.bashrc

# 常用环境变量
echo $HOME        # 用户主目录
echo $USER        # 当前用户名
echo $SHELL       # 当前 shell 类型
echo $PWD         # 当前目录
echo $HOSTNAME    # 主机名
```

### 13.3 日期与时间

```bash
date                         # 显示当前日期时间
date "+%Y-%m-%d %H:%M:%S"    # 自定义格式
date -d "2026-04-23"         # 指定日期
date -s "2026-04-23 12:00:00"  # 设置系统时间（需要 sudo）

# 时区
timedatectl                          # 查看时区信息
sudo timedatectl set-timezone Asia/Shanghai  # 设置时区

# 查看硬件时钟
sudo hwclock --show
sudo hwclock --systohc               # 系统时间同步到硬件时钟
```

### 13.4 输入输出重定向

```bash
command > output.txt       # 标准输出重定向到文件（覆盖）
command >> output.txt      # 追加到文件
command 2> error.txt        # 标准错误重定向
command > output.txt 2>&1   # 标准输出和错误都重定向到文件
command &> output.txt       # 同上，简写
command > /dev/null 2>&1   # 丢弃所有输出（静默执行）
command < input.txt         # 从文件读取输入
```

### 13.5 管道（|）

管道是 Linux 最强大的特性之一，将前一个命令的输出作为后一个命令的输入：

```bash
# 实用管道组合
ls -la | less                    # 分页查看目录
cat log.txt | grep ERROR | wc -l  # 统计 ERROR 出现次数
ps aux | grep python | grep -v grep  # 查找 Python 进程（排除 grep 本身）
df -h | grep /dev/sda            # 查看特定磁盘使用率
free -h | awk '/Mem:/ {print $3}' # 提取已用内存
cat /proc/net/dev | awk '/eth0/{print $2}'  # 查看网卡流量
```

### 13.6 watch（周期性执行命令）

```bash
watch -n 1 'df -h'                # 每秒刷新 df 输出
watch -n 5 'ps aux | grep nginx'  # 每 5 秒检查 nginx 进程
watch -d -n 2 'ls -la /tmp'       # -d 高亮显示差异
```

### 13.7 screen 和 tmux（终端多路复用）

```bash
# screen（会话管理）
screen -S mysession          # 创建命名会话
screen -ls                   # 列出所有会话
screen -r mysession           # 恢复会话
screen -d mysession           # 分离会话（远程断开时）
Ctrl+A, D                    # 分离当前会话
Ctrl+A, K                    # 关闭当前会话

# tmux（更现代，功能更强）
tmux new -s mysession        # 创建会话
tmux ls                      # 列出会话
tmux attach -t mysession     # 恢复会话
tmux detach                  # 分离（Ctrl+B, D）
# tmux 快捷键前缀：Ctrl+B
#   D = 分离会话
#   C = 新建窗口
#   W = 列出窗口
#   [ = 进入复制模式（上下滚动）
```

---

## 附录：常见问题速查

| 场景 | 命令 |
|------|------|
| 查看进程 PID | `pgrep -f "进程名"` |
| 杀死进程 | `kill -9 $(pgrep -f "进程名")` |
| 查看端口占用 | `ss -tlnp \| grep 端口号` |
| 查找大文件 | `find / -size +100M` |
| 清理日志 | `> /var/log/syslog`（截断文件）或 `truncate -s 0` |
| SSH 密钥登录 | `ssh-copy-id user@hostname` |
| 查看实时日志 | `tail -f /var/log/syslog` |
| 查公网 IP | `curl ifconfig.me` |
| 查内网 IP | `ip addr show` |
| 查看系统负载 | `uptime` |
| 内存占用排序 | `ps aux --sort=-%mem \| head` |
| CPU 占用排序 | `ps aux --sort=-%cpu \| head` |
| 查看开机自启服务 | `systemctl list-unit-files --state=enabled` |

---

> 📝 本文会持续更新。如果你发现有遗漏或错误，欢迎在评论区留言补充！
>
> 关注作者，持续获取更多技术干货 🚀
