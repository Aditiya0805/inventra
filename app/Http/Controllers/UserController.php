<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:120', 'unique:users,email'],
            'role' => ['required', Rule::in(array_keys(User::ROLES))],
            'phone' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'is_active' => ['boolean'],
        ]);

        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);

        AuditLogger::log('created', 'pengguna', $user->id, "Menambahkan pengguna {$user->name} dengan peran {$user->roleLabel()}");

        return back()->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:120', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in(array_keys(User::ROLES))],
            'phone' => ['nullable', 'string', 'max:30'],
            'job_title' => ['nullable', 'string', 'max:100'],
            'password' => ['nullable', 'confirmed', Password::min(8)],
            'is_active' => ['boolean'],
        ]);

        if ($user->isSuperAdmin() && $data['role'] !== 'super_admin') {
            $otherAdmins = User::where('role', 'super_admin')->where('id', '!=', $user->id)->where('is_active', true)->count();
            if ($otherAdmins === 0) {
                return back()->with('error', 'Tidak dapat mengubah peran Super Admin terakhir.');
            }
        }

        if (empty($data['password'])) {
            unset($data['password']);
        } else {
            $data['password'] = Hash::make($data['password']);
        }

        $old = $user->only(['name', 'email', 'role', 'is_active']);
        $user->update($data);

        AuditLogger::log('updated', 'pengguna', $user->id, "Memperbarui pengguna {$user->name}", $old, $user->only(['name', 'email', 'role', 'is_active']));

        return back()->with('success', 'Data pengguna berhasil diperbarui.');
    }

    public function toggle(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun sendiri.');
        }

        if ($user->isSuperAdmin() && $user->is_active) {
            $otherAdmins = User::where('role', 'super_admin')->where('id', '!=', $user->id)->where('is_active', true)->count();
            if ($otherAdmins === 0) {
                return back()->with('error', 'Tidak dapat menonaktifkan Super Admin terakhir.');
            }
        }

        $user->update(['is_active' => ! $user->is_active]);
        AuditLogger::log('status', 'pengguna', $user->id, ($user->is_active ? 'Mengaktifkan' : 'Menonaktifkan')." pengguna {$user->name}");

        return back()->with('success', $user->is_active ? 'Pengguna diaktifkan.' : 'Pengguna dinonaktifkan.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $name = $user->name;
        $user->delete();
        AuditLogger::log('deleted', 'pengguna', $user->id, "Menghapus pengguna {$name}");

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }
}
