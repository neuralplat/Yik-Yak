"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Clock, MapPin, PenTool, Plus, Users, Settings } from 'lucide-react'
import { useAuth } from '@/components/features/AuthProvider'

export default function CommunityFeedPage() {
    const { id } = useParams()
    const communityId = id as string
    const router = useRouter()
    const { user } = useAuth()

    const [community, setCommunity] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [isMember, setIsMember] = useState(false)

    useEffect(() => {
        if (!communityId) return
        loadCommunity()
        loadPosts()
        if (user) checkMembership()
    }, [communityId, user])

    async function loadCommunity() {
        const { data } = await supabase.from('communities').select('*').eq('id', communityId).single()
        setCommunity(data)
    }

    async function loadPosts() {
        // Fetch posts for this community
        const { data } = await supabase.from('posts')
            .select('*, votes(value), profiles(yakker_id)')
            .eq('community_id', communityId)
            .order('created_at', { ascending: false })
            .limit(50)

        if (data) setPosts(data)
    }

    async function checkMembership() {
        if (!user) return
        const { data } = await supabase.from('community_members').select('*').eq('community_id', communityId).eq('user_id', user.id).single()
        setIsMember(!!data)
    }

    const handleJoin = async () => {
        if (!user) return
        if (isMember) return // Already joined logic could be leave

        await supabase.from('community_members').insert({ community_id: communityId, user_id: user.id } as any)
        setIsMember(true)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header with Hero-like background */}
            <div className="bg-cyan-600 text-white p-6 pt-12 rounded-b-3xl shadow-lg relative overflow-hidden">
                <button onClick={() => router.back()} className="absolute top-4 left-4 p-2 bg-white/20 rounded-full backdrop-blur-md">
                    <ArrowLeft size={20} />
                </button>

                <h1 className="text-3xl font-black mb-2 relative z-10">{community?.name}</h1>
                <p className="opacity-90 relative z-10">{community?.description}</p>

                <div className="flex gap-2 mt-4 relative z-10">
                    <button
                        onClick={handleJoin}
                        disabled={isMember}
                        className="bg-white text-cyan-600 px-6 py-2 rounded-full font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isMember ? 'Member' : 'Join Herd'}
                    </button>

                    <button
                        onClick={() => router.push(`/communities/${id}/members`)}
                        className="bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/30"
                    >
                        <Users size={20} />
                    </button>

                    {user && community && user.id === community.creator_id && (
                        <button
                            onClick={() => router.push(`/communities/${id}/settings`)}
                            className="bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md hover:bg-white/30"
                        >
                            <Settings size={20} />
                        </button>
                    )}
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
                <div className="absolute top-20 right-10 w-20 h-20 bg-white/10 rounded-full" />
            </div>

            {/* Posts */}
            <div className="p-4 space-y-4">
                {/* Empty State */}
                {posts.length === 0 && (
                    <div className="text-center py-20 text-gray-400">
                        <p>No yaks in this herd yet.</p>
                        <p className="text-sm">Be the first!</p>
                    </div>
                )}

                {posts.map(post => (
                    <div key={post.id} onClick={() => router.push(`/post/${post.id}`)} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-bold text-cyan-600">@{post.profiles?.yakker_id || 'Anon'}</span>
                            {post.is_ghost && <span className="text-[10px] text-purple-500 font-bold uppercase"><Clock size={10} className="inline mr-1" />Ghost</span>}
                        </div>
                        <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>
                        <div className="flex gap-4 text-xs text-gray-400">
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            <span>{post.score || 0} Points</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* FAB to Post */}
            {isMember && (
                <button
                    onClick={() => router.push(`/compose?community_id=${id}&name=${encodeURIComponent(community?.name)}`)}
                    className="fixed bottom-24 right-6 w-14 h-14 bg-cyan-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-cyan-600 transition-transform hover:scale-105 active:scale-95 z-50"
                >
                    <PenTool size={24} />
                </button>
            )}
        </div>
    )
}
