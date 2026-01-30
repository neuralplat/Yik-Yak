"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/features/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { generateYakkerId } from '@/lib/name-generator'

export default function MePage() {
    const { user, signOut } = useAuth()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadProfile() {
            if (!user) return

            // Try to get profile
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()

            if (!data && !error) {
                // Create profile if missing (simple client-side logic for demo)
                const newId = generateYakkerId()
                const { data: newProfile, error: insertError } = await supabase
                    .from('profiles')
                    .insert({ id: user.id, yakker_id: newId } as any)
                    .select()
                    .single()

                if (newProfile) data = newProfile
            }

            setProfile(data)
            setLoading(false)
        }

        loadProfile()
    }, [user])

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your secret identity...</div>

    return (
        <div className="p-4 space-y-6 pb-20">
            <header className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-black">My Yak Profile</h1>
                <button
                    onClick={() => signOut()}
                    className="text-sm text-red-500 font-medium hover:underline"
                >
                    Sign Out
                </button>
            </header>

            <div className="bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl p-6 text-white shadow-lg">
                <div className="text-sm opacity-80 mb-1">Your Yakker ID (Public)</div>
                <div className="text-3xl font-bold">{profile?.yakker_id || 'Generating...'}</div>

                <div className="mt-6 flex gap-8">
                    <div>
                        <div className="text-2xl font-bold">{profile?.karma || 0}</div>
                        <div className="text-xs opacity-75">Yak Karma</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-xs opacity-75">My Posts</div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-black">Menu</h2>
                <div className="space-y-2">
                    <button
                        onClick={() => window.location.href = '/business'}
                        className="w-full p-4 bg-white border shadow-sm rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                        <span className="font-medium text-gray-700">Business Dashboard</span>
                    </button>
                    <button
                        onClick={() => window.location.href = '/mod'}
                        className="w-full p-4 bg-white border shadow-sm rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                        <span className="font-medium text-gray-700">Moderation Queue</span>
                    </button>
                </div>

                <h2 className="text-lg font-semibold text-black">Settings</h2>
                <div className="space-y-2">
                    <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
                        <span>Notifications</span>
                        <div className="w-10 h-6 bg-cyan-200 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
