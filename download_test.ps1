# Shanghai Unsplash Photo Download Script
$ErrorActionPreference = 'Stop'
$base = 'D:\workspaces\website\things-to-do-in-shanghai-china\public\images'

# Dictionary: filename -> Unsplash photo ID (well-known Shanghai photos)
$photos = @{
    # INDEX PAGE - Hero & Top Picks
    'picsum-0-22lh.webp' = '1547981609-4b6bfe67ca0b'  # Shanghai Pudong skyline at dusk
    'picsum-1-25g4.webp' = '1548912233-eb79eec1c1fd'  # The Bund waterfront
    'picsum-2-27w6.webp' = '1577948000111-7aa02a7b29ab'  # Shanghai Tower
    'picsum-3-2acj.webp' = '1551882547-ff40c63fe5fa'  # Yu Garden
    'picsum-4-2crw.webp' = '1541696490-8744a7d5757c'   # Chinese soup dumplings
    'picsum-5-2f7b.webp' = '1507004111950-66e11c64296b'  # French Concession plane trees
}

Write-Host "Downloading $($photos.Count) photos from Unsplash..."
$done = 0; $fail = 0
foreach ($kv in $photos.GetEnumerator()) {
    $url = "https://images.unsplash.com/photo-$($kv.Value)?w=1200&h=800&fit=crop&q=80&fm=webp"
    $out = Join-Path $base $kv.Key
    try {
        curl -s -L -o "$out" "$url"
        $done++
        Write-Host "OK: $($kv.Key) <- $($kv.Value)"
    } catch {
        $fail++
        Write-Host "FAIL: $($kv.Key) <- $($kv.Value)"
    }
}
Write-Host "Done: $done downloaded, $fail failed"
