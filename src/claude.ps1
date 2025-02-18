# Get current directory path and script start time
$currentPath = (Get-Location).Path
$startTime = Get-Date
$outputFile = "code_dump_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"

# Add exclusion patterns for folders and files
$excludedPaths = @(
    'node_modules',
    '.git',
    'bin',
    'obj',
    'dist',
    'build',
    '.vscode',
    'packages'
)

# Write initial info to console
Write-Host "Starting analysis of $currentPath"
Write-Host "Excluding folders: $($excludedPaths -join ', ')"

# Initial file header
$envInfo = @"
PROJECT ANALYSIS
Generated: $(Get-Date)
Directory: $currentPath

===========================================
ENVIRONMENT INFORMATION
===========================================
PowerShell Version: $($PSVersionTable.PSVersion)
OS: $(Get-CimInstance -ClassName Win32_OperatingSystem | Select-Object -ExpandProperty Caption)
Computer Name: $env:COMPUTERNAME
"@
Set-Content -Path $outputFile -Value $envInfo -Encoding utf8

Write-Host "Gathering file list..."

# Get all files, excluding problematic paths
$allFiles = Get-ChildItem -Path $currentPath -Recurse -File | Where-Object {
    $fullPath = $_.FullName
    $exclude = $false
    foreach ($path in $excludedPaths) {
        if ($fullPath -like "*\$path\*") {
            $exclude = $true
            break
        }
    }
    -not $exclude -and
    $_.Name -ne $outputFile -and
    -not $_.Name.EndsWith(".tmp")
}

# Process each file
"`n============================================================`n" | Out-File $outputFile -Append -Encoding utf8
"FILE CONTENTS:" | Out-File $outputFile -Append -Encoding utf8

$fileCounter = 0
$totalFiles = $allFiles.Count

# Avoid division by zero
if ($totalFiles -eq 0) {
    Write-Host "No files found to process. Exiting."
    exit
}

$allFiles | Where-Object {
    $_.Extension -notmatch '\.(exe|dll|pdb|obj|bin|cache|jpg|jpeg|png|gif|bmp|ico|mp3|mp4|zip|rar|7z)$' -and
    $_.Length -lt 5MB
} | ForEach-Object {
    $fileCounter++
    $percentComplete = [math]::Round(($fileCounter / $totalFiles) * 100, 1)
    Write-Progress -Activity "Processing Files" -Status "$fileCounter of $totalFiles ($percentComplete%)" -PercentComplete $percentComplete
    Write-Host "Processing ($fileCounter/$totalFiles): $($_.Name)"

    try {
        # Write file metadata
        $relPath = $_.FullName.Replace($currentPath, ".")
        $fileSize = [math]::Round($_.Length / 1KB, 2)
        
        "`n============================================================`n" | Out-File $outputFile -Append -Encoding utf8
        "FILE: $relPath`nSIZE: $fileSize KB`nLAST MODIFIED: $($_.LastWriteTime)`n" | Out-File $outputFile -Append -Encoding utf8
        
        # Append file content
        Get-Content $_.FullName -Raw | Out-File $outputFile -Append -Encoding utf8
    } catch {
        Write-Warning "Error processing $($_.FullName): $_"
    }
}

Write-Host "Analysis complete. Output saved to $outputFile"
