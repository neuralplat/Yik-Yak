"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Users, IndianRupee, Plus, Megaphone, Target } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function BusinessDashboard() {
    const router = useRouter()

    const [stats, setStats] = useState([
        { label: 'Active Ads', value: '-', icon: Target },
        { label: 'Total Budget', value: '-', icon: IndianRupee },
    ])

    useEffect(() => {
        async function loadStats() {
            const { data: ads } = await supabase.from('ads').select('*')
            if (ads) {
                setStats([
                    { label: 'Active Ads', value: ads.length.toString(), icon: Target },
                    { label: 'Total Budget', value: '₹' + (ads.length * 499).toString(), icon: IndianRupee },
                ])
            }
        }
        loadStats()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b p-4 sticky top-0">
                <div className="flex justify-between items-center max-w-4xl mx-auto">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-cyan-500 text-white p-1 rounded">Biz</span>
                        Dashboard
                    </h1>
                    <button className="text-sm font-medium text-gray-500">Settings</button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
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

                {/* Action Banner */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold">Grow your local reach</h2>
                        <p className="text-cyan-100 text-sm">Target customers within 5 km starting at ₹499/mo</p>
                    </div>
                    <button
                        onClick={() => router.push('/business/create-ad')}
                        className="bg-white text-cyan-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-cyan-50 transition-colors flex items-center gap-2"
                    >
                        <Plus size={16} /> New Ad
                    </button>
                </div>

                {/* Active Ads List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b font-medium text-gray-700">Your Campaigns</div>
                    <div className="divide-y">
                        <div className="p-4 flex justify-between items-center">
                            <div>
                                <div className="font-bold">Weekend Special</div>
                                <div className="text-xs text-green-500 font-medium flex items-center gap-1">
                                    ● Active
                                    <span className="text-gray-400">• 5mi Radius</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold">452 Views</div>
                                <div className="text-xs text-gray-400">12 Clicks</div>
                            </div>
                        </div>
                        {/* Empty State if needed */}
                    </div>
                </div>
            </main>
        </div>
    )
}
