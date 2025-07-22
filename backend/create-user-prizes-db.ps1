# 创建用户奖品数据库文件的PowerShell脚本
$dbPath = "d:\VSCode_files\Blind-Box-System\backend\database\user_prizes.db"

# 创建SQLite文件头
$sqliteHeader = @(
    0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00
) + @(0) * 84

# 转换为字节数组并写入文件
$bytes = [byte[]]$sqliteHeader
[System.IO.File]::WriteAllBytes($dbPath, $bytes)

Write-Host "✅ 创建用户奖品数据库文件: $dbPath" -ForegroundColor Green
