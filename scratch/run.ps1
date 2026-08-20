$nodePath = "C:\Program Files\nodejs"
$env:PATH = "$nodePath;$env:PATH"
[System.Environment]::SetEnvironmentVariable("PATH", "$nodePath;" + [System.Environment]::GetEnvironmentVariable("PATH", "User"), "User")
& "$nodePath\npm.cmd" install
