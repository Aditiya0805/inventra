<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page {
            margin: 26px 28px 34px 28px;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: "DejaVu Sans", sans-serif;
            color: #1e293b;
            font-size: 9px;
            line-height: 1.35;
            margin: 0;
        }

        .header {
            width: 100%;
            border-bottom: 2px solid #0f766e;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .header-table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: middle;
        }

        .brand-mark {
            width: 44px;
            height: 44px;
            border-radius: 8px;
            background: #0f766e;
            color: #ffffff;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            line-height: 44px;
        }

        .school-name {
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: .2px;
        }

        .school-meta {
            font-size: 8px;
            color: #64748b;
            margin-top: 2px;
        }

        .doc-label {
            text-align: right;
            font-size: 8px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .doc-title {
            text-align: right;
            font-size: 13px;
            font-weight: bold;
            color: #0f766e;
            margin-top: 3px;
        }

        .info-bar {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }

        .info-bar td {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 5px 7px;
            font-size: 8px;
            color: #475569;
        }

        .info-bar .label {
            color: #94a3b8;
            font-size: 7px;
            text-transform: uppercase;
            letter-spacing: .5px;
        }

        .info-bar .value {
            color: #334155;
            font-weight: bold;
            font-size: 8.5px;
            margin-top: 1px;
        }

        table.report {
            width: 100%;
            border-collapse: collapse;
            margin-top: 4px;
        }

        table.report thead th {
            background: #0f766e;
            color: #ffffff;
            font-size: 8px;
            text-align: left;
            padding: 7px 6px;
            border: 1px solid #0d5f59;
            text-transform: uppercase;
            letter-spacing: .3px;
        }

        table.report tbody td {
            border: 1px solid #e2e8f0;
            padding: 5px 6px;
            font-size: 8.5px;
            color: #334155;
            vertical-align: top;
        }

        table.report tbody tr:nth-child(even) td {
            background: #f8fafc;
        }

        table.report tbody td.num {
            text-align: right;
            white-space: nowrap;
        }

        table.report tbody td.center {
            text-align: center;
        }

        .empty {
            border: 1px dashed #cbd5e1;
            padding: 24px;
            text-align: center;
            color: #94a3b8;
            font-size: 9px;
            margin-top: 8px;
        }

        .signatures {
            width: 100%;
            border-collapse: collapse;
            margin-top: 24px;
        }

        .signatures td {
            width: 50%;
            vertical-align: top;
            font-size: 8.5px;
            color: #475569;
        }

        .signatures .space {
            height: 48px;
        }

        .signatures .name {
            font-weight: bold;
            color: #1e293b;
            border-top: 1px solid #94a3b8;
            padding-top: 3px;
            display: inline-block;
            min-width: 150px;
        }

        .footer {
            position: fixed;
            bottom: -18px;
            left: 0;
            right: 0;
            border-top: 1px solid #e2e8f0;
            padding-top: 4px;
            font-size: 7px;
            color: #94a3b8;
        }

        .footer-right {
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <table class="header-table">
            <tr>
                <td style="width: 48px;">
                    <div class="brand-mark">I</div>
                </td>
                <td>
                    <div class="school-name">{{ $schoolName }}</div>
                    <div class="school-meta">{{ $address }}</div>
                </td>
                <td>
                    <div class="doc-label">Inventra · Laporan</div>
                    <div class="doc-title">{{ $title }}</div>
                </td>
            </tr>
        </table>
    </div>

    <table class="info-bar">
        <tr>
            <td style="width: 30%;">
                <div class="label">Periode</div>
                <div class="value">
                    {{ \Illuminate\Support\Carbon::parse($filters['from'])->format('d/m/Y') }}
                    &ndash;
                    {{ \Illuminate\Support\Carbon::parse($filters['to'])->format('d/m/Y') }}
                </div>
            </td>
            <td style="width: 22%;">
                <div class="label">Jenis laporan</div>
                <div class="value">
                    {{ ['inventaris' => 'Inventaris Aset', 'kerusakan' => 'Kerusakan & Biaya', 'pemanfaatan' => 'Pemanfaatan'][$filters['type']] ?? $filters['type'] }}
                </div>
            </td>
            <td style="width: 28%;">
                <div class="label">Filter</div>
                <div class="value">
                    @php
                        $labels = [];
                        if (!empty($filters['room_id'])) {
                            $labels[] = 'Ruangan: '.(optional(\App\Models\Room::find($filters['room_id']))->name ?? '#'.$filters['room_id']);
                        }
                        if (!empty($filters['category_id'])) {
                            $labels[] = 'Kategori: '.(optional(\App\Models\AssetCategory::find($filters['category_id']))->name ?? '#'.$filters['category_id']);
                        }
                        if (!empty($filters['building_id'])) {
                            $labels[] = 'Gedung: '.(optional(\App\Models\Building::find($filters['building_id']))->name ?? '#'.$filters['building_id']);
                        }
                    @endphp
                    {{ count($labels) ? implode(' · ', $labels) : 'Semua data' }}
                </div>
            </td>
            <td style="width: 20%;">
                <div class="label">Dicetak</div>
                <div class="value">{{ now()->format('d/m/Y H:i') }}</div>
            </td>
        </tr>
    </table>

    @if (count($rows) === 0)
        <div class="empty">Tidak ada data yang sesuai dengan filter laporan ini.</div>
    @else
        <table class="report">
            <thead>
                <tr>
                    @foreach ($headers as $header)
                        <th>{{ $header }}</th>
                    @endforeach
                </tr>
            </thead>
            <tbody>
                @foreach ($rows as $row)
                    <tr>
                        @foreach ($headers as $index => $header)
                            @php
                                $value = $row[$index] ?? null;
                                if (str_contains($header, 'Rp') && is_numeric($value)) {
                                    $value = number_format((float) $value, 0, ',', '.');
                                }
                            @endphp
                            <td class="{{ str_contains($header, 'Rp') ? 'num' : (in_array($header, ['Total Unit', 'Baik', 'Rusak', 'Perbaikan', 'Hilang', 'Jumlah Pemesanan', 'Disetujui', 'Jam Pemakaian']) ? 'center' : '') }}">
                                {{ $value === null || $value === '' ? '—' : $value }}
                            </td>
                        @endforeach
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <table class="signatures">
        <tr>
            <td>
                <div>Mengetahui,</div>
                <div>Kepala Sekolah</div>
                <div class="space"></div>
                <span class="name">{{ $headmaster ?: '.................................' }}</span>
            </td>
            <td style="text-align: right;">
                <div>Nusantara, {{ now()->format('d F Y') }}</div>
                <div>Admin Sarana Prasarana</div>
                <div class="space"></div>
                <span class="name">{{ auth()->user()?->name ?? '.................................' }}</span>
            </td>
        </tr>
    </table>

    <div class="footer">
        <span>Inventra — Sistem Monitoring Aset &amp; Fasilitas Sekolah</span>
        <span class="footer-right">Dokumen dibuat otomatis oleh sistem</span>
    </div>
</body>
</html>
