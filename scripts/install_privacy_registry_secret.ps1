<#
.SYNOPSIS
  Install the existing PRIVATE Loppanalys GDPR registry as one GitHub Actions
  repository secret in the five race-analysis repositories.
.DESCRIPTION
  The JSON file stays outside all public GitHub repositories. The UTF-8 JSON
  is base64-encoded in memory and streamed over stdin to 'gh secret set' –
  never supplied in arguments, source files or Actions workflow logs.
  Run on an administrator's workstation authenticated with 'gh auth login'.
.EXAMPLE
  .\scripts\install_privacy_registry_secret.ps1 -RegistryPath 'C:\Private\registry.json'
#>
[CmdletBinding(SupportsShouldProcess=$true)]
param(
  [Parameter(Mandatory=$true)]
  [ValidateScript({Test-Path -LiteralPath $_ -PathType Leaf})]
  [string]$RegistryPath
)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$org = 'Stayinhealthyrunning'
$secretName = 'LOPPANALYS_PRIVACY_REGISTRY_B64'
$repos = @(
  'ultravasan-analys',
  'gotaleden-splits',
  'osterlen-spring-trail-analys',
  'satila-splits',
  'gax100-analys'
)
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw 'GitHub CLI (gh) is required. Install it and run gh auth login first.'
}
& gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw 'GitHub CLI is not authenticated.' }

# Validate schema without printing names, hashes, identifiers or registry bytes.
$raw = [IO.File]::ReadAllText((Resolve-Path -LiteralPath $RegistryPath).Path, [Text.Encoding]::UTF8)
try { $parsed = ConvertFrom-Json -InputObject $raw }
catch { throw 'Private registry JSON is invalid.' }
if ($null -eq $parsed -or $parsed.schema_version -ne 2 -or
    $null -eq $parsed.entries -or @($parsed.entries).Count -eq 0) {
  throw 'Expected nonempty private registry schema_version=2 with entries.'
}
foreach ($entry in $parsed.entries) {
  if ($entry.action -notin @('remove_result','restrict_identifiers','temporary_restriction') -or
      [string]$entry.match.normalized_name_sha256 -notmatch '^[0-9a-fA-F]{64}$') {
    throw 'Private registry has unsupported or invalid entries.'
  }
  foreach ($key in @('name','email','birthdate')) {
    if ($entry.PSObject.Properties.Name -contains $key) {
      throw 'Private registry includes an unapproved plaintext identity field.'
    }
  }
}
$encoded = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($raw))
try {
  foreach ($name in $repos) {
    $repo = "$org/$name"
    if (-not $PSCmdlet.ShouldProcess($repo,"Update GitHub Actions secret $secretName")) { continue }
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = (Get-Command gh).Source
    $psi.Arguments = "secret set $secretName --app actions --repo $repo"
    $psi.UseShellExecute = $false
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    $psi.CreateNoWindow = $true
    $process = [System.Diagnostics.Process]::Start($psi)
    try {
      $process.StandardInput.Write($encoded)
      $process.StandardInput.Close()
      # Never echo child-process output; accidental sensitive output must not
      # appear in operator's terminal or persistent build logs.
      $null = $process.StandardOutput.ReadToEnd()
      $null = $process.StandardError.ReadToEnd()
      $process.WaitForExit()
      if ($process.ExitCode -ne 0) {
        throw "GitHub rejected the secret update for $repo (exit $($process.ExitCode))."
      }
      Write-Host "Repository Actions secret installed: $repo (value hidden)."
    } finally { $process.Dispose() }
  }
  Write-Host 'Metadata-only verification (no secret values):'
  foreach ($name in $repos) {
    $repo = "$org/$name"
    $names = & gh secret list --app actions --repo $repo --json name --jq '.[].name'
    if ($LASTEXITCODE -ne 0 -or @($names) -notcontains $secretName) {
      throw "Secret metadata could not be verified for $repo."
    }
    Write-Host "Verified: $repo"
  }
} finally {
  $encoded = $null
  $raw = $null
  $parsed = $null
}
