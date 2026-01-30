"use client"

import { Search, TrendingUp, Flame } from 'lucide-react'

export default function ExplorePage() {
    const topics = ['#FinalsWeek', '#CampusFood', '#LostKeys', '#GymRats', '#Confessions']

    return (
        <div className="min-h-screen bg-white pb-20">
            <header className="p-4 sticky top-0 bg-white z-10">
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        className="w-full bg-gray-100 p-3 pl-10 rounded-xl outline-none focus:ring-2 ring-cyan-500 transition-all"
                        placeholder="Search yaks, herds, or people..."
                    />
                </div>
            </header>

            <div className="p-4 space-y-6">
                <section>
                    <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <TrendingUp className="text-cyan-500" size={20} />
                        Trending Nearby
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {topics.map(topic => (
                            <span key={topic} className="px-4 py-2 bg-gray-50 rounded-full text-cyan-600 font-medium text-sm border border-gray-100">
                                {topic}
                            </span>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Flame className="text-orange-500" size={20} />
                        Hot Yaks
                    </h2>
                    {/* Mock Hot Posts */}
                    <div className="space-y-3">
                        {[1, 2].map(i => (
                            <div key={i} className="p-4 border rounded-xl flex gap-3">
                                <div className="font-black text-2xl text-gray-300">#{i}</div>
                                <div>
                                    <p className="font-medium">Has anyone else noticed the squirrels are getting bolder? One just stole my sandwich.</p>
                                    <div className="mt-2 text-xs text-gray-400">234 Upvotes • 12 Replies</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
