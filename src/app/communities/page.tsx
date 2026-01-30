"use client"

import { useEffect, useState } from 'react'
import { Map, Users, MapPin, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLocation } from '@/components/features/LocationProvider'
import { useAuth } from '@/components/features/AuthProvider'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function CommunitiesPage() {
    const { coords } = useLocation()
    const { user } = useAuth()
    const router = useRouter()

    const [communities, setCommunities] = useState<any[]>([])
    const [myMemberships, setMyMemberships] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (coords) {
            loadCommunities()
        }
        if (user) {
            loadMemberships()
        }
    }, [coords, user])

    async function loadMemberships() {
        if (!user) return
        const { data } = await supabase.from('community_members').select('community_id').eq('user_id', user.id)
        if (data) {
            setMyMemberships(new Set(data.map((m: any) => m.community_id)))
        }
    }

    async function loadCommunities() {
        // In a real app we would use PostGIS radius query:
        // .rpc('nearby_communities', { lat, long })
        // For now, fetching recent ones
        const { data } = await supabase.from('communities').select('*').order('created_at', { ascending: false }).limit(20)

        if (data) {
            const enriched = await Promise.all(data.map(async (c: any) => {
                // Get member count
                const { count } = await supabase.from('community_members').select('*', { count: 'exact', head: true }).eq('community_id', c.id)
                return {
                    ...c,
                    membersCount: count || 0,
                    dist: 'Nearby' // Mock distance for now
                }
            }))
            setCommunities(enriched)
        }
    }

    const handleJoin = async (communityId: string) => {
        if (!user) return alert("Login to join")

        if (myMemberships.has(communityId)) {
            // Leave (Optional feature, but let's just toggle for now or do nothing)
            return
        }

        // Optimistic update
        setMyMemberships(prev => new Set(prev).add(communityId))

        const { error } = await supabase.from('community_members').insert({
            community_id: communityId,
            user_id: user.id
        } as any)

        if (error) {
            alert("Failed to join")
            setMyMemberships(prev => {
                const newSet = new Set(prev)
                newSet.delete(communityId)
                return newSet
            })
        }
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <header className="p-4 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                <h1 className="text-xl font-bold">Local Herds</h1>
                <button
                    onClick={() => router.push('/communities/create')}
                    className="bg-cyan-500 text-white p-2 rounded-full shadow-sm hover:bg-cyan-600 transition-colors"
                >
                    <Plus size={20} />
                </button>
            </header>

            <div className="p-4 space-y-4">
                {communities.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p>No herds nearby.</p>
                        <p className="text-sm">Start the first one!</p>
                    </div>
                )}

                {communities.map(comm => {
                    const isMember = myMemberships.has(comm.id)
                    return (
                        <div
                            key={comm.id}
                            onClick={() => router.push(`/communities/${comm.id}`)}
                            className="flex items-center gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                        >
                            <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 shrink-0">
                                <Map size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg truncate">{comm.name}</h3>
                                {comm.description && <p className="text-sm text-gray-500 truncate">{comm.description}</p>}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><Users size={12} /> {comm.membersCount} Members</span>
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {Math.round(comm.radius_meters / 1000)}km Radius</span>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleJoin(comm.id)
                                }}
                                disabled={isMember}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-all",
                                    isMember ? "bg-gray-100 text-gray-400" : "bg-cyan-500 text-white hover:bg-cyan-600"
                                )}
                            >
                                {isMember ? 'Joined' : 'Join'}
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
