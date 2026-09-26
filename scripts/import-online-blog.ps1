$ErrorActionPreference = 'Stop'
$site = 'https://techalpaca.vercel.app'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$staging = Join-Path $projectRoot '.migration-cache\online-blog'
New-Item -ItemType Directory -Force -Path $staging | Out-Null
$posts = ConvertFrom-Json -InputObject (Invoke-WebRequest -Uri "$site/blogs/index.json" -UseBasicParsing).Content
$posts | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath (Join-Path $staging 'index.json') -Encoding utf8
foreach ($post in $posts) {
  if ($post.hidden) { continue }
  $slug = [string]$post.slug
  if ($slug -notmatch '^[A-Za-z0-9-]+$') { throw "Unexpected source slug: $slug" }
  $articleDirectory = Join-Path $staging $slug
  New-Item -ItemType Directory -Force -Path $articleDirectory | Out-Null
  $article = Invoke-WebRequest -Uri "$site/blogs/$slug/index.md" -UseBasicParsing
  [System.IO.File]::WriteAllText((Join-Path $articleDirectory 'index.md'), $article.Content, [System.Text.UTF8Encoding]::new($false))
}
& node (Join-Path $PSScriptRoot 'import-online-blog.mjs') $staging @args
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
