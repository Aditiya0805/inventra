<?php

namespace App\Http\Controllers;

use App\Models\AssetCategory;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AssetCategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $category = AssetCategory::create($data);
        AuditLogger::log('created', 'kategori_aset', $category->id, "Menambahkan kategori {$category->name}");

        return back()->with('success', 'Kategori aset berhasil ditambahkan.');
    }

    public function update(Request $request, AssetCategory $category): RedirectResponse
    {
        $data = $this->validated($request, $category);
        $old = $category->only(['name', 'group', 'tracking_type', 'min_stock']);
        $category->update($data);
        AuditLogger::log('updated', 'kategori_aset', $category->id, "Memperbarui kategori {$category->name}", $old, $data);

        return back()->with('success', 'Kategori aset berhasil diperbarui.');
    }

    public function destroy(AssetCategory $category): RedirectResponse
    {
        if ($category->assets()->exists()) {
            return back()->with('error', 'Kategori masih digunakan oleh aset. Pindahkan aset ke kategori lain terlebih dahulu.');
        }

        $name = $category->name;
        $category->delete();
        AuditLogger::log('deleted', 'kategori_aset', $category->id, "Menghapus kategori {$name}");

        return back()->with('success', 'Kategori aset berhasil dihapus.');
    }

    private function validated(Request $request, ?AssetCategory $category = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'group' => ['required', Rule::in(array_keys(AssetCategory::GROUPS))],
            'tracking_type' => ['required', Rule::in(array_keys(AssetCategory::TRACKING_TYPES))],
            'icon' => ['nullable', 'string', 'max:40'],
            'color' => ['nullable', 'string', 'max:20'],
            'min_stock' => ['nullable', 'integer', 'min:0', 'max:100000'],
        ]);

        $slug = Str::slug($data['name']);
        $exists = AssetCategory::where('slug', $slug)->where('id', '!=', $category?->id)->exists();
        $data['slug'] = $exists ? $slug.'-'.Str::lower(Str::random(4)) : $slug;
        $data['icon'] = $data['icon'] ?? 'box';
        $data['color'] = $data['color'] ?? 'emerald';

        return $data;
    }
}
