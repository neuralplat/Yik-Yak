"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Clock, IndianRupee, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useLocation } from '@/components/features/LocationProvider'
import { useAuth } from '@/components/features/AuthProvider'

export default function CreateAdPage() {
    const router = useRouter()
    const { coords } = useLocation()
    const { user } = useAuth()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [durationHours, setDurationHours] = useState(1)
    const [loading, setLoading] = useState(false)

    // Pricing: 100 Rs per hour
    const cost = durationHours * 100

    const handleCreate = async () => {
        if (!title.trim() || !description.trim()) return alert("Please fill in all fields")
        if (!coords) return alert("Location needed")
        if (!user) return alert("Login required")

        setLoading(true)

        // Simulate Payment Gateway
        const proceed = confirm(`Pay ₹${cost} for this ad? \n(Mock Payment Gateway)`)
        if (!proceed) {
            setLoading(false)
            return
        }

        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + durationHours)

        const { error } = await supabase.from('ads').insert({
            business_owner_id: user.id,
            title: title.trim(),
            content: description.trim(),
            target_location: `POINT(${coords.longitude} ${coords.latitude})`,
            cost: cost,
            expires_at: expiresAt.toISOString(),
            status: 'active'
        } as any)

        if (error) {
            alert("Failed to create ad: " + error.message)
            setLoading(false)
        } else {
            alert("Ad published successfully! Money deducted from mock wallet.")
            router.push('/business')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white p-4 flex items-center gap-4 border-b">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-bold text-lg text-gray-800">Create New Ad</h1>
            </header>

            <div className="max-w-xl mx-auto p-6 space-y-6">

                {/* Ad Preview Card */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 opacity-80 pointer-events-none transform scale-95 origin-top">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Sponsored</span>
                        <span className="text-[10px] text-gray-400">Preview</span>
                    </div>
                    {title && <h3 className="font-bold text-gray-900 mb-1">{title}</h3>}
                    <p className="font-medium text-gray-800">{description || "Your ad description will appear here..."}</p>
                    <button className="mt-3 w-full py-2 bg-orange-400 text-white rounded-lg text-sm font-bold shadow-sm">Get Deal</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Ad Title</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Flash Sale 50% Off"
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none"
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Tell yakkers what you're offering..."
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-cyan-500 outline-none h-24 resize-none"
                            maxLength={140}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Duration: {durationHours} Hour(s)</label>
                        <input
                            type="range"
                            min="1"
                            max="24"
                            value={durationHours}
                            onChange={e => setDurationHours(parseInt(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>1h</span>
                            <span>12h</span>
                            <span>24h</span>
                        </div>
                    </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-white p-4 rounded-xl border border-cyan-100 bg-cyan-50">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-600">Duration Cost</span>
                        <span className="font-medium text-gray-900">{durationHours}h × ₹100</span>
                    </div>
                    <div className="h-px bg-cyan-200 my-2" />
                    <div className="flex justify-between items-center text-lg font-bold text-cyan-800">
                        <span>Total Pay</span>
                        <span>₹{cost}</span>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={loading || !title || !description}
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : `Pay ₹${cost} & Publish`}
                </button>
            </div>
        </div>
    )
}
