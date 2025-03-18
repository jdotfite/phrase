# PowerShell script to combine all files into a single text document
# This script will scan the current directory and all subdirectories

# Define the output file path
$outputFile = ".\CombinedFiles.txt"

# Clear the output file if it already exists
if (Test-Path $outputFile) {
    Remove-Item $outputFile -Force
}

# Get all files recursively from the current directory
$files = Get-ChildItem -Path .\ -Recurse -File

# Initialize counter for processed files
$processedCount = 0
$totalFiles = $files.Count

Write-Host "Found $totalFiles files to process..."

# Process each file
foreach ($file in $files) {
    try {
        # Add file header to the combined file
        $separator = "=" * 80
        $fileHeader = "`n$separator`nFILE: $($file.FullName)`n$separator`n"
        Add-Content -Path $outputFile -Value $fileHeader

        # Try to read the file as text and add its content
        $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
        if ($null -ne $content) {
            Add-Content -Path $outputFile -Value $content -ErrorAction SilentlyContinue
        }
        else {
            Add-Content -Path $outputFile -Value "[Binary file or empty file]"
        }
        
        # Update counter and show progress
        $processedCount++
        if ($processedCount % 10 -eq 0) {
            Write-Host "Processed $processedCount of $totalFiles files..."
        }
    }
    catch {
        # Log errors for problematic files
        Add-Content -Path $outputFile -Value "[Error reading file: $($_.Exception.Message)]"
        Write-Host "Error processing $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Completed! All $processedCount files have been combined into $outputFile" -ForegroundColor Green