<#
================================================================================
  UTRC - publish a run to the gallery
================================================================================

  EVERYDAY USE
  ------------
  1. Make a folder in  gallery\  named with the date:   2026-09-14-monday-5k
  2. Drop the photos and clips from that run into it.
  3. Right-click this file -> "Run with PowerShell".

  It rebuilds  gallery\runs.js , which is what the website reads. Refresh the
  page and the new run is there, dated, at the top of the log.


  FOLDER NAMING
  -------------
    2026-09-14                     -> date only, title picked from the weekday
    2026-09-14-monday-5k           -> "Monday 5K"
    2026-09-20-clubs-fair-takeover -> "Clubs Fair Takeover", tagged "special"

  Monday / Wednesday / Saturday folders are tagged automatically from the date.
  Anything on another weekday is tagged "special".


  PER-RUN DETAILS (optional)
  --------------------------
  Drop a plain text file called  info.txt  inside a run folder:

      title = Halloween Night Run
      where = Queen's Park
      type  = special

  Anything you set there wins over what the script guesses.


  HANDY SWITCHES
  --------------
    .\new-run.ps1 -New                 make a folder for the next run date
    .\new-run.ps1 -New -Date 2026-10-31 -Title "Halloween Run" -Type special
    .\new-run.ps1 -Open                rebuild, then open the site

================================================================================
#>

[CmdletBinding()]
param(
  [switch]$New,
  [switch]$Open,
  [string]$Date,
  [string]$Title,
  [string]$Type,
  [string]$Where
)

$ErrorActionPreference = 'Stop'
$root      = Split-Path -Parent $MyInvocation.MyCommand.Path
$galleryDir = Join-Path $root 'gallery'
$outFile    = Join-Path $galleryDir 'runs.js'

$IMAGE_EXT = @('.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif')
$VIDEO_EXT = @('.mp4', '.webm', '.mov', '.m4v')

Add-Type -AssemblyName System.Drawing

