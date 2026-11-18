<?php

namespace App\Http\Controllers;

use App\Models\Building;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BuildingController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:buildings,code'],
            'name' => ['required', 'string', 'max:120'],
            'floors_count' => ['required', 'integer', 'min:1', 'max:20'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $building = Building::create($data);
        AuditLogger::log('created', 'gedung', $building->id, "Menambahkan gedung {$building->name}");

        return back()->with('success', 'Gedung berhasil ditambahkan.');
    }

    public function update(Request $request, Building $building): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:30', Rule::unique('buildings', 'code')->ignore($building->id)],
            'name' => ['required', 'string', 'max:120'],
            'floors_count' => ['required', 'integer', 'min:1', 'max:20'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $building->update($data);
        AuditLogger::log('updated', 'gedung', $building->id, "Memperbarui gedung {$building->name}", null, $data);

        return back()->with('success', 'Gedung berhasil diperbarui.');
    }

    public function destroy(Building $building): RedirectResponse
    {
        if ($building->rooms()->exists()) {
            return back()->with('error', 'Gedung masih memiliki ruangan. Hapus atau pindahkan ruangan terlebih dahulu.');
        }

        $name = $building->name;
        $building->delete();
        AuditLogger::log('deleted', 'gedung', $building->id, "Menghapus gedung {$name}");

        return back()->with('success', 'Gedung berhasil dihapus.');
    }
}
