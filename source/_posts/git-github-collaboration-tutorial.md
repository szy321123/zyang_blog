---
title: Git 与 GitHub 团队协作完全指南
date: 2026-04-23 12:00:00
categories:
  - 开发协作
  - 版本控制
tags:
  - Git
  - GitHub
  - Pull Request
  - Code Review
  - Git 工作流
  - CI/CD
  - 自动部署
description: 从 Git 基础到 GitHub 团队协作全流程，涵盖分支管理、Pull Request、Code Review、冲突处理，以及配合 Hexo 博客的自动化部署实战。
---

# Git 与 GitHub 团队协作完全指南

> Git 是目前最流行的版本控制系统，GitHub 则是全球最大的代码托管平台。两者结合可以实现从个人项目到千人团队的高效协作。本文从基础命令讲起，逐步深入到分支策略、Pull Request 协作流程、Code Review 实战，以及配套 Hexo 博客的自动部署完整方案。

## 📋 目录

- [一、Git 核心概念](#一git-核心概念)
- [二、Git 基础配置](#二git-基础配置)
- [三、基础命令](#三基础命令)
- [四、分支管理](#四分支管理)
- [五、远程仓库](#五远程仓库)
- [六、Git 标签与版本管理](#六git-标签与版本管理)
- [七、GitHub 协作流程](#七github-协作流程)
- [八、Pull Request 详解](#八pull-request-详解)
- [九、Code Review 实战](#九code-review-实战)
- [十、冲突处理](#十冲突处理)
- [十一、Git 工作流](#十一git-工作流)
- [十二、Hexo + GitHub 自动部署](#十二hexo-github-自动部署)
- [十三、高级技巧](#十三高级技巧)

---

## 一、Git 核心概念

### 1.1 什么是 Git

Git 是一个**分布式版本控制系统**（DVCS），由 Linus Torvalds 于 2005 年为开发 Linux 内核而创建。它的核心特点：

| 特性 | 说明 |
|------|------|
| 分布式 | 每个开发者都有完整的代码仓库副本 |
| 快照而非差异 | Git 存储每次提交的完整快照，而非文件差异 |
| 本地优先 | 大部分操作在本地完成，无需网络连接 |
| 完整性 | 每个对象通过 SHA-1 哈希校验 |
| 分支轻量 | 创建和切换分支几乎瞬间完成 |

### 1.2 三个区域

Git 管理下的仓库有**三个主要区域**：

```
┌─────────────────────────────────────────────────────┐
│                    工作目录 (Working Directory)       │
│  你正在编辑文件的目录                                  │
└────────────────────┬────────────────────────────────┘
                     │  git add
                     ▼
┌─────────────────────────────────────────────────────┐
│                   暂存区 (Staging Area / Index)      │
│  准备下次提交的文件快照                                 │
└────────────────────┬────────────────────────────────┘
                     │  git commit
                     ▼
┌─────────────────────────────────────────────────────┐
│                   本地仓库 (Local Repository)        │
│  .git 目录，存放所有历史提交记录                        │
└─────────────────────────────────────────────────────┘
                     │  git push
                     ▼
              ┌─────────────────┐
              │   远程仓库        │
              │ (GitHub/GitLab) │
              └─────────────────┘
```

### 1.3 文件的三种状态

Git 中每个文件处于以下三种状态之一：

- **已修改（Modified）**：文件被修改但未放入暂存区
- **已暂存（Staged）**：文件被标记为待提交，已加入暂存区
- **已提交（Committed）**：文件快照已安全保存到本地仓库

理解这三种状态是掌握 Git 的基础。

---

## 二、Git 基础配置

### 2.1 安装 Git

```bash
# Debian/Ubuntu
sudo apt update && sudo apt install git

# CentOS/RHEL
sudo yum install git
# 或
sudo dnf install git

# macOS（通常已预装）
git --version

# Windows：从 https://git-scm.com 下载 Git Bash
```

### 2.2 首次使用配置

Git 需要设置**用户名和邮箱**，这些信息会嵌入每次提交中：

```bash
# 全局配置（所有仓库都使用此身份）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 某项目单独配置（覆盖全局）
git config --local user.name "Project Name"
git config --local user.email "project@example.com"

# 查看当前配置
git config --list
git config user.name          # 只看用户名
git config user.email         # 只看邮箱
```

### 2.3 常用配置选项

```bash
# 设置默认分支名（Git 2.28+ 支持）
git config --global init.defaultBranch main

# 设置默认编辑器
git config --global core.editor vim
git config --global core.editor code --wait    # VS Code

# 启用命令别名（输入 git co 代替 git checkout）
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg "log --oneline --graph --all"

# 启用命令 colorequals输出彩色
git config --global color.ui auto

# 设置默认拉取策略（推荐）
git config --global pull.rebase false    # merge 方式（默认）
git config --global pull.rebase true     # rebase 方式

# 记住密码（15 分钟）
git config --global credential.helper cache
# 永久保存密码
git config --global credential.helper store
```

### 2.4 SSH 密钥配置（与 GitHub 通信）

```bash
# 生成 SSH 密钥对（推荐 Ed25519，性能更好、安全性更高）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 如果你的 GitHub 账号较老，也可以用 RSA：
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 默认保存到 ~/.ssh/id_ed25519（私钥）和 ~/.ssh/id_ed25519.pub（公钥）
# 系统会询问：
#   Enter file in which to save the key: (直接回车使用默认路径)
#   Enter passphrase: (输入密码，或直接回车留空)

# 查看公钥
cat ~/.ssh/id_ed25519.pub

# 添加到 GitHub：
# 1. 登录 GitHub → Settings → SSH and GPG keys → New SSH key
# 2. Title 填 "My Laptop" 或 "Office Desktop"
# 3. Key 粘贴公钥内容
# 4. 点击 Add SSH key

# 测试连接
ssh -T git@github.com
# 如果成功，会看到：
# Hi username! You've successfully authenticated, but GitHub does not provide shell access.
```

---

## 三、基础命令

### 3.1 创建与初始化仓库

```bash
# 在当前目录初始化新仓库
git init

# 克隆远程仓库
git clone https://github.com/username/repo.git
git clone git@github.com:username/repo.git          # SSH 方式（推荐）
git clone --depth 1 https://github.com/username/repo.git  # 浅克隆（只拉最新一次提交）
```

### 3.2 查看状态与差异

```bash
# 查看工作目录状态（最常用）
git status

# 简洁模式
git status -s           # M = 已修改，A = 已暂存，?? = 未跟踪
git status --short

# 查看具体修改（未暂存）
git diff                # 查看所有文件的未暂存修改
git diff filename.txt   # 查看特定文件的修改
git diff --stat         # 只显示统计信息（哪些文件改了，多少行）

# 查看已暂存的修改（即将提交的内容）
git diff --staged
git diff --cached       # 同上，--cached 是旧写法

# 查看某次提交的修改
git show <commit-hash>       # 某次提交的完整信息
git show <commit-hash> --stat  # 只看改了哪些文件
```

### 3.3 暂存与提交

```bash
# 暂存文件（将修改加入暂存区）
git add filename.txt            # 暂存单个文件
git add file1.txt file2.txt     # 暂存多个文件
git add *.txt                    # 暂存所有 .txt 文件
git add .                        # 暂存当前目录所有修改（慎用！）
git add -A                       # 暂存所有修改（包括删除的）
git add -p                       # 交互式暂存（逐个文件/块选择）

# 提交（将暂存区快照写入本地仓库）
git commit -m "提交信息"         # 简短提交信息
git commit                        # 打开编辑器写多行提交信息
git commit -am "提交信息"        # 自动暂存所有已跟踪文件的修改（跳过 git add）
git commit --amend               # 修改最后一次提交（追加修改或改提交信息）
git commit -m "feat: add new feature"   # 约定式提交（推荐格式）

# 查看提交历史
git log                          # 完整历史
git log --oneline                # 每行一条（简洁）
git log --oneline -10            # 最近 10 条
git log --graph --oneline --all  # 图形化分支历史
git log -p filename.txt          # 查看某文件的修改历史
git log --author="name"          # 只看某作者的提交
git log --since="2026-01-01"    # 只看某日期之后的提交
git log --grep="fix"            # 搜索提交信息
```

### 3.4 撤销操作

```bash
# 撤销工作目录中的修改（未暂存！危险！）
git checkout -- filename.txt
git restore filename.txt        # Git 2.23+ 推荐写法
git restore .                   # 撤销所有文件的修改

# 取消暂存（已 add 但未 commit）
git reset HEAD filename.txt    # 取消暂存单个文件
git reset HEAD .               # 取消暂存所有文件
git restore --staged filename.txt  # 同上，新写法

# 回退已提交的版本（未 push）
git revert <commit-hash>         # 创建新提交来撤销指定提交（安全，保留历史）
git reset --soft HEAD~1          # 回退一次提交，保留修改在暂存区
git reset --mixed HEAD~1         # 回退一次提交，保留修改在工作区（默认）
git reset --hard HEAD~1         # 回退一次提交，丢弃所有修改（危险！）

# 删除未提交的修改（非常危险）
git reset --hard HEAD
git clean -fd                    # 删除所有未跟踪的文件（-f 文件，-d 目录）
```

> ⚠️ **`git reset --hard` 是危险操作**，会丢失未提交的修改。执行前务必确认你已经提交了所有重要工作。`git reflog` 可以恢复误删的提交。

### 3.5 恢复误删的提交

```bash
git reflog                        # 查看所有操作历史
git reflog --date=relative        # 显示相对时间

# 假设你 reset --hard 到了某个旧提交，可以通过 reflog 恢复：
git checkout HEAD@{5}
git reset --hard HEAD@{5}
```

---

## 四、分支管理

### 4.1 查看与创建分支

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看分支详情
git branch -v                    # 显示每个分支的最后一次提交
git branch -vv                   # 显示本地分支跟踪的远程分支

# 创建新分支（不会自动切换）
git branch feature-new

# 创建并切换到新分支
git checkout -b feature-new
git switch -c feature-new        # Git 2.23+ 推荐写法
```

### 4.2 切换分支

```bash
git checkout main                # 切换到 main 分支
git switch main                  # 同上，更直观
git switch -                    # 切换到上一次所在的分支（相当于 cd -）

# 切换时丢弃未提交的修改（危险）
git checkout -f main
```

### 4.3 删除与重命名分支

```bash
# 删除已合并的分支
git branch -d feature-old

# 强制删除未合并的分支
git branch -D feature-old

# 重命名当前分支
git branch -m new-name

# 重命名其他分支
git branch -m old-name new-name
```

### 4.4 合并分支

```bash
# 将指定分支合并到当前分支
git checkout main
git merge feature-new

# 合并时如果两个分支修改了同一文件，会产生**冲突**，需要手动解决（见第十节）

# 禁止 Fast-forward 合并（保留分支历史）
git merge --no-ff feature-new

# 合并特定的 commit（不是整个分支）
git cherry-pick <commit-hash>
```

### 4.5 Rebase（变基）

> 💡 **什么时候用 merge vs rebase？**
> - **merge**：保留完整历史，合并所有分支，适合公共分支
> - **rebase**：线性历史，适合整理个人分支的提交记录

```bash
# 将当前分支变基到目标分支之上（重写提交历史）
git checkout feature-new
git rebase main

# 交互式变基（重写、合并、修改、删除提交 — 最强大的工具）
git rebase -i HEAD~5           # 修改最近 5 个提交

# 在 rebase 过程中：
#   pick = 保留此提交
#   squash = 合并到上一个提交（保留消息）
#   fixup = 合并到上一个提交（丢弃消息）
#   reword = 修改提交信息
#   drop = 删除提交

# 解决完冲突后继续 rebase
git rebase --continue

# 中止 rebase，恢复原状态
git rebase --abort
```

### 4.6 暂存工作（Stash）

当你在某个分支上有未提交的修改，但需要紧急切换到其他分支处理问题时，用 stash：

```bash
# 暂存当前所有修改（包括未跟踪文件）
git stash
git stash -u                    # 包含未跟踪文件
git stash -a                    # 包含被忽略的文件

# 带消息的暂存
git stash push -m "WIP: working on feature X"

# 查看暂存列表
git stash list

# 恢复最新暂存（同时从 stash 列表删除）
git stash pop

# 恢复最新暂存（保留在 stash 列表中）
git stash apply

# 恢复指定暂存
git stash apply stash@{2}

# 查看暂存的内容
git stash show
git stash show -p               # 查看详细 diff

# 删除某个 stash
git stash drop stash@{0}

# 清空所有 stash
git stash clear
```

---

## 五、远程仓库

### 5.1 添加与查看远程仓库

```bash
# 查看远程仓库
git remote                      # 只显示名称
git remote -v                   # 显示名称 + URL

# 添加远程仓库
git remote add origin git@github.com:username/repo.git
git remote add upstream https://github.com/original/repo.git

# 重命名远程仓库
git remote rename origin github

# 删除远程仓库
git remote remove origin
```

### 5.2 拉取与推送

```bash
# 拉取远程分支（不合并）
git fetch origin

# 拉取并合并（最常用）
git pull                       # 等同于 fetch + merge
git pull origin main
git pull --rebase origin main  # 变基式拉取（保持线性历史）

# 推送（第一次推送时设置上游分支）
git push -u origin main        # -u = --set-upstream，建立跟踪关系
git push origin feature-new   # 推送新分支到远程

# 后续推送（已有上游分支）
git push

# 推送所有分支
git push --all origin

# 推送标签
git push origin v1.0.0        # 推送单个标签
git push --tags origin         # 推送所有标签

# 删除远程分支
git push origin --delete feature-old
```

### 5.3 跟踪关系

```bash
# 查看本地分支的跟踪分支
git branch -vv

# 设置上游分支
git branch --set-upstream-to=origin/main

# 取消跟踪
git branch --unset-upstream
```

---

## 六、Git 标签与版本管理

### 6.1 创建标签

```bash
# 查看所有标签
git tag

# 创建附注标签（推荐，含元信息）
git tag -a v1.0.0 -m "Version 1.0.0, initial release"
git tag -a v1.0.0 <commit-hash> -m "Tag specific commit"

# 创建轻量标签
git tag v1.0.0

# 给已存在的标签添加注释
git tag -a v1.0.0 -m "Version 1.0.0" <commit-hash>
```

### 6.2 推送与删除标签

```bash
# 推送标签到远程
git push origin v1.0.0
git push --tags

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
git push origin :refs/tags/v1.0.0    # 旧写法
```

### 6.3 查看标签详情

```bash
git show v1.0.0
```

---

## 七、GitHub 协作流程

### 7.1 Fork 与 Clone

当你参与一个开源项目（或团队项目）时，通常的流程是：

```
1. 在 GitHub 网页上 Fork 项目（创建你自己的副本）
2. Clone 你 Fork 的仓库到本地
3. 在本地创建分支，修改代码
4. 推送分支到你的 Fork
5. 在 GitHub 上发起 Pull Request（PR）
6. 等待项目维护者 Code Review
7. 合并后，同步最新代码到你的 Fork
```

```bash
# Fork 后，克隆你的 Fork（用 SSH 或 HTTPS）
git clone git@github.com:yourname/repo.git
cd repo

# 添加上游仓库（方便后续同步原项目的更新）
git remote add upstream https://github.com/original/repo.git

# 验证远程仓库配置
git remote -v
# origin    git@github.com:yourname/repo.git (fetch)
# origin    git@github.com:yourname/repo.git (push)
# upstream  https://github.com/original/repo.git (fetch)
# upstream  https://github.com/original/repo.git (push)
```

### 7.2 同步上游仓库

```bash
# 获取上游最新代码
git fetch upstream

# 切换到 main 分支
git checkout main

# 合并上游的 main 到本地 main（或者用 rebase）
git merge upstream/main

# 或者变基方式
git checkout your-feature-branch
git rebase upstream/main

# 推送到你的 origin
git push origin main
```

### 7.3 GitHub 上的角色与权限

| 角色 | 权限 |
|------|------|
| **Owner** | 完全控制仓库（billing, settings, 删除仓库） |
| **Maintainer** | 管理分支、标签、关闭 PR/PR |
| **Write** | 推送代码、创建分支、提交 PR |
| **Triage** | 管理 Issues 和 PR（不能直接推送） |
| **Read** | 只能读取代码（Fork 之后才能贡献） |

---

## 八、Pull Request 详解

### 8.1 创建 Pull Request

当你完成了功能开发并推送到 Fork（或同一仓库的分支）后，在 GitHub 上发起 PR：

1. 打开你的仓库页面
2. 切换到你的分支
3. 点击 **Compare & pull request**
4. 填写 PR 信息并提交

也可以用 GitHub CLI 命令行创建：

```bash
# 安装 GitHub CLI（Debian/Ubuntu）
sudo apt install gh

# 登录
gh auth login

# 创建 PR
gh pr create --base main --head feature-new \
  --title "feat: add new feature" \
  --body "## Description\n\nAdds a new feature that..."

# 查看 PR
gh pr list
gh pr view 123

# 查看 PR 差异
gh pr diff 123
```

### 8.2 PR 描述模板（建议在仓库中创建）

在项目根目录创建 `.github/pull_request_template.md`：

```markdown
## 描述
<!-- 简要说明这次 PR 做了什么 -->

## 改动内容
<!-- 详细说明改动点 -->

## 相关 Issue
<!-- 关联的 Issue，如 Closes #123 -->

## 测试
<!-- 你做了哪些测试 -->

## 截图（如果有 UI 改动）
<!-- 附上截图 -->
```

### 8.3 PR 审查与合并

```bash
# 查看 PR 状态
gh pr status

# 批准 PR
gh pr review 123 --approve

# 请求修改
gh pr review 123 --request-changes -b "需要修改以下几点..."

# 添加评论
gh pr comment 123 --body "LGTM! 💯"

# 合并 PR
gh pr merge 123
gh pr merge 123 --squash    # Squash and merge（把所有提交压缩成一个）
gh pr merge 123 --rebase    # Rebase and merge（保留线性历史）
```

### 8.4 代码合并策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **Create a merge commit** | 合并时创建一个 merge commit | 保留完整分支历史 |
| **Squash and merge** | 所有 commits 压缩成一个 | PR 内的多个 wip 提交，线性历史 |
| **Rebase and merge** | 变基后直接合并 | 保持线性历史，需要干净的 commits |

推荐团队统一约定一种策略，比如 GitHub 仓库设置中强制 squash merge。

---

## 九、Code Review 实战

### 9.1 Code Review 的价值

- 🐛 **发现 bug**：审查阶段发现的问题比上线后修复代价低 10-100 倍
- 📖 **知识共享**：团队成员互相了解彼此的代码
- 🎓 **标准统一**：通过 Review 建立和维护代码规范
- 🔒 **安全审查**：及时发现潜在安全漏洞

### 9.2 提交 Code Review 的规范

作为**被审查者**：

```bash
# PR 描述要清晰
# 每个 commit 应该是原子性的（一个 commit 做一个改动）
# commit 信息要规范
git log --oneline -5   # 审查前先看看提交历史是否清晰
```

作为**审查者**：

```bash
# 仔细阅读 diff
gh pr diff 123

# 查看单个文件改动
gh pr diff 123 -- filename.txt

# 检出 PR 到本地测试
git fetch origin pull/123/head:pr-123
git checkout pr-123
```

### 9.3 常见的 Review 反馈模式

```
<!-- 建议（用 Should / Consider -->
<!-- Nit: 这种写法可以更简洁 -->

<!-- 必须修复（用 Must / Need to） -->
<!-- Blocking: 这里有 bug，需要修复后再合并 -->

<!-- 提问（用 Question / Curious about） -->
<!-- Question: 为什么这里用 set 而不是 list？-->

<!-- 称赞（适当使用，激励团队） -->
<!-- Nitpick: 可选，但这个变量名很清晰 👍 -->
```

### 9.4 GitHub 上的 Review 操作

```bash
# 添加单行评论
gh pr comment 123 --body "这里可以用列表推导式" -o filename.txt -L 10

# 开始 Review
gh pr review 123 --body "整体看起来不错，有几个小建议" --approve
```

---

## 十、冲突处理

### 10.1 为什么会产生冲突

冲突发生在两个分支**修改了同一文件的同一位置**，而 Git 无法自动合并时：

```
<<<<<<< HEAD
const name = "Alice";
=======
const name = "Bob";
>>>>>>> feature-branch
```

### 10.2 解决冲突的步骤

```bash
# 1. 确保当前分支是要保留的分支（如 main）
git checkout main
git pull origin main

# 2. 切换到有冲突的分支
git checkout feature-new

# 3. 将 main 合并进来（触发冲突）
git merge main
# Git 会列出有冲突的文件

# 4. 手动编辑冲突文件，删除冲突标记，选择保留内容
# 打开冲突文件，找到 <<<<<<<, =======, >>>>>>>
# 保留需要的代码，删除冲突标记

# 5. 暂存解决后的文件
git add filename.txt

# 6. 完成提交（Git 会自动生成 merge commit 信息）
git commit -m "Merge main into feature-new, resolve conflicts"
git push
```

### 10.3 避免冲突的最佳实践

1. **频繁 rebase main**：在功能分支上工作时，定期 `git rebase main`
2. **小步提交**：每次只做一个小改动，减少冲突概率
3. **提前沟通**：团队成员分配好各自负责的文件，减少同一文件改动
4. **功能分支独立性强**：减少与其他分支的代码耦合

### 10.4 Abort 放弃合并

如果冲突太复杂，一时半会解决不了：

```bash
git merge --abort
```

---

## 十一、Git 工作流

### 11.1 Gitflow 工作流

最经典的多人协作工作流，适合有固定发布周期的项目：

```
  main (生产环境)
    ───●──────●──────●──────●────── (merge from release/hotfix)
           /
  release/1.0 ────●──●──●  (发布分支)
           /
  develop ───●──●──●──●──●──●──●  (开发主线)
              \   \       /
   hotfix/1.0.1 ─●─        (热修复分支，紧急从 main 切)
                  \
               feature/user-auth ─●──●──●  (功能分支)
```

```bash
# 开始一个新功能
git checkout develop
git checkout -b feature/user-auth

# 完成功能
git checkout develop
git merge --no-ff feature/user-auth
git branch -d feature/user-auth

# 创建发布分支
git checkout -b release/1.0.0 develop

# 完成发布
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
git branch -d release/1.0.0
```

### 11.2 GitHub Flow（更轻量）

适合持续部署的 Web 项目，流程极其简单：

```
main ───●──●──●──●──●──●  (所有代码经过 PR 审查后直接合并到 main)
            \
             ●──●──●──●──●  (功能分支，完成后 PR 到 main)
```

**规则**：`main` 分支始终可部署，任何改动通过 PR 合并。

### 11.3 trunk-based development

所有开发者从 `main`（trunk）创建短生命周期功能分支（最多 1-2 天），频繁合并到 trunk。适合小团队和快速迭代。

---

## 十二、Hexo + GitHub 自动部署

### 12.1 方案一：GitHub Actions 自动部署（推荐）

这是最流行的方案：本地写文章 → 推送到 GitHub → GitHub Actions 自动构建并部署到 VPS。

**步骤 1：在 GitHub 上创建空仓库**

在 https://github.com/new 创建 `zyang-blog` 仓库。

**步骤 2：在 VPS 上创建部署用户（安全隔离）**

```bash
# 创建一个专门用于部署的 Linux 用户（不在本教程的演示中，假设用 root）
sudo adduser deployer
sudo usermod -aG sshd deployer
```

**步骤 3：在 GitHub 仓库中创建 Actions Workflow**

在 `.github/workflows/deploy.yml` 中写入：

```yaml
name: Deploy to VPS

on:
  push:
    branches:
      - main   # main 分支有新推送时触发

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: true  # 拉取 Butterfly 主题 submodule
          fetch-depth: 1

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npx hexo generate
        env:
          TZ: Asia/Shanghai

      - name: Deploy to server via RSYNC
        uses: AEnterprise/rsync-deploy@v1.0
        with:
          switches: -avz --delete
          remote_path: '/var/www/zyang_blog/'
          remote_host: ${{ secrets.VPS_HOST }}
          remote_user: root
          remote_key: ${{ secrets.VPS_SSH_KEY }}
          # 排除不需要上传的目录
          exclude: >-
            .github
            node_modules
            .git
            .gitignore
            _config.yml
```

**步骤 4：配置 GitHub Secrets**

在 GitHub 仓库页面 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**：

| Secret 名称 | 内容 |
|------------|------|
| `VPS_HOST` | 你的 VPS IP（如 `68.183.230.214`）|
| `VPS_SSH_KEY` | VPS 的私钥内容（`cat ~/.ssh/id_rsa`） |

**步骤 5：本地推送文章，自动触发部署**

```bash
# 关联远程仓库（替换为你的 GitHub 仓库地址）
git remote add origin git@github.com:yourname/zyang-blog.git

# 提交博客源码
git add .
git commit -m "docs: write new article"
git push -u origin main
```

此后，每次 `git push` 到 GitHub，Actions 都会自动运行：
1. 拉取最新代码
2. 安装 npm 依赖
3. 执行 `hexo generate` 构建
4. 通过 rsync 同步到 VPS `/var/www/zyang_blog/`

整个过程**无需人工干预**，你只需要写完文章 `git push`，5 分钟内网站就更新了。

### 12.2 方案二：Git Hooks 自动部署（经典方案）

在服务器上配置 Git 仓库，通过 `post-receive` 钩子自动部署：

**步骤 1：在本地博客目录初始化 Git**

```bash
cd ~/blog/zyang_blog  # 你的博客源码目录
git init
git add .
git commit -m "Initial commit"
```

**步骤 2：在服务器上创建裸仓库**

```bash
sudo mkdir -p /var/repo/zyang_blog.git
cd /var/repo/zyang_blog.git
sudo git init --bare
sudo chown -R $USER:$USER /var/repo
```

**步骤 3：创建 post-receive 钩子**

```bash
cat > /var/repo/zyang_blog.git/hooks/post-receive << 'EOF'
#!/bin/bash

GIT_REPO=/var/repo/zyang_blog.git
TMP_CLONE=/tmp/zyang_blog_deploy
PUBLIC_WWW=/var/www/zyang_blog

# 克隆仓库到临时目录
git clone $GIT_REPO $TMP_CLONE

# 进入博客目录
cd $TMP_CLONE

# 安装依赖
npm install

# 清理并构建
hexo clean
hexo generate

# 同步到 Web 目录
rm -rf $PUBLIC_WWW/*
cp -r $TMP_CLONE/public/* $PUBLIC_WWW/

# 清理临时目录
rm -rf $TMP_CLONE

echo "Deploy completed at $(date)"
EOF

chmod +x /var/repo/zyang_blog.git/hooks/post-receive
```

**步骤 4：本地添加远程仓库并推送**

```bash
# 在本地博客目录
git remote add deploy ssh://root@68.183.230.214:/var/repo/zyang_blog.git

# 推送（首次需要配置 SSH 无密码登录）
git push deploy main
```

**步骤 5：配置 SSH 无密码登录**

```bash
# 在本地机器
ssh-copy-id root@68.183.230.214
```

### 12.3 方案对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| **GitHub Actions** | 免费、CI/CD 功能强大、可视化、可同时部署到多台服务器 | 需要配置 Secrets，Actions 日志在国内访问较慢 |
| **Git Hooks** | 简单直接，无额外服务 | 服务器必须开放 SSH 端口给 GitHub |

---

## 十三、高级技巧

### 13.1 交互式暂存（分块提交）

当一个文件有多处改动，想分多次提交时：

```bash
git add -p filename.txt
# Git 会逐块显示改动，询问操作：
#   y = 暂存此块
#   n = 不暂存此块
#   s = 拆分小块
#   e = 手动编辑
```

### 13.2 Bisect 定位 bug

Git bisect 通过二分查找快速定位引入 bug 的提交：

```bash
git bisect start
git bisect bad HEAD                    # 当前版本有 bug
git bisect good v1.0.0                # 某个旧版本是好的

# Git 会 checkout 中间版本，测试是否正常
# 告诉 Git 结果：
git bisect good    # 此版本正常
git bisect bad     # 此版本有 bug

# 重复直到找到引入 bug 的提交
git bisect reset   # 结束后回到原分支
```

### 13.3 子模块（Submodule）

当一个仓库需要引用另一个独立仓库的特定版本时：

```bash
# 添加子模块
git submodule add https://github.com/jerryc127/hexo-theme-butterfly.git themes/butterfly

# 克隆包含子模块的仓库
git clone --recurse-submodules https://github.com/username/repo.git

# 更新子模块
git submodule update --remote themes/butterfly

# 在子模块中提交
cd themes/butterfly
git checkout main && git pull
cd ../..
git add themes/butterfly
git commit -m "Update butterfly theme"
```

### 13.4 Worktree（多分支同时工作）

同时在多个分支上工作，而不需要切换：

```bash
# 在新目录打开 feature 分支
git worktree add ../feature-worktree feature-new

# 查看所有 worktree
git worktree list

# 移除 worktree
git worktree remove ../feature-worktree
```

### 13.5 约定式提交（Conventional Commits）

统一提交信息格式，便于自动化工具处理（changelog 生成、版本管理等）：

```
<type>(<scope>): <subject>

# type 类型：
#   feat:     新功能
#   fix:      修复 bug
#   docs:     文档改动
#   style:    格式调整（不影响代码运行）
#   refactor: 重构（非功能修改）
#   test:     测试相关
#   chore:    构建或辅助工具变动

# 示例：
git commit -m "feat(sites): add Awwwards website card"
git commit -m "fix(nginx): correct proxy_pass trailing slash"
git commit -m "docs(readme): update deployment guide"
```

---

## 附录：常用 Git 命令速查

| 场景 | 命令 |
|------|------|
| 初始化仓库 | `git init` |
| 克隆仓库 | `git clone <url>` |
| 查看状态 | `git status` |
| 暂存文件 | `git add <file>` |
| 提交 | `git commit -m "<msg>"` |
| 查看历史 | `git log --oneline` |
| 创建分支 | `git checkout -b <branch>` |
| 切换分支 | `git checkout <branch>` |
| 合并分支 | `git merge <branch>` |
| 拉取代码 | `git pull` |
| 推送代码 | `git push` |
| 暂存修改 | `git stash` |
| 恢复 stash | `git stash pop` |
| 解决冲突 | 手动编辑 + `git add` + `git commit` |
| 撤销修改 | `git checkout -- <file>` |
| 查看差异 | `git diff` |
| 查看远程 | `git remote -v` |
| 创建标签 | `git tag -a v1.0 -m "msg"` |
| 变基 | `git rebase main` |
| 交互式变基 | `git rebase -i HEAD~n` |
| 查找 bug | `git bisect start` |

---

> 📝 本教程会持续更新。如果有任何问题或建议，欢迎在评论区留言！
>
> 关联阅读：[从零搭建 Hexo + Butterfly 博客教程](https://zyang.me/2026/04/22/hexo-butterfly-tutorial/)
