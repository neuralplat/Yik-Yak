"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, IndianRupee, Plus, Megaphone, Target, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { formatDistance, formatDistanceToNow } from 'date-fns'

export default function BusinessDashboard() {
    const router = useRouter()

    const [stats, setStats] = useState([
        { label: 'Active Ads', value: '0', icon: Target },
        { label: 'Total Budget Spent', value: '₹0', icon: IndianRupee },
    ])
    const [ads, setAds] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: adsData } = await supabase
            .from('ads' as any)
            .select('*')
            .eq('business_owner_id', user.id)
            .order('created_at', { ascending: false })

        if (adsData) {
            const activeAds = (adsData as any[]).filter(ad => new Date(ad.expires_at) > new Date())
            const totalSpent = (adsData as any[]).reduce((acc, ad) => acc + (ad.cost || 0), 0)

            setStats([
                { label: 'Active Ads', value: activeAds.length.toString(), icon: Target },
                { label: 'Total Budget Spent', value: '₹' + totalSpent.toLocaleString(), icon: IndianRupee },
            ])
            setAds(adsData)
        }
        setLoading(false)
    }

    const handleDelete = async (adId: string) => {
        console.log("Attempting to delete ad:", adId)
        if (!confirm("Are you sure you want to delete this ad?")) return

        const { error } = await supabase.from('ads').delete().eq('id', adId)

        if (error) {
            console.error("Delete error:", error)
            alert("Failed to delete: " + error.message)
        } else {
            console.log("Ad deleted successfully")
            loadData() // Reload
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b p-4 sticky top-0">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-cyan-500 text-white p-1 rounded">Biz</span>
                        Dashboard
                    </h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                <stat.icon size={16} />
                                <span className="text-xs font-medium uppercase">{stat.label}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Create Banner */}
                <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Launch a new campaign</h2>
                        <p className="text-cyan-100 text-sm">Reach local yakkers instantly.</p>
                    </div>
                    <button
                        onClick={() => router.push('/business/create-ad')}
                        className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-cyan-50 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Plus size={16} /> New Ad
                    </button>
                </div>

                {/* Ads List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b font-medium text-gray-700">Your Ads</div>
                    <div className="divide-y">
                        {ads.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">No ads created yet.</div>
                        ) : (
                            ads.map(ad => {
                                const isActive = new Date(ad.expires_at) > new Date()
                                return (
                                    <div key={ad.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                                        <div>
                                            <div className="font-bold text-gray-800">{ad.title || 'Untitled Ad'}</div>
                                            <p className="text-sm text-gray-600 truncate max-w-xs">{ad.content}</p>
                                            <div className="text-xs mt-1 flex gap-2 items-center">
                                                <span className={`font-bold ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {isActive ? '● Active' : '● Expired'}
                                                </span>
                                                <span className="text-gray-400">
                                                    • Cost: ₹{ad.cost}
                                                </span>
                                                <span className="text-gray-400">
                                                    • {isActive ? `Ends in ${formatDistanceToNow(new Date(ad.expires_at))}` : `Ended ${formatDistanceToNow(new Date(ad.expires_at))} ago`}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
