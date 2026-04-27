$srcDir = "c:\Users\Admin\OneDrive\Documents\Desktop\DEV CLASH\prompt-to-app-generator\src"
$files = Get-ChildItem -Path $srcDir -Recurse -Filter *.jsx

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace '\\`', '`'
    $newContent = $newContent -replace '\\\${', '${'
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
}
