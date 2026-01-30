"use client"

import { useEffect, useState } from 'react'
import { Map, Users, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLocation } from '@/components/features/LocationProvider'

export default function CommunitiesPage() {
    const { coords } = useLocation()
    const [communities, setCommunities] = useState<any[]>([])

    useEffect(() => {
        // In real app, fetch via PostGIS
        // Mocking nearby communities
        const mockCommunities = [
            { id: '1', name: 'Campus Life', description: 'Everything happening on campus', members: 1240, dist: '0.2 mi' },
            { id: '2', name: 'Downtown Eats', description: 'Best food in the city', members: 850, dist: '1.5 mi' },
            { id: '3', name: 'Night Owls', description: 'Late night chats', members: 320, dist: '0.8 mi' }
        ]
        setCommunities(mockCommunities)
    }, [coords])

    return (
        <div className="min-h-screen bg-white pb-20">
            <header className="p-4 border-b sticky top-0 bg-white z-10">
                <h1 className="text-xl font-bold">Local Herds</h1>
            </header>

            <div className="p-4 space-y-4">
                {communities.map(comm => (
                    <div key={comm.id} className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600">
                            <Map size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg">{comm.name}</h3>
                            <p className="text-sm text-gray-500">{comm.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><Users size={12} /> {comm.members} Members</span>
                                <span className="flex items-center gap-1"><MapPin size={12} /> {comm.dist}</span>
                            </div>
                        </div>
                        <button className="bg-cyan-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                            Join
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
