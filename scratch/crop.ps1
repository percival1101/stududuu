Add-Type -AssemblyName System.Drawing

$imgPath = "d:\Demo Game ig\intern\stududu-test2\frontend\public\stududu-logo-user.png"
$img = [System.Drawing.Bitmap]::FromFile($imgPath)

# 1. Crop Icon (Globe + S)
$rectIcon = New-Object System.Drawing.Rectangle(60, 30, 195, 195)
$cropIcon = $img.Clone($rectIcon, $img.PixelFormat)
$cropIcon.Save("d:\Demo Game ig\intern\stududu-test2\frontend\public\stududu-icon-crop.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 2. Crop Text (stududu + tagline)
$rectText = New-Object System.Drawing.Rectangle(260, 40, 470, 155)
$cropText = $img.Clone($rectText, $img.PixelFormat)
$cropText.Save("d:\Demo Game ig\intern\stududu-test2\frontend\public\stududu-text-crop.png", [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$cropIcon.Dispose()
$cropText.Dispose()

Write-Host "Successfully cropped icon and text images with corrected bounds!"
