$ErrorActionPreference = 'Stop'
$root = 'C:\Users\BELLO IREBAMI\Desktop\Javascript\Apps\web\public'
$out = 'C:\Users\BELLO IREBAMI\Desktop\Javascript\tools\schema_scan.tsv'
$lines = New-Object System.Collections.Generic.List[string]
$pat = '@type": "([^"]+)"'
$files = Get-ChildItem -Path $root -Recurse -File -Filter *.html -ErrorAction SilentlyContinue
foreach ($f in $files) {
    if ($f.FullName -match 'amp' -or $f.FullName -match 'google') { continue }
    $c = Get-Content $f.FullName -Raw -Encoding UTF8
    $types = @()
    foreach ($m in [regex]::Matches($c, $pat)) { $types += $m.Groups[1].Value }
    $types = $types | Select-Object -Unique
    $rel = $f.FullName.Substring($root.Length + 1)
    $lines.Add($rel + "`t[" + ($types -join ',') + "]")
}
$lines | Sort-Object | Set-Content -Path $out -Encoding UTF8
Write-Output "Wrote $($lines.Count) rows"