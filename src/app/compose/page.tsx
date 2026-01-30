"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/components/features/AuthProvider'
import { useLocation } from '@/components/features/LocationProvider'
import { moderateContent } from '@/lib/moderation'
import { Clock, Send, Ghost } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ComposePage() {
    const [content, setContent] = useState('')
    const [isGhost, setIsGhost] = useState(false)
    const [duration, setDuration] = useState('24h') // 12h, 24h, 48h, 1w
    const [loading, setLoading] = useState(false)

    const { user } = useAuth()
    const { coords } = useLocation()
    const router = useRouter()

    const handlePost = async () => {
        if (!content.trim() || !user || !coords) return

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
            if (duration === '12h') date.setHours(date.getHours() + 12)
            if (duration === '24h') date.setHours(date.getHours() + 24)
            if (duration === '48h') date.setHours(date.getHours() + 48)
            if (duration === '1w') date.setDate(date.getDate() + 7)
            expiresAt = date.toISOString()
        }

        const { error } = await supabase.from('posts').insert({
            user_id: user.id,
            content: content,
            location: `POINT(${coords.longitude} ${coords.latitude})`, // PostGIS format
            is_ghost: isGhost,
            expires_at: expiresAt
        } as any)

        if (error) {
            alert('Failed to yak: ' + error.message)
        } else {
            router.push('/')
        }
        setLoading(false)
    }

    const durationOptions = ['12h', '24h', '48h', '1w']

    return (
        <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col">
            <header className="flex justify-between items-center p-4 border-b">
                <button onClick={() => router.back()} className="text-gray-500">Cancel</button>
                <h1 className="font-bold">New Yak</h1>
                <button
                    onClick={handlePost}
                    disabled={!content.trim() || loading}
                    className="font-bold text-cyan-500 disabled:opacity-50"
                >
                    {loading ? 'Posting...' : 'Yak It'}
                </button>
            </header>

            <div className="flex-1 p-4">
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="What's happening in the herd?"
                    className="w-full h-40 text-lg resize-none outline-none placeholder:text-gray-300"
                    maxLength={500}
                />

                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer" onClick={() => setIsGhost(!isGhost)}>
                        <div className="flex items-center gap-2">
                            <div className={cn("p-2 rounded-lg", isGhost ? "bg-purple-100 text-purple-600" : "bg-gray-200 text-gray-500")}>
                                <Ghost size={20} />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-medium">Ghost Mode</span>
                                <span className="text-xs text-gray-500">Disappears after a set time</span>
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
                                            ? "bg-purple-50 border-purple-200 text-purple-700"
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