function Write-Step($msg) { Write-Host "  $msg" -ForegroundColor DarkGray }
function Write-Good($msg) { Write-Host "  $msg" -ForegroundColor Green }
function Write-Warn2($msg) { Write-Host "  $msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "  UTRC run publisher" -ForegroundColor Red
Write-Host "  ------------------" -ForegroundColor DarkGray

if (-not (Test-Path $galleryDir)) { New-Item -ItemType Directory -Path $galleryDir | Out-Null }

# ---------------------------------------------------------------- helpers ----
function Get-RunType([datetime]$d) {
  switch ($d.DayOfWeek) {
    'Monday'    { 'monday' }
    'Wednesday' { 'wednesday' }
    'Saturday'  { 'saturday' }
    default     { 'special' }
  }
}

function Get-DefaultTitle([datetime]$d) {
  switch ($d.DayOfWeek) {
    'Monday'    { 'Monday 5K' }
    'Wednesday' { 'Wednesday 5K' }
    'Saturday'  { 'Saturday Cafe Run' }
    default     { "$($d.DayOfWeek) Run" }
  }
}

function ConvertTo-TitleCase([string]$slug) {
  if ([string]::IsNullOrWhiteSpace($slug)) { return '' }
  $words = $slug -split '-' | Where-Object { $_ }
  $ti = (Get-Culture).TextInfo
  ($words | ForEach-Object {
    if ($_ -match '^\d+k$') { $_.ToUpper() } else { $ti.ToTitleCase($_) }
  }) -join ' '
}

# Web-safe relative path, forward slashes, spaces escaped.
function ConvertTo-WebPath([string]$folderName, [string]$fileName) {
  $enc = { param($s) ($s -replace '%', '%25' -replace ' ', '%20' -replace '#', '%23' -replace '\?', '%3F') }
  "gallery/$(& $enc $folderName)/$(& $enc $fileName)"
}

# Pixel size, corrected for the EXIF orientation flag so portrait phone
# photos are not reported as landscape.
function Get-ImageSize([string]$path) {
  try {
    $fs = [System.IO.File]::Open($path, 'Open', 'Read', 'ReadWrite')
    try {
      $img = [System.Drawing.Image]::FromStream($fs, $false, $false)
      try {
        $w = $img.Width; $h = $img.Height
        if ($img.PropertyIdList -contains 274) {
          $o = $img.GetPropertyItem(274).Value[0]
          if ($o -ge 5 -and $o -le 8) { $t = $w; $w = $h; $h = $t }
        }
        return @{ w = $w; h = $h }
      } finally { $img.Dispose() }
    } finally { $fs.Dispose() }
  } catch {
    return $null
  }
}

# Video dimensions via Explorer's own metadata, with a vertical-phone default.
$script:shell = $null
$script:vidIdx = $null
function Get-VideoSize([System.IO.FileInfo]$file) {
  try {
    if (-not $script:shell) { $script:shell = New-Object -ComObject Shell.Application }
    $dir = $script:shell.Namespace($file.DirectoryName)
    if (-not $dir) { return @{ w = 1080; h = 1920 } }
    $item = $dir.ParseName($file.Name)
    if (-not $item) { return @{ w = 1080; h = 1920 } }

    if (-not $script:vidIdx) {
      $script:vidIdx = @{}
      foreach ($i in 0..340) {
        $name = $dir.GetDetailsOf($null, $i)
        if ($name -eq 'Frame width')  { $script:vidIdx.w = $i }
        if ($name -eq 'Frame height') { $script:vidIdx.h = $i }
      }
    }
    if ($null -ne $script:vidIdx.w -and $null -ne $script:vidIdx.h) {
      $w = ($dir.GetDetailsOf($item, $script:vidIdx.w) -replace '[^\d]', '')
      $h = ($dir.GetDetailsOf($item, $script:vidIdx.h) -replace '[^\d]', '')
      if ($w -and $h) { return @{ w = [int]$w; h = [int]$h } }
    }
  } catch { }
  return @{ w = 1080; h = 1920 }
}

function Read-InfoFile([string]$folder) {
  $info = @{}
  $p = Join-Path $folder 'info.txt'
  if (Test-Path $p) {
    foreach ($line in (Get-Content $p -Encoding UTF8)) {
      if ($line -match '^\s*([A-Za-z]+)\s*=\s*(.+?)\s*$') {
        $info[$matches[1].ToLower()] = $matches[2]
      }
    }
  }
  return $info
}

function Escape-Json([string]$s) {
  if ($null -eq $s) { return '' }
  $s -replace '\\', '\\\\' -replace '"', '\"' -replace "`r", '' -replace "`n", ' '
}

# ------------------------------------------------------- -New: make folder ---
if ($New) {
  if ($Date) {
    $d = [datetime]::ParseExact($Date, 'yyyy-MM-dd', $null)
  } else {
    # next Mon / Wed / Sat, today included
    $d = (Get-Date).Date
    for ($i = 0; $i -lt 8; $i++) {
      $probe = $d.AddDays($i)
      if ($probe.DayOfWeek -in 'Monday', 'Wednesday', 'Saturday') { $d = $probe; break }
    }
  }

  $slug = if ($Title) { ($Title.ToLower() -replace '[^a-z0-9]+', '-').Trim('-') }
          else { (Get-DefaultTitle $d).ToLower() -replace '[^a-z0-9]+', '-' }

  $name = '{0}-{1}' -f $d.ToString('yyyy-MM-dd'), $slug
  $path = Join-Path $galleryDir $name

  if (Test-Path $path) {
    Write-Warn2 "Folder already exists: $name"
  } else {
    New-Item -ItemType Directory -Path $path | Out-Null
    $lines = @()
    if ($Title) { $lines += "title = $Title" }
    if ($Where) { $lines += "where = $Where" }
    if ($Type)  { $lines += "type  = $Type"  }
    if ($lines.Count) { $lines | Set-Content (Join-Path $path 'info.txt') -Encoding UTF8 }
    Write-Good "Created gallery\$name"
  }

  Write-Step "Drop the photos in, then run this script again."
  Start-Process $path
  Write-Host ""
  return
}

# ------------------------------------------------------------ scan folders ---
$folders = Get-ChildItem $galleryDir -Directory |
           Where-Object { $_.Name -match '^(\d{4})-(\d{2})-(\d{2})(?:-(.+))?$' } |
           Sort-Object Name -Descending

if (-not $folders) {
  Write-Warn2 "No dated folders in gallery\ yet."
  Write-Step  'Run  .\new-run.ps1 -New  to make one, or create it by hand:'
  Write-Step  '     gallery\2026-09-14-monday-5k\'
  Write-Host ""
}

$posts = @()
$totalMedia = 0
$skipped = @()

foreach ($f in $folders) {
  $null = $f.Name -match '^(\d{4})-(\d{2})-(\d{2})(?:-(.+))?$'
  $iso  = '{0}-{1}-{2}' -f $matches[1], $matches[2], $matches[3]
  $slug = $matches[4]

  try { $d = [datetime]::ParseExact($iso, 'yyyy-MM-dd', $null) }
  catch { $skipped += "$($f.Name)  (not a real date)"; continue }

  $files = Get-ChildItem $f.FullName -File |
           Where-Object { $IMAGE_EXT -contains $_.Extension.ToLower() -or
                          $VIDEO_EXT -contains $_.Extension.ToLower() } |
           Sort-Object { $_.Name -replace '\d+', { $args[0].Value.PadLeft(8, '0') } }, Name

  if (-not $files) { $skipped += "$($f.Name)  (no photos in it)"; continue }

  $info  = Read-InfoFile $f.FullName
  $title = if ($info.title) { $info.title }
           elseif ($slug)   { ConvertTo-TitleCase $slug }
           else             { Get-DefaultTitle $d }
  $type  = if ($info.type)  { $info.type.ToLower() } else { Get-RunType $d }
  $where = if ($info.where) { $info.where } else { '' }

  $media = @()
  foreach ($file in $files) {
    $ext = $file.Extension.ToLower()
    $isVideo = $VIDEO_EXT -contains $ext
    $size = if ($isVideo) { Get-VideoSize $file } else { Get-ImageSize $file.FullName }
    if (-not $size) { $size = @{ w = 1200; h = 1600 } }

    $media += [pscustomobject]@{
      src  = ConvertTo-WebPath $f.Name $file.Name
      type = if ($isVideo) { 'video' } else { 'image' }
      w    = $size.w
      h    = $size.h
    }
  }

  $totalMedia += $media.Count
  $posts += [pscustomobject]@{
    id    = $f.Name
    date  = $iso
    title = $title
    type  = $type
    where = $where
    media = $media
  }

  Write-Step ('{0}  {1,-28} {2,3} item(s)' -f $iso, $title, $media.Count)
}

# --------------------------------------------------------------- write out ---
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('/* ===========================================================================')
[void]$sb.AppendLine('   GENERATED FILE - do not edit by hand.')
[void]$sb.AppendLine('   Rebuilt by new-run.ps1 from the dated folders in gallery\.')
[void]$sb.AppendLine("   Last build: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$sb.AppendLine('   =========================================================================== */')
[void]$sb.AppendLine('window.UTRC_RUNS = {')
[void]$sb.AppendLine("  generated: `"$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')`",")
[void]$sb.AppendLine('  posts: [')

for ($i = 0; $i -lt $posts.Count; $i++) {
  $p = $posts[$i]
  [void]$sb.AppendLine('    {')
  [void]$sb.AppendLine("      id: `"$(Escape-Json $p.id)`",")
  [void]$sb.AppendLine("      date: `"$($p.date)`",")
  [void]$sb.AppendLine("      title: `"$(Escape-Json $p.title)`",")
  [void]$sb.AppendLine("      type: `"$(Escape-Json $p.type)`",")
  [void]$sb.AppendLine("      where: `"$(Escape-Json $p.where)`",")
  [void]$sb.AppendLine('      media: [')
  for ($j = 0; $j -lt $p.media.Count; $j++) {
    $m = $p.media[$j]
    $comma = if ($j -lt $p.media.Count - 1) { ',' } else { '' }
    [void]$sb.AppendLine("        { src: `"$(Escape-Json $m.src)`", type: `"$($m.type)`", w: $($m.w), h: $($m.h) }$comma")
  }
  [void]$sb.AppendLine('      ]')
  $comma = if ($i -lt $posts.Count - 1) { '    },' } else { '    }' }
  [void]$sb.AppendLine($comma)
}

[void]$sb.AppendLine('  ]')
[void]$sb.AppendLine('};')

Set-Content -Path $outFile -Value $sb.ToString() -Encoding UTF8 -NoNewline

Write-Host ""
Write-Good "gallery\runs.js rebuilt - $($posts.Count) run(s), $totalMedia item(s)."

if ($skipped.Count) {
  Write-Host ""
  Write-Warn2 "Skipped:"
  $skipped | ForEach-Object { Write-Step $_ }
}

Write-Host ""
Write-Step "Refresh the site to see it. Ctrl+F5 if the browser is caching."
Write-Host ""

if ($Open) { Start-Process (Join-Path $root 'runs.html') }
