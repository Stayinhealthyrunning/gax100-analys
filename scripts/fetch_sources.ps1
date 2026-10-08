param(
    [string]$Root = (Join-Path (Split-Path -Parent $PSScriptRoot) 'data\raw')
)

$ErrorActionPreference = 'Stop'
$htmlDir = Join-Path $Root 'html'
$pdfDir = Join-Path $Root 'pdf'
New-Item -ItemType Directory -Force -Path $htmlDir, $pdfDir | Out-Null

$sources = @(
    @{ Id='result-index-2026'; Url='https://gax100.se/resultat/'; Kind='html' },
    @{ Id='result-2014'; Url='https://gax100.se/resultat/resultat-2014/'; Kind='html' },
    @{ Id='result-2015'; Url='https://gax100.se/resultat/resultat-2015/'; Kind='html' },
    @{ Id='result-2016'; Url='https://gax100.se/resultat/resultat-2016/'; Kind='html' },
    @{ Id='result-2017'; Url='https://gax100.se/resultat/resultat-2017/'; Kind='html' },
    @{ Id='result-2018'; Url='https://gax100.se/resultat/resultat-2018/'; Kind='html' },
    @{ Id='result-2019'; Url='https://gax100.se/resultat/resultat-2019/'; Kind='html' },
    @{ Id='result-2020'; Url='https://gax100.se/resultat/resultat-2020/'; Kind='html' },
    @{ Id='result-2021'; Url='https://gax100.se/resultat/resultat-2021/'; Kind='html' },
    @{ Id='result-2022'; Url='https://gax100.se/resultat/resultat-2022/'; Kind='html' },
    @{ Id='result-2023'; Url='https://gax100.se/resultat/resultat-2023/'; Kind='html' },
    @{ Id='result-2024'; Url='https://gax100.se/resultat/resultat-2024/'; Kind='html' },
    @{ Id='result-2025'; Url='https://gax100.se/resultat/resultat-2025/'; Kind='html' },
    @{ Id='course-current'; Url='https://gax100.se/bana-karta/'; Kind='html' },
    @{ Id='pm-2023'; Url='https://gax100.se/wp-content/uploads/2024/03/GaxPM2023.pdf'; Kind='pdf' }
)

$manifest = [System.Collections.Generic.List[object]]::new()
foreach ($source in $sources) {
    $ext = if ($source.Kind -eq 'pdf') { '.pdf' } else { '.html' }
    $targetDir = if ($source.Kind -eq 'pdf') { $pdfDir } else { $htmlDir }
    $target = Join-Path $targetDir ($source.Id + $ext)
    $item = [ordered]@{ id=$source.Id; url=$source.Url; kind=$source.Kind; path=$target; fetched_at=$null; status='not_attempted'; sha256=$null; error=$null }
    try {
        Invoke-WebRequest -Uri $source.Url -OutFile $target -UseBasicParsing
        $hash = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
        $item.fetched_at = (Get-Date).ToUniversalTime().ToString('o')
        $item.status = 'downloaded'
        $item.sha256 = $hash
    } catch {
        $item.fetched_at = (Get-Date).ToUniversalTime().ToString('o')
        $item.status = 'failed'
        $item.error = $_.Exception.Message
    }
    $manifest.Add([pscustomobject]$item)
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $Root 'MANIFEST.json') -Encoding UTF8
$manifest | Select-Object id,status,sha256,error | Format-Table -AutoSize
