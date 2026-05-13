param(
  [string]$Version = $env:VERSION,
  [string]$Binary = "",
  [switch]$NoModifyPath
)

$ErrorActionPreference = "Stop"

$App = "sally-code"
$Command = "sallycode"
$DisplayName = "Sally Code"
$Repo = if ($env:SALLY_CODE_REPO) { $env:SALLY_CODE_REPO } else { "paradox974333/opencode" }

function Write-Muted($Message) {
  Write-Host $Message -ForegroundColor DarkGray
}

function Get-InstallDir {
  if ($env:SALLY_CODE_INSTALL_DIR) {
    return $env:SALLY_CODE_INSTALL_DIR
  }
  return Join-Path $HOME ".sally-code\bin"
}

function Get-Arch {
  $arch = [System.Runtime.InteropServices.RuntimeInformation]::ProcessArchitecture.ToString().ToLowerInvariant()
  switch ($arch) {
    "x64" { return "x64" }
    "arm64" { return "arm64" }
    default { throw "Unsupported Windows architecture: $arch" }
  }
}

function Test-Avx2 {
  if ((Get-Arch) -ne "x64") {
    return $false
  }

  $type = "Win32.Kernel32" -as [type]
  if (!$type) {
    $type = Add-Type -MemberDefinition @"
[DllImport("kernel32.dll")]
public static extern bool IsProcessorFeaturePresent(int ProcessorFeature);
"@ -Name Kernel32 -Namespace Win32 -PassThru
  }

  return $type::IsProcessorFeaturePresent(40)
}

function Get-LatestVersion {
  $headers = @{ "User-Agent" = "sally-code-installer" }
  $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repo/releases/latest" -Headers $headers
  return ($release.tag_name -replace "^v", "")
}

function Add-ToUserPath($InstallDir) {
  $pathParts = ($env:PATH -split ";") | Where-Object { $_ }
  if ($pathParts -contains $InstallDir) {
    return
  }

  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $userParts = ($userPath -split ";") | Where-Object { $_ }
  if ($userParts -notcontains $InstallDir) {
    $next = @($userParts + $InstallDir) -join ";"
    [Environment]::SetEnvironmentVariable("Path", $next, "User")
    Write-Muted "Added $InstallDir to your user PATH."
  }

  $env:PATH = @($pathParts + $InstallDir) -join ";"
}

$InstallDir = Get-InstallDir
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
$TargetPath = Join-Path $InstallDir "$Command.exe"

if ($Binary) {
  if (!(Test-Path -LiteralPath $Binary)) {
    throw "Binary not found at $Binary"
  }
  Write-Host "`nInstalling $DisplayName from: $Binary"
  Copy-Item -LiteralPath $Binary -Destination $TargetPath -Force
}
else {
  $arch = Get-Arch
  $target = "windows-$arch"
  if ($arch -eq "x64" -and !(Test-Avx2)) {
    $target = "$target-baseline"
  }

  if (!$Version) {
    $SpecificVersion = Get-LatestVersion
    $url = "https://github.com/$Repo/releases/latest/download/$App-$target.zip"
  }
  else {
    $SpecificVersion = $Version -replace "^v", ""
    $url = "https://github.com/$Repo/releases/download/v$SpecificVersion/$App-$target.zip"
  }

  Write-Host "`nInstalling $DisplayName version: $SpecificVersion"

  $tmp = Join-Path ([System.IO.Path]::GetTempPath()) "sally-code-install-$PID"
  if (Test-Path -LiteralPath $tmp) {
    Remove-Item -LiteralPath $tmp -Recurse -Force
  }
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null

  try {
    $archive = Join-Path $tmp "$App-$target.zip"
    Invoke-WebRequest -Uri $url -OutFile $archive -UseBasicParsing
    Expand-Archive -LiteralPath $archive -DestinationPath $tmp -Force

    $candidates = @(
      (Join-Path $tmp "$Command.exe"),
      (Join-Path $tmp $Command),
      (Join-Path $tmp "opencode.exe"),
      (Join-Path $tmp "opencode")
    )
    $extracted = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
    if (!$extracted) {
      throw "Archive did not contain $Command.exe"
    }

    Copy-Item -LiteralPath $extracted -Destination $TargetPath -Force
  }
  finally {
    Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
  }
}

if (!$NoModifyPath) {
  Add-ToUserPath $InstallDir
}

Write-Host ""
Write-Muted "$DisplayName is installed."
Write-Host ""
Write-Host "cd <project>  " -NoNewline
Write-Muted "# Open your project"
Write-Host "$Command     " -NoNewline
Write-Muted "# Run Sally Code"
Write-Host ""
Write-Muted "Restart your terminal if $Command is not found yet."
