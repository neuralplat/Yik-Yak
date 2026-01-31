"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Shield, User } from 'lucide-react'

export default function CommunityMembersPage() {
    const { id } = useParams()
    const router = useRouter()

    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) loadMembers()
    }, [id])

    async function loadMembers() {
        const { data } = await supabase
            .from('community_members')
            .select('*, profiles(yakker_id)')
            .eq('community_id', id as string)
            .order('joined_at', { ascending: false })

        if (data) setMembers(data)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Members ({members.length})</h1>
            </header>

            <div className="space-y-4">
                {loading && <div className="text-center text-gray-400">Loading...</div>}

                {members.map(member => (
                    <div key={member.user_id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-700 font-bold text-lg">
                                {member.profiles?.yakker_id?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <div className="font-bold text-gray-800">@{member.profiles?.yakker_id || 'Anon'}</div>
                                <div className="text-xs text-gray-400">Joined {new Date(member.joined_at).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-gray-100 text-gray-500">
                            {member.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                            {member.role}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
