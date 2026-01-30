"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '@/components/features/AuthProvider'

export default function CommunitySettingsPage() {
    const { id } = useParams()
    const communityId = id as string
    const router = useRouter()
    const { user } = useAuth()

    const [community, setCommunity] = useState<any>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [radius, setRadius] = useState(5000)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && communityId) loadCommunity()
    }, [user, communityId])

    async function loadCommunity() {
        const { data } = await supabase.from('communities').select('*').eq('id', communityId).single()
        if (data) {
            const com = data as any
            // Security check
            if (com.creator_id !== user?.id) {
                alert("Only the Herd Creator can edit settings.")
                router.push(`/communities/${communityId}`)
                return
            }
            setCommunity(com)
            setName(com.name)
            setDescription(com.description || '')
            setRadius(com.radius_meters)
        }
        setLoading(false)
    }

    const handleSave = async () => {
        const { error } = await supabase.from('communities' as any).update({
            name,
            description,
            radius_meters: radius
        } as any).eq('id', communityId)

        if (error) {
            alert("Failed to update: " + error.message)
        } else {
            alert("Updated successfully!")
            router.refresh() // Force data refresh
            router.push(`/communities/${id}`)
        }
    }

    if (loading) return <div className="p-10 text-center">Loading settings...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-black">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Herd Settings</h1>
            </header>

            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Herd Name</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-100 p-3 rounded-lg outline-none focus:ring-2 ring-cyan-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full bg-gray-100 p-3 rounded-lg outline-none focus:ring-2 ring-cyan-500 min-h-[100px]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Radius (Meters): {radius}m</label>
                    <input
                        type="range"
                        min="1000"
                        max="15000"
                        step="500"
                        value={radius}
                        onChange={e => setRadius(parseInt(e.target.value))}
                        className="w-full accent-cyan-500"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>1km</span>
                        <span>15km</span>
                    </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                    <button
                        onClick={handleSave}
                        className="w-full bg-cyan-500 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-cyan-600"
                    >
                        <Save size={20} /> Save Changes
                    </button>

                    <button
                        onClick={async () => {
                            if (!confirm("Are you sure? This will delete the herd and all its posts forever.")) return

                            // Check for delete policy by counting deleted rows
                            const { error, count } = await supabase.from('communities').delete({ count: 'exact' }).eq('id', communityId)

                            if (error) {
                                alert(error.message)
                            } else if (count === 0) {
                                alert("Failed to delete. Access denied (Database Policy likely missing).")
                            } else {
                                alert("Herd deleted.")
                                router.refresh() // Refresh server caches
                                window.location.href = '/communities' // Hard navigation to force reload
                            }
                        }}
                        className="w-full bg-red-50 text-red-500 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100"
                    >
                        Delete Herd
                    </button>
                </div>
            </div>
        </div>
    )
}
