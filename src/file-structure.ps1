# Directory Structure Generator for AI Readability
# This script creates a clean, hierarchical text document of the current directory structure
# Format is optimized for AI processing with consistent indentation and clear labeling

$outputFile = "DirectoryStructure.txt"
$indentChar = "    " # 4 spaces for indentation

function Get-FormattedSize {
    param (
        [long]$SizeInBytes
    )
    
    if ($SizeInBytes -lt 1KB) {
        return "$SizeInBytes B"
    }
    elseif ($SizeInBytes -lt 1MB) {
        return "{0:N2} KB" -f ($SizeInBytes / 1KB)
    }
    elseif ($SizeInBytes -lt 1GB) {
        return "{0:N2} MB" -f ($SizeInBytes / 1MB)
    }
    else {
        return "{0:N2} GB" -f ($SizeInBytes / 1GB)
    }
}

function Get-DirectoryStructure {
    param (
        [string]$Path,
        [int]$Level = 0,
        [System.IO.StreamWriter]$Writer
    )

    $indent = $indentChar * $Level
    
    # Get directory information
    $dirInfo = Get-Item -Path $Path
    $dirName = Split-Path -Path $Path -Leaf
    if ($Level -eq 0) {
        $dirName = Resolve-Path -Path $Path
    }
    
    # Write directory entry
    $Writer.WriteLine("$indent[DIR] $dirName")
    
    # Process all files first (for cleaner organization)
    $files = Get-ChildItem -Path $Path -File | Sort-Object Name
    foreach ($file in $files) {
        $size = Get-FormattedSize -SizeInBytes $file.Length
        $extension = if ($file.Extension) { $file.Extension.ToLower() } else { "no-extension" }
        $Writer.WriteLine("$indent$indentChar[FILE] $($file.Name) | Size: $size | Type: $extension | Modified: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss'))")
    }
    
    # Then process all subdirectories
    $dirs = Get-ChildItem -Path $Path -Directory | Sort-Object Name
    foreach ($dir in $dirs) {
        Get-DirectoryStructure -Path $dir.FullName -Level ($Level + 1) -Writer $Writer
    }
}

try {
    # Create or overwrite the output file
    $writer = New-Object System.IO.StreamWriter $outputFile
    
    # Write header information
    $writer.WriteLine("DIRECTORY STRUCTURE REPORT")
    $writer.WriteLine("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
    $writer.WriteLine("Computer: $env:COMPUTERNAME")
    $writer.WriteLine("Current User: $env:USERNAME")
    $writer.WriteLine("PowerShell Version: $($PSVersionTable.PSVersion)")
    $writer.WriteLine("---------------------------------------------")
    $writer.WriteLine("")
    
    # Get and write the full directory structure
    $currentPath = Get-Location
    Get-DirectoryStructure -Path $currentPath -Writer $writer
    
    # Close the file
    $writer.Close()
    
    Write-Host "Directory structure has been written to: $((Resolve-Path $outputFile).Path)" -ForegroundColor Green
    Write-Host "This file format is optimized for AI readability." -ForegroundColor Green
}
catch {
    Write-Host "An error occurred: $_" -ForegroundColor Red
    if ($writer) {
        $writer.Close()
    }
}