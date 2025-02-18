# Define the output file name (it will be saved in the current directory)
$outputFile = "ProjectStructure.txt"

# Function to recursively list directories and files
function Get-FileStructure {
    param (
        [string]$path,
        [int]$indentLevel = 0
    )

    $indent = " " * $indentLevel * 2
    $items = Get-ChildItem -Path $path

    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            "$indent+ $($item.Name)" | Out-File -FilePath $outputFile -Append
            # Recursively process subdirectories
            Get-FileStructure -path $item.FullName -indentLevel ($indentLevel + 1)
        } else {
            "$indent- $($item.Name)" | Out-File -FilePath $outputFile -Append
        }
    }
}

# Clear the output file if it exists
if (Test-Path $outputFile) {
    Clear-Content $outputFile
}

# Get the current directory (where the script is executed)
$projectPath = Get-Location

# Scan the root directory (non-recursive)
"Root Directory:" | Out-File -FilePath $outputFile -Append
$rootItems = Get-ChildItem -Path $projectPath.Path
foreach ($item in $rootItems) {
    if ($item.PSIsContainer) {
        "+ $($item.Name)" | Out-File -FilePath $outputFile -Append
    } else {
        "- $($item.Name)" | Out-File -FilePath $outputFile -Append
    }
}

# Scan the /src/ directory (recursive)
$srcPath = Join-Path -Path $projectPath.Path -ChildPath "src"
if (Test-Path $srcPath) {
    "`n/src/ Directory (Recursive):" | Out-File -FilePath $outputFile -Append
    Get-FileStructure -path $srcPath -indentLevel 1
} else {
    "`n/src/ Directory not found." | Out-File -FilePath $outputFile -Append
}

Write-Host "File structure saved to $outputFile in the current directory."