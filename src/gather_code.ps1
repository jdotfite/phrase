# First, create a function to display the directory structure
function Show-DirStructure {
    param (
        [string]$Path = ".",
        [string]$Indent = "",
        [string]$Output = "directory_structure.txt"
    )
    
    # Get and sort items - directories first, then files
    $items = Get-ChildItem $Path | Sort-Object { $_.PSIsContainer -eq $false }, { $_.Name }
    
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            # It's a directory
            "📁 $Indent$($item.Name)" | Add-Content $Output
            Show-DirStructure -Path $item.FullName -Indent "$Indent  " -Output $Output
        } else {
            # It's a file
            "📄 $Indent$($item.Name)" | Add-Content $Output
        }
    }
}

# Function to concatenate files
function Merge-Files {
    param (
        [string]$Path = ".",
        [string]$OutputFile = "combined_output.txt"
    )
    
    # Clear or create the output file
    "" | Set-Content $OutputFile
    
    # Get all files recursively
    Get-ChildItem -Path $Path -Recurse -File | ForEach-Object {
        # Add file separator comment
        "// File: $($_.FullName)" | Add-Content $OutputFile
        
        # Add a blank line
        "" | Add-Content $OutputFile
        
        # Add the content of the file
        Get-Content $_.FullName | Add-Content $OutputFile
        
        # Add two blank lines between files
        "`n`n" | Add-Content $OutputFile
    }
}

# Execute both functions
$dirStructureFile = "directory_structure.txt"
$mergedContentFile = "combined_output.txt"

# Clear or create the directory structure file
"Directory Structure:" | Set-Content $dirStructureFile
"===================" | Add-Content $dirStructureFile
"" | Add-Content $dirStructureFile

# Generate directory structure
Show-DirStructure -Output $dirStructureFile

# Concatenate all files
Merge-Files -OutputFile $mergedContentFile

Write-Host "Directory structure has been saved to: $dirStructureFile"
Write-Host "Concatenated files have been saved to: $mergedContentFile"