"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/components/features/AuthProvider'
import { useLocation } from '@/components/features/LocationProvider'
import { moderateContent } from '@/lib/moderation'
import { generateYakkerId } from '@/lib/name-generator'
import { ArrowLeft, Clock, MapPin, Send, Ghost } from 'lucide-react'
import { cn } from '@/lib/utils'

function ComposeContent() {
    const [content, setContent] = useState('')
    const [isGhost, setIsGhost] = useState(false)
    const [duration, setDuration] = useState('24h') // 12h, 24h, 48h, 1w
    const [loading, setLoading] = useState(false)

    const router = useRouter()
    const searchParams = useSearchParams()
    const communityName = searchParams.get('name')
    const communityId = searchParams.get('community_id')
    const { user } = useAuth()
    const { coords } = useLocation()

    const handlePost = async () => {
        if (!content.trim()) return

        if (!user) {
            alert("You must be logged in to Yak. (Database connection might be missing)")
            return
        }

        if (!coords) {
            alert("We need your location to post! Please enable permissions.")
            return
        }

        const moderation = moderateContent(content)
        if (!moderation.safe) {
            alert("Yak rejected: " + moderation.reason)
            return
        }

        setLoading(true)

        // Calculate expiry if ghost
        let expiresAt = null
        if (isGhost) {
            const date = new Date()
            if (duration === '1h') date.setMinutes(date.getMinutes() + 60)
            if (duration === '12h') date.setHours(date.getHours() + 12)
            if (duration === '24h') date.setHours(date.getHours() + 24)
            if (duration === '48h') date.setHours(date.getHours() + 48)
            if (duration === '1w') date.setDate(date.getDate() + 7)
            expiresAt = date.toISOString()
        }

        // Check/Create Profile to fix Foreign Key Error
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()

        if (!profile) {
            const newId = generateYakkerId()
            const { error: createError } = await supabase.from('profiles').insert({
                id: user.id,
                yakker_id: newId
            } as any)

            if (createError) {
                alert("Failed to create yakker profile: " + createError.message)
                setLoading(false)
                return
            }
        }

        const { error } = await supabase.from('posts').insert({
            user_id: user.id,
            content,
            location: `POINT(${coords.longitude} ${coords.latitude})`,
            expires_at: expiresAt,
            is_ghost: !!expiresAt,
            community_id: communityId || null // Add this line
        } as any)

        if (error) {
            alert('Failed to yak: ' + error.message)
        } else {
            router.push('/')
        }
        setLoading(false)
    }

    const durationOptions = ['1h', '12h', '24h', '48h', '1w']

    return (
        <div className="max-w-2xl mx-auto min-h-screen bg-white flex flex-col md:border-x md:shadow-sm">
            <header className="flex justify-between items-center p-4 border-b">
                <button onClick={() => router.back()} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">Cancel</button>
                <h1 className="font-black text-xl text-cyan-500 uppercase tracking-tighter">New Yak</h1>
                <button
                    onClick={handlePost}
                    disabled={!content.trim() || loading}
                    className="bg-cyan-500 text-white px-6 py-2 rounded-full font-bold shadow-sm hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? 'Posting...' : 'Yak It'}
                </button>
            </header>

            <div className="flex-1 p-6">
                <div className="relative">
                    <textarea
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        placeholder={communityName ? `What's happening in ${communityName}?` : "What's on your mind?"}
                        className="w-full h-40 bg-transparent text-xl placeholder-gray-400 outline-none resize-none"
                        maxLength={300}
                    />
                    <div className="absolute bottom-2 right-0 text-xs font-bold text-gray-400 bg-white/50 px-2 rounded-full backdrop-blur-sm">
                        {content.length}/300
                    </div>
                </div>

                {communityName && (
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-bold">
                        <MapPin size={12} />
                        Posting to {communityName}
                    </div>
                )}

                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer" onClick={() => setIsGhost(!isGhost)}>
                        <div className="flex items-center gap-2">
                            <div className={cn("p-2 rounded-lg", isGhost ? "bg-purple-100 text-purple-600" : "bg-gray-200 text-gray-500")}>
                                <Ghost size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium text-black">Ghost Mode</span>
                                <span className="text-xs text-black font-bold">Disappears after a set time</span>
                            </div>
                        </div>
                        <div className={cn("w-12 h-6 rounded-full relative transition-colors", isGhost ? "bg-purple-500" : "bg-gray-300")}>
                            <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-transform", isGhost ? "right-1" : "left-1")} />
                        </div>
                    </div>

                    {isGhost && (
                        <div className="flex gap-2">
                            {durationOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setDuration(opt)}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-lg border",
                                        duration === opt
                                            ? "bg-purple-55 border-purple-200 text-purple-700"
                                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                    )}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 text-xs text-center text-gray-400">
                Yaks are anonymous but subject to our Community Guardrails.
            </div>
        </div>
    )
}

export default function ComposePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading composer...</div>}>
            <ComposeContent />
        </Suspense>
    )
}
