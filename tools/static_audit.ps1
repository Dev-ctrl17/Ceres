$ErrorActionPreference = "Stop"
$root = "C:\Users\BELLO IREBAMI\Desktop\Javascript\Apps\web\public"
$lines = New-Object System.Collections.Generic.List[string]

function Get-WordCount([string]$html) {
    $t = [regex]::Replace($html, '(?s)<script.*?</script>', ' ')
    $t = [regex]::Replace($t, '(?s)<style.*?</style>', ' ')
    $t = [regex]::Replace($t, '(?s)<noscript.*?</noscript>', ' ')
    $t = $t -replace '<[^>]+>', ' '
    $t = $t -replace '&nbsp;', ' '
    $t = $t -replace '&amp;', '&'
    $t = $t -replace '&#x27;', "'"
    $t = $t -replace '&quot;', '"'
    $t = $t -replace '&lt;', '<'
    $t = $t -replace '&gt;', '>'
    $t = $t -replace '[^\S]+', ' '
    return ($t.Trim() -split '\s+' | Where-Object { $_ -ne '' }).Count
}

$files = Get-ChildItem -Path $root -Recurse -File -Filter *.html -ErrorAction SilentlyContinue
foreach ($f in $files) {
    $html = Get-Content -Path $f.FullName -Raw -Encoding UTF8
    $canon = 'NONE'
    $m = [regex]::Match($html, '<link[^>]*rel="canonical"[^>]*href="([^"]+)"')
    if (-not $m.Success) { $m = [regex]::Match($html, '<link[^>]*href="([^"]+)"[^>]*rel="canonical"') }
    if ($m.Success) { $canon = $m.Groups[1].Value }
    $meta = ''
    $m = [regex]::Match($html, '<meta name="description" content="([^"]*)"')
    if (-not $m.Success) { $m = [regex]::Match($html, '<meta content="([^"]*)" name="description"') }
    if ($m.Success) { $meta = $m.Groups[1].Value }
    $h1 = ([regex]::Matches($html, '<h1(\s[^>]*)?>')).Count
    $words = Get-WordCount $html
    $links = [regex]::Matches($html, 'href="([^"]+)"')
    $internal = @()
    foreach ($l in $links) {
        $u = $l.Groups[1].Value
        if ($u -match '^https://luxurypropertiesltd\.com\.(ng|ng)') { $internal += $u }
        elseif ($u.StartsWith('/')) { $internal += $u }
    }
    $self = $canon
    $outgoing = @($internal | Where-Object { $_ -ne $self -and $_ -ne '/' })
    $rel = $f.FullName.Substring($root.Length + 1)
    $lines.Add("$rel`t$canon`t$($meta.Length)`t$h1`t$words`t$($internal.Count)`t$($outgoing.Count)`t$(($outgoing | Select-Object -Unique) -join ' | ')")
}

$out = "C:\Users\BELLO IREBAMI\Desktop\Javascript\tools\static_audit.tsv"
$lines | Set-Content -Path $out -Encoding UTF8
Write-Output "Wrote $($lines.Count) rows to $out"