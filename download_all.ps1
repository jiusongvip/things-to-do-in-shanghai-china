$base = 'D:\workspaces\website\things-to-do-in-shanghai-china\public\images'

$copies = @{
    'picsum-6-2hme.webp' = 'picsum-1-25g4.webp'
    'picsum-7-2k1o.webp' = 'picsum-2-27w6.webp'
    'picsum-8-2mhg.webp' = 'picsum-3-2acj.webp'
    'picsum-10-2reh.webp' = 'picsum-5-2f7b.webp'
    'picsum-14-317a.webp' = 'picsum-4-2crw.webp'
    'picsum-30-44a4.webp' = 'picsum-13-2yp7.webp'
    'picsum-39-4q42.webp' = 'picsum-9-2oxj.webp'
    'picsum-47-59lg.webp' = 'picsum-1-25g4.webp'
    'picsum-49-5efn.webp' = 'picsum-3-2acj.webp'
    'og-default.jpg' = 'picsum-0-22lh.webp'
}

$photos = @{
    'picsum-9-2oxj.webp' = '1545585496-21e99e8a8e22'
    'picsum-11-2tub.webp' = '1576097945899-b3df2f250bb8'
    'picsum-12-2w9m.webp' = '1464818569-7ba214cacc12'
    'picsum-13-2yp7.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-15-33mb.webp' = '1496116215-a48e3c0f8f8c'
    'picsum-16-3641.webp' = '1559738568-8c5625260f00'
    'picsum-17-38k2.webp' = '1547592180-85f173990554'
    'picsum-18-3b1x.webp' = '1574484284002-952d92456975'
    'picsum-19-3dgy.webp' = '1514937942384-cd0587869101'
    'picsum-20-3fxn.webp' = '1470337458703-bb34a335c2cd'
    'picsum-21-3ic9.webp' = '1485875431675-45e5e66f3a9a'
    'picsum-22-3ks1.webp' = '1566417714-de2527d79470'
    'picsum-23-3n7h.webp' = '1537210248-8e89529ae084'
    'picsum-24-3pmk.webp' = '1551024739-f1b95a12abce'
    'picsum-25-3s0g.webp' = '142996271442-b29dd2f0e38a'
    'picsum-26-3ugd.webp' = '1517248135467-4c7edcad34c4'
    'picsum-27-3wvj.webp' = '1555639206-418e4c13595c'
    'picsum-28-3zb0.webp' = '1441986300917-64674bd600d8'
    'picsum-29-41sr.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-31-46pl.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-32-493k.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-33-4bkl.webp' = '1545561516-aa7d01e7ae58'
    'picsum-34-4dzg.webp' = '1547981609-4b6bfe67ca0b'
    'picsum-35-4gfp.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-36-4iud.webp' = '1547981609-4b6bfe67ca0b'
    'picsum-37-4l9j.webp' = '1506905925-b001b90f3e52'
    'picsum-38-4noz.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-40-4sj7.webp' = '1560803650-2ae1db49ff75'
    'picsum-41-4uxl.webp' = '1544717299-d623e7c9d14c'
    'picsum-42-4xdo.webp' = '1501854147-74f3783f77be'
    'picsum-43-4zso.webp' = '1534567153-2ad3a4b8cc85'
    'picsum-44-52bl.webp' = '1532094349-22ba3a785e62'
    'picsum-45-54pc.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-46-574z.webp' = '1467632492-06b73f6d88b7'
    'picsum-48-5c1p.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-50-5gtz.webp' = '1414235077428-338989a2e8c0'
    'picsum-51-5j9p.webp' = '1547981609-4b6bfe67ca0b'
    'picsum-52-5lor.webp' = '1558618661-3c7b0b8b38e6'
    'picsum-53-5o4i.webp' = '1537210248-8e89529ae084'
    'picsum-54-5qjq.webp' = '1522383221-75f6f1bc52b3'
    'picsum-55-5tfg.webp' = '1514937942384-cd0587869101'
    'picsum-56-5w0l.webp' = '1541696490-8744a7d5757c'
    'picsum-57-5yet.webp' = '1537534495-e8e8bdd548f3'
    'picsum-58-60v7.webp' = '1545561516-aa7d01e7ae58'
}

Write-Host "=== Copying duplicates ==="
foreach ($c in $copies.GetEnumerator()) {
    $src = Join-Path $base $c.Value
    $dst = Join-Path $base $c.Key
    if (Test-Path $src) { Copy-Item $src $dst -Force; Write-Host "COPY: $($c.Key)" }
}

Write-Host "`n=== Downloading ==="
$d = 0; $f = 0; $s = 0
foreach ($p in $photos.GetEnumerator()) {
    $out = Join-Path $base $p.Key
    if ((Test-Path $out) -and (Get-Item $out).Length -gt 1000) { $s++; continue }
    try {
        curl -s -L -o $out "https://images.unsplash.com/photo-$($p.Value)?w=1200&h=800&fit=crop&q=80&fm=webp"
        if ((Get-Item $out).Length -gt 1000) { $d++; Write-Host "OK: $($p.Key)" }
        else { $f++; Write-Host "FAIL: $($p.Key)" }
    } catch { $f++; Write-Host "ERR: $($p.Key)" }
}
Write-Host "`nDone: $d ok, $f fail, $s skipped"
