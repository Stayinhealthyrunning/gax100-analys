$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$manifestPath = Join-Path $repo 'data\raw\MANIFEST.json'
$auditPath = Join-Path $repo 'data\source-audit.json'

if (-not (Test-Path $manifestPath)) { throw 'MANIFEST.json saknas: kör scripts/fetch_sources.ps1 först.' }
if (-not (Test-Path $auditPath)) { throw 'source-audit.json saknas: kör scripts/audit_sources.ps1 först.' }

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$audit = Get-Content $auditPath -Raw | ConvertFrom-Json
if ($manifest.Count -lt 15) { throw "För få källposter i manifest: $($manifest.Count)" }
if (($manifest | Where-Object status -eq 'downloaded').Count -lt 14) { throw 'För få nedladdade källor; kontrollera manifestet.' }
if (($manifest | Where-Object { $_.status -eq 'downloaded' -and [string]::IsNullOrWhiteSpace($_.sha256) }).Count -ne 0) { throw 'Nedladdad källa saknar SHA-256.' }
if (($audit | Where-Object note -notlike 'regex audit only*').Count -ne 0) { throw 'Auditens begränsningsmarkering saknas.' }
if ((Get-Content (Join-Path $repo '.gitignore') -Raw) -notmatch 'data/raw/') { throw 'Rådata är inte git-ignorerad.' }
Write-Output "PASS: manifest=$($manifest.Count), downloaded=$(($manifest | Where-Object status -eq 'downloaded').Count), audit=$($audit.Count)"
