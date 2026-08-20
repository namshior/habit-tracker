$nodePath = "C:\Program Files\nodejs"
$env:PATH = "$nodePath;$env:PATH"
& "$nodePath\npx.cmd" prisma db push
