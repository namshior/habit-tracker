$nodePath = "C:\Program Files\nodejs"
$env:PATH = "$nodePath;$env:PATH"
& "$nodePath\npm.cmd" run dev
