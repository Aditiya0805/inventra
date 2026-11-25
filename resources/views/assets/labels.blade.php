<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Label Aset · Inventra</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 24px; color: #0f172a; background: #f1f5f9; }
        .toolbar { max-width: 1100px; margin: 0 auto 18px; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
        .toolbar h1 { font-size: 18px; margin: 0; }
        .toolbar p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
        .btn { background: #0f766e; color: white; border: 0; padding: 10px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; }
        .sheet { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .label { background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; display: flex; gap: 12px; align-items: center; page-break-inside: avoid; }
        .label img { width: 82px; height: 82px; flex: 0 0 82px; }
        .label .meta { min-width: 0; }
        .label .brand { font-size: 9px; letter-spacing: .12em; text-transform: uppercase; color: #0f766e; font-weight: 700; }
        .label .name { font-size: 13px; font-weight: 700; margin: 2px 0; line-height: 1.25; }
        .label .code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; display: inline-block; }
        .label .room { font-size: 10px; color: #64748b; margin-top: 4px; }
        @media print {
            body { background: white; padding: 0; }
            .toolbar { display: none; }
            .sheet { max-width: none; grid-template-columns: repeat(3, 1fr); gap: 8px; }
            .label { border: 1px dashed #94a3b8; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <div>
            <h1>Label QR Aset</h1>
            <p>{{ $schoolName }} · {{ $assets->count() }} label</p>
        </div>
        <button class="btn" onclick="window.print()">Cetak Label</button>
    </div>

    <div class="sheet">
        @forelse ($assets as $asset)
            <div class="label">
                <img src="{{ route('assets.qr', $asset) }}" alt="QR {{ $asset->code }}">
                <div class="meta">
                    <div class="brand">MAM Balam · {{ $asset->category?->name }}</div>
                    <div class="name">{{ $asset->name }}</div>
                    <div class="code">{{ $asset->code }}</div>
                    <div class="room">{{ $asset->room?->name ?? 'Tanpa ruangan' }}@if($asset->room?->building) · {{ $asset->room->building->name }}@endif</div>
                </div>
            </div>
        @empty
            <p>Tidak ada aset untuk dicetak.</p>
        @endforelse
    </div>
</body>
</html>
