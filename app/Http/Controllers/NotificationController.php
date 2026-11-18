<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $notifications = $request->user()->notifications()
            ->latest()
            ->paginate(20)
            ->through(fn ($notification) => [
                'id' => $notification->id,
                'type' => $notification->type,
                'title' => $notification->title,
                'message' => $notification->message,
                'url' => $notification->url,
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at,
            ]);

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unread' => $request->user()->notifications()->whereNull('read_at')->count(),
        ]);
    }

    public function read(Request $request, int $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->update(['read_at' => now()]);

        return $notification->url
            ? redirect($notification->url)
            : back();
    }

    public function readAll(Request $request): RedirectResponse
    {
        $request->user()->notifications()->whereNull('read_at')->update(['read_at' => now()]);

        return back()->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }
}
