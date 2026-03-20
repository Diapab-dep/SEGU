# DeprisaCheck - Ejecucion automatica completa
# Instalacion, BD, build, tests unitarios, integracion y E2E

$ErrorActionPreference = "Continue"
# Directorio raiz: parent de la carpeta scripts
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $ProjectRoot
Write-Host "Directorio de trabajo: $ProjectRoot" -ForegroundColor Gray

$results = @{}
function Step($name, $script) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host " $name" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    try {
        & $script
        if ($LASTEXITCODE -ne 0 -and $null -ne $LASTEXITCODE) { throw "Exit code $LASTEXITCODE" }
        $results[$name] = "OK"
        Write-Host "`n[OK] $name`n" -ForegroundColor Green
        return $true
    } catch {
        $results[$name] = "FALLO: $_"
        Write-Host "`n[FALLO] $name`: $_`n" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n>>> DeprisaCheck - Pipeline automatico <<<`n" -ForegroundColor Yellow

Step "1. npm install" { npm install }
Step "2. Frontend install" { Push-Location frontend; try { npm install } finally { Pop-Location } }
Step "3. Prisma generate" { npx prisma generate }
Step "4. DB push" { npx prisma db push }
Step "5. DB seed" { npm run db:seed }
Step "6. Build" { npm run build }
Step "7. Tests unitarios" { npm test }
Step "8. Tests integracion" { npm run test:integration }
Step "9. Playwright install (Chromium)" { npx playwright install chromium }
Step "10. Tests E2E" { npm run test:e2e }

# Resumen
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " RESUMEN" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
$results.GetEnumerator() | ForEach-Object {
    $color = if ($_.Value -eq "OK") { "Green" } else { "Red" }
    Write-Host ("  {0}: {1}" -f $_.Key, $_.Value) -ForegroundColor $color
}
Write-Host ""
