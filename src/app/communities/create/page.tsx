"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/components/features/AuthProvider'
import { useLocation } from '@/components/features/LocationProvider'
import { Map, MapPin } from 'lucide-react'

export default function CreateCommunityPage() {
    const { user } = useAuth()
    const { coords } = useLocation()
    const router = useRouter()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [radius, setRadius] = useState(5) // Default 5km
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim()) return alert("Name is required")
        if (!user) return alert("Login required")
        if (!coords) return alert("Location required")

        setLoading(true)

        // Ensure profile exists
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
        if (!profile) {
            // Quick profile fix if missing (should be handled by AuthProvider but safe to have)
            await supabase.from('profiles').insert({ id: user.id, yakker_id: Math.random().toString(36).substring(7) } as any)
        }

        const { data, error } = await supabase.from('communities').insert({
            name,
            description,
            creator_id: user.id,
            location: `POINT(${coords.longitude} ${coords.latitude})`,
            radius_meters: radius * 1000 // Convert km to meters
        } as any).select().single() as any

        if (error) {
            alert("Failed to create herd: " + error.message)
            setLoading(false)
        } else {
            // Auto-join the creator
            if (data) {
                await supabase.from('community_members').insert({
                    community_id: data.id,
                    user_id: user.id,
                    role: 'admin'
                } as any)
            }
            alert("Herd created!")
            router.push('/communities')
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <header className="p-4 border-b bg-white flex items-center gap-4">
                <button onClick={() => router.back()} className="text-gray-500">Cancel</button>
                <h1 className="text-xl font-bold flex-1 text-center pr-12">New Herd</h1>
            </header>

            <div className="max-w-md mx-auto p-6 space-y-6">
                <div className="flex flex-col items-center mb-8 text-cyan-500">
                    <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mb-2">
                        <Map size={40} />
                    </div>
                    <p className="text-sm text-gray-400 text-center">Create a local space for your campus or neighborhood.</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Herd Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Downtown Foodies"
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 ring-cyan-500 outline-none"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="What's this herd about?"
                            className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 ring-cyan-500 outline-none h-24 resize-none"
                            maxLength={200}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-bold text-gray-700">Range</label>
                            <span className="text-sm font-bold text-cyan-600">{radius} km</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="15"
                            value={radius}
                            onChange={e => setRadius(parseInt(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1 km</span>
                            <span>15 km</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Only people within this range can see and join this herd.
                        </p>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={loading || !name.trim()}
                        className="w-full bg-cyan-500 text-white py-3 rounded-xl font-bold text-lg shadow-md hover:bg-cyan-600 disabled:opacity-50 transition-all mt-4"
                    >
                        {loading ? 'Creating...' : 'Create Herd'}
                    </button>

                    {coords && (
                        <div className="flex items-center justify-center gap-1 text-xs text-gray-400 bg-gray-50 py-2 rounded-lg">
                            <MapPin size={12} /> Location locked to: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
