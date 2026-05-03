$projectRoot = "G:\D-files\mydojo-working"
$apiRoot = "G:\D-files\mydojo-working\server"
$envPath = Join-Path $apiRoot ".env"
$plinkPath = "C:\Program Files\PuTTY\plink.exe"
$jobs = @()
$tunnelProcess = $null
$tunnelLogPath = Join-Path $env:TEMP "mydojo-db-tunnel.log"

Write-Host "Starting MyDojo local development..." -ForegroundColor Cyan

function Stop-StalePlinkTunnel {
  param(
    [int]$LocalPort = 3307
  )

  $stalePids = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique

  foreach ($processId in $stalePids) {
    $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -eq "plink") {
      Write-Host "Stopping stale plink tunnel (PID: $processId) on port $LocalPort..." -ForegroundColor Yellow
      Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
  }
}

try {
  Get-Job -Name "mydojo-db-tunnel", "mydojo-backend" -ErrorAction SilentlyContinue | Stop-Job
  Get-Job -Name "mydojo-db-tunnel", "mydojo-backend" -ErrorAction SilentlyContinue | Remove-Job

  # 1. Start SSH tunnel
  if (-not (Test-Path $plinkPath)) {
    throw "PuTTY plink.exe not found at: $plinkPath"
  }

  $dbPasswordLine = Get-Content $envPath | Where-Object { $_ -match '^DB_PASSWORD=' } | Select-Object -First 1
  if (-not $dbPasswordLine) {
    throw "DB_PASSWORD is missing in $envPath"
  }
  $dbPassword = ($dbPasswordLine -replace '^DB_PASSWORD=', '').Trim().Trim('"')

  Stop-StalePlinkTunnel -LocalPort 3307

  Write-Host "Starting SSH DB tunnel on 127.0.0.1:3307..." -ForegroundColor Yellow
  $tunnelReady = $false
  if (Test-NetConnection 127.0.0.1 -Port 3307 -InformationLevel Quiet) {
    Write-Host "DB tunnel port 3307 is already open. Reusing existing tunnel." -ForegroundColor Yellow
    $tunnelReady = $true
  } else {
    if (Test-Path $tunnelLogPath) {
      Remove-Item $tunnelLogPath -Force -ErrorAction SilentlyContinue
    }
    $tunnelProcess = Start-Process -FilePath $plinkPath -ArgumentList @(
      "-batch",
      "-ssh",
      "root@66.116.232.151",
      "-P",
      "22",
      "-l",
      "root",
      "-pw",
      $dbPassword,
      "-N",
      "-L",
      "3307:127.0.0.1:3306"
    ) -PassThru -WindowStyle Hidden -RedirectStandardError $tunnelLogPath -ErrorAction Stop

    for ($i = 1; $i -le 15; $i++) {
      Start-Sleep -Seconds 2
      if (Test-NetConnection 127.0.0.1 -Port 3307 -InformationLevel Quiet) {
        $tunnelReady = $true
        break
      }
      if ($tunnelProcess.HasExited) {
        break
      }
    }
  }

  if (-not $tunnelReady) {
    Write-Host "DB tunnel did not open on 127.0.0.1:3307. Tunnel job output:" -ForegroundColor Red
    if (Test-Path $tunnelLogPath) {
      Get-Content $tunnelLogPath
    }
    throw "Failed to start DB tunnel"
  }

  # 2. Start backend API
  Write-Host "Starting backend API on http://127.0.0.1:4000..." -ForegroundColor Green
  $jobs += Start-Job -Name "mydojo-backend" -ScriptBlock {
    param($apiRoot)

    Set-Location $apiRoot
    npm.cmd run dev
  } -ArgumentList $apiRoot

  Start-Sleep -Seconds 3
  if (-not (Test-NetConnection 127.0.0.1 -Port 4000 -InformationLevel Quiet)) {
    Write-Host "Backend API did not open on 127.0.0.1:4000. Backend job output:" -ForegroundColor Red
    Receive-Job -Name "mydojo-backend" -Keep
    throw "Failed to start backend API"
  }

  Write-Host ""
  Write-Host "Started local development in this terminal." -ForegroundColor Cyan
  Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
  Write-Host "Backend:  http://127.0.0.1:4000" -ForegroundColor Green
  Write-Host "DB tunnel: 127.0.0.1:3307 -> remote MySQL" -ForegroundColor Green
  Write-Host ""
  Write-Host "Press Ctrl+C to stop the frontend, then close this terminal or stop background jobs if needed." -ForegroundColor Yellow
  Write-Host "To view background job output: Receive-Job -Name mydojo-backend -Keep" -ForegroundColor Yellow
  Write-Host ""

  # 3. Start frontend in the current Cursor terminal
  Set-Location $projectRoot
  Write-Host "Starting frontend on http://localhost:3000..." -ForegroundColor Green
  npm run dev
}
finally {
  if ($jobs.Count -gt 0) {
    Write-Host ""
    Write-Host "Stopping MyDojo background jobs..." -ForegroundColor Yellow
    $jobs | Stop-Job
    $jobs | Remove-Job
  }
  if ($tunnelProcess -and -not $tunnelProcess.HasExited) {
    Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
  }
}

# Run this from PowerShell in your project root (G:\D-files\mydojo-working):

# .\start-local-dev.ps1
# This script starts:

# DB tunnel (127.0.0.1:3307)
# Backend (http://127.0.0.1:4000)
# Frontend (http://localhost:3000)
# If script execution is blocked, run once in same terminal:

# Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass