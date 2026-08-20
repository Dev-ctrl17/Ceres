$ErrorActionPreference = 'Stop'
$root = 'C:\Users\BELLO IREBAMI\Desktop\Javascript\Apps\web\public'
$out = 'C:\Users\BELLO IREBAMI\Desktop\Javascript\tools\static_meta.tsv'
$lines = New-Object System.Collections.Generic.List[string]
$files = Get-ChildItem -Path $root -Recurse -File -Filter *.html |
    Where-Object { $_.FullName -notmatch '\\amp\\' -and $_.FullName -notmatch 'google' }
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw -Encoding UTF8
    $t = ''
    $tm = [regex]::Match($c, '<title>([^<]*)</title>', 'Singleline')
    if ($tm.Success) { $t = $tm.Groups[1].Value.Trim() }
    $m = ''
    $dm = [regex]::Match($c, '<meta name="description"\s+content="([^"]*)"', 'Singleline')
    if (-not $dm.Success) { $dm = [regex]::Match($c, '<meta content="([^"]*)"\s+name="description"', 'Singleline') }
    if ($dm.Success) { $m = $dm.Groups[1].Value.Trim() }
    $rel = $f.FullName.Substring($root.Length + 1)
    $lines.Add("$rel`t$($t.Length)`t$($m.Length)")
}
$lines | Sort-Object | Set-Content -Path $out -Encoding UTF8
Write-Output "Wrote $($lines.Count) rows"