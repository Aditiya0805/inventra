<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LoginController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $key = Str::lower($credentials['email']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);

            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan masuk. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($key, 60);

            throw ValidationException::withMessages([
                'email' => 'Email atau kata sandi tidak cocok dengan data kami.',
            ]);
        }

        $user = User::find(Auth::id());

        if (! $user->is_active) {
            Auth::logout();

            throw ValidationException::withMessages([
                'email' => 'Akun Anda dinonaktifkan. Hubungi administrator sekolah.',
            ]);
        }

        $request->session()->regenerate();
        RateLimiter::clear($key);
        $user->forceFill(['last_login_at' => now()])->save();
        AuditLogger::log('login', 'pengguna', $user->id, "{$user->name} masuk ke aplikasi");

        return redirect()->intended(route('dashboard'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        if ($request->user()) {
            AuditLogger::log('logout', 'pengguna', $request->user()->id, "{$request->user()->name} keluar dari aplikasi");
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
