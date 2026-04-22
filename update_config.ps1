$path = "d:\zyangblog\_config.butterfly.yml"
$content = Get-Content $path -Encoding UTF8
$newContent = New-Object System.Collections.Generic.List[string]
$suggestions = @{
    "menu" = "# 新手建议：在此配置导航栏菜单及其子菜单，格式为 '显示名称: /路径/ || 图标'"
    "social" = "# 新手建议：社交平台链接，格式为 '平台名: 链接 || 图标'"
    "favicon" = "# 新手建议：网站图标，建议放在 source/img/ 目录下"
    "avatar" = "# 新手建议：头像设置，img 项填写图片 URL"
    "subtitle" = "# 新手建议：副标题打字机效果，可以在此处配置显示的文字"
    "index_layout" = "# 新手建议：首页布局设置，控制边栏位置及显示"
    "toc" = "# 新手建议：文章目录设置，enable 为 true 开启"
    "reward" = "# 新手建议：打赏功能，配置微信/支付宝收款码"
    "aside" = "# 新手建议：侧边栏卡片设置，控制显示哪些模块"
    "darkmode" = "# 新手建议：深色模式开关"
    "search" = "# 新手建议：搜索系统配置，推荐使用 local_search"
    "comments" = "# 新手建议：评论系统，支持 Disqus, Valine, Waline 等"
    "pjax" = "# 新手建议：开启 PJAX 可实现页面无刷新跳转"
    "lazyload" = "# 新手建议：图片懒加载，优化加载速度"
    "pwa" = "# 新手建议：PWA 离线访问功能"
    "CDN" = "# 新手建议：CDN 静态资源加速"
    "nav" = "# 新手建议：导航栏外观设置"
    "post" = "# 新手建议：文章页相关配置"
    "math" = "# 新手建议：数学公式渲染，支持 KaTeX 和 MathJax"
}
$keys_to_comment = @("menu", "social", "favicon", "avatar", "subtitle", "index_layout", "toc", "reward", "aside", "darkmode", "search", "comments", "pjax", "lazyload", "pwa", "CDN", "nav")
foreach ($line in $content) {
    if ($line -match "^\s*#\s*中文说明：") { continue }
    if ($line -match "^\s*#\s*[\u4e00-\u9fa5]" -and $line -notmatch "新手建议：" -and $line -notmatch "核心配置：") { continue }
    if ($line -match "^#\s*新手建议：" -or $line -match "^#\s*核心配置：") { continue }
    
    $trimmedLine = $line.Trim()
    if ($trimmedLine -match "^([a-zA-Z0-9_-]+):") {
        $key = $Matches[1]
        if ($keys_to_comment -contains $key) { $newContent.Add("# 核心配置：$key") }
        if ($suggestions.ContainsKey($key)) { $newContent.Add($suggestions[$key]) }
    }
    $newContent.Add($line)
}
[System.IO.File]::WriteAllLines($path, $newContent, (New-Object System.Text.UTF8Encoding($false)))
Write-Output "Easy mode comments updated"
