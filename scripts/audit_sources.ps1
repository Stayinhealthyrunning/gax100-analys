$ErrorActionPreference = 'Stop'
$root = Join-Path (Split-Path -Parent $PSScriptRoot) 'data\raw'
$manifest = Get-Content (Join-Path $root 'MANIFEST.json') -Raw | ConvertFrom-Json
$rows = foreach ($item in $manifest | Where-Object kind -eq 'html') {
    if ($item.status -ne 'downloaded') {
        [pscustomobject]@{ id=$item.id; bytes=0; dnf=0; dns=0; splits=0; status=$item.status; note=$item.error }
        continue
    }
    $text = Get-Content -LiteralPath $item.path -Raw
    [pscustomobject]@{
        id=$item.id
        bytes=(Get-Item -LiteralPath $item.path).Length
        dnf=([regex]::Matches($text,'DNF','IgnoreCase')).Count
        dns=([regex]::Matches($text,'DNS','IgnoreCase')).Count
        splits=([regex]::Matches($text,'Magleberg|Haväng|Sandhammaren','IgnoreCase')).Count
        status=$item.status
        note='regex audit only; not normalized result counts'
    }
}
$out = Join-Path (Split-Path -Parent $PSScriptRoot) 'data\source-audit.json'
$rows | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $out -Encoding UTF8
$rows | Format-Table -AutoSize
