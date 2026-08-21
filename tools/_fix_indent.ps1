# Re-indents lines that the editor double-prefixed during the slug migration.
# Matches a line by its (un-indented) token and rewrites the leading
# whitespace to the requested count. Safe to re-run.
$ErrorActionPreference = 'Stop'

function Fix-Line {
    param([string]$Path, [string]$Token, [int]$Indent)
    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Warning "Missing: $Path"
        return
    }
    $lines = [System.IO.File]::ReadAllLines($Path, [System.Text.Encoding]::UTF8)
    $regex = '^[ \t]+' + [regex]::Escape($Token)
    $changed = 0
    for ($i = 0; $i -lt $lines.Length; $i++) {
        if ($lines[$i] -match $regex) {
            $lines[$i] = (' ' * $Indent) + $Token
            $changed++
        }
    }
    [System.IO.File]::WriteAllLines($Path, $lines, [System.Text.Encoding]::UTF8)
    Write-Host ("Fixed {0} line(s) in {1}" -f $changed, $Path)
}

$root = 'C:\Users\BELLO IREBAMI\Desktop\Javascript\Apps\web'

Fix-Line "$root\src\App.jsx"             '<Route path="/properties/:slug" element={<PropertyDetailsPage />} />' 6
Fix-Line "$root\src\components\PropertyCard.jsx" '<Link to={`/properties/${property.slug}`}>'                  4
Fix-Line "$root\src\pages\InvestmentBriefPage.jsx" '<Link to={`/properties/${property.slug`}>`'                  18
Fix-Line "$root\scripts\getRoutes.js"  'const { data: properties, error } = await supabase'                  6
Fix-Line "$root\vercel.json"           '{ "source": "/landing/:slug", "destination": "/landing/:slug.html" },' 4
