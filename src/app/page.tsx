"use client"

import { useEffect, useState } from 'react'
import { useLocation } from '@/components/features/LocationProvider'
import { supabase } from '@/lib/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Clock, MapPin, Flag } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function FeedPage() {
  const { coords, loading: locLoading, error: locError } = useLocation()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (coords) {
      fetchPosts()
    } else if (!locLoading) {
      setLoading(false) // Location failed or denied
    }
  }, [coords, locLoading])

  async function fetchPosts() {
    setLoading(true)

    // In a real app with PostGIS, we'd use an RPC call:
    // rpc('get_nearby_posts', { lat: coords.latitude, long: coords.longitude, radius: 5000 })

    // For this prototype without active PostGIS RPCs, we just fetch all and filter client-side (mocking location)
    // or just fetch all for demo purposes.
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setPosts(data)
    setLoading(false)
  }

  if (locLoading || loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-20">
      <div className="animate-bounce text-4xl mb-4">🛸</div>
      <p className="text-gray-500 font-medium">Scanning local herd...</p>
    </div>
  )

  if (locError) return (
    <div className="p-8 pt-20 text-center">
      <div className="text-red-500 font-bold mb-2">Location Error</div>
      <p className="text-gray-600">{locError}</p>
      <p className="text-sm mt-4 text-gray-400">We need your location to find nearby Yaks!</p>
    </div>
  )

  return (
    <main className="pb-24 pt-4 px-2 max-w-md mx-auto">
      <header className="flex justify-between items-center px-2 mb-4 bg-white/80 backdrop-blur-md sticky top-0 z-10 py-2">
        <div className="flex items-center gap-2">
          <MapPin className="text-cyan-500 w-5 h-5" />
          <h1 className="text-xl font-black tracking-tight text-gray-900">Nearby</h1>
        </div>
        <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-500">
          5 mi
        </div>
      </header>

      <div className="space-y-3">
        {/* Placeholder Ad */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Sponsored</span>
            <span className="text-[10px] text-gray-400">Local Promo</span>
          </div>
          <p className="font-medium text-gray-800">Joe's Pizza - 50% off for all Yakkers tonight! 🍕</p>
          <button className="mt-3 w-full py-2 bg-orange-400 text-white rounded-lg text-sm font-bold shadow-sm">Get Deal</button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>It's quiet here...</p>
            <p className="text-sm">Be the first to Yak!</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <button className="p-1 hover:bg-gray-50 rounded text-gray-400 hover:text-cyan-500 transition-colors">
                    <ArrowBigUp size={28} />
                  </button>
                  <span className="font-bold text-gray-700">{post.score || 0}</span>
                  <button className="p-1 hover:bg-gray-50 rounded text-gray-400 hover:text-blue-500 transition-colors">
                    <ArrowBigDown size={28} />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  {post.is_ghost && (
                    <div className="flex items-center gap-1 text-[10px] text-purple-500 font-bold uppercase tracking-wider">
                      <Clock size={10} /> Ghost Post • {post.expire_time_str || '24h'}
                    </div>
                  )}
                  <p className="text-gray-800 leading-relaxed text-[15px]">{post.content}</p>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(post.created_at))} ago
                    </div>
                    <div className="flex items-center gap-1 hover:text-gray-600 cursor-pointer">
                      <MessageCircle size={14} />
                      Reply
                    </div>
                    <button
                      onClick={() => alert('Reported to moderation team.')}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Flag size={12} /> Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
