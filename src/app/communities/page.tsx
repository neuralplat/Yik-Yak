"use client"

import { useEffect, useState } from 'react'
import { Map, Users, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLocation } from '@/components/features/LocationProvider'

export default function CommunitiesPage() {
    const { coords } = useLocation()
    const [communities, setCommunities] = useState<any[]>([])

    useEffect(() => {
        async function loadCommunities() {
            // In a real app we would use PostGIS radius query
            // const { data } = await supabase.rpc('get_nearby_communities', { lat, long, rad })
            const { data } = await supabase.from('communities').select('*').limit(20)

            if (data) {
                setCommunities(data.map((c: any) => ({
                    ...c,
                    members: Math.floor(Math.random() * 500) + 10, // Mock members count for now as no join table yet
                    dist: 'Nearby' // Mock distance
                })))
            }
        }
        loadCommunities()
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
