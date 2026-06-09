[CmdletBinding()]
param(
    [string]$RemoteHost = $env:DEPLOY_HOST,
    [string]$RemoteUser = $env:DEPLOY_USER,
    [string]$RemotePath = $(if ($env:DEPLOY_FRONTEND_PATH) { $env:DEPLOY_FRONTEND_PATH } else { "/var/www/html/" })
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$BuildDir = Join-Path $ProjectRoot "build"

if (-not $RemoteHost -or -not $RemoteUser) {
    throw "Set DEPLOY_HOST and DEPLOY_USER, or pass -RemoteHost and -RemoteUser."
}

Push-Location $ProjectRoot
try {
    Write-Host "Building frontend..."
    npm.cmd run build
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed."
    }

    if (-not (Test-Path -LiteralPath $BuildDir -PathType Container)) {
        throw "Build directory was not created: $BuildDir"
    }

    Write-Host "Uploading build/ contents to ${RemoteUser}@${RemoteHost}:${RemotePath}..."
    scp -r "$BuildDir\*" "${RemoteUser}@${RemoteHost}:${RemotePath}"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed."
    }

    Write-Host "Frontend deployment complete."
    Write-Host "API was not changed. Update it manually over SSH, then restart PM2."
} finally {
    Pop-Location
}
