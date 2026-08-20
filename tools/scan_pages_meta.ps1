$ErrorActionPreference = 'Stop'
$dir = 'C:\Users\BELLO IREBAMI\Desktop\Javascript\Apps\web\src\pages'
$out = 'C:\Users\BELLO IREBAMI\Desktop\Javascript\tools\spa_pages_meta.tsv'
$lines = New-Object System.Collections.Generic.List[string]
Get-ChildItem -Path $dir -Filter *.jsx | Sort-Object Name | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    $title = ''
    $tm = [regex]::Match($c, '<title>([^<]*)</title>')
    if ($tm.Success) { $title = $tm.Groups[1].Value.Trim() }
    if ($title -match '\{|`|\$') { $title = '[DYNAMIC] ' + $title }
    $desc = ''
    $dm = [regex]::Match($c, '<meta name="description" content="([^"]*)"')
    if (-not $dm.Success) { $dm = [regex]::Match($c, '<meta content="([^"]*)" name="description"') }
    if ($dm.Success) { $desc = $dm.Groups[1].Value.Trim() }
    if ($desc -match '\{|\`') { $desc = '[DYNAMIC]' }
    $h1 = ''
    $hm = [regex]::Match($c, '<h1[^>]*>([^<]*)</h1>')
    if ($hm.Success) { $h1 = $hm.Groups[1].Value.Trim() }
    $h2s = ([regex]::Matches($c, '<h2[^>]*>([^<]*)</h2>') | ForEach-Object { $_.Groups[1].Value.Trim() } | Where-Object { $_ -ne '' }) -join ' | '
    $lines.Add(('{0}`t{1}`t{2}`t{3}`t{4}' -f $_.Name, $title, $desc, $h1, $h2s))
}
$lines | Set-Content -Path $out -Encoding UTF8
Write-Output "Wrote $($lines.Count) rows"