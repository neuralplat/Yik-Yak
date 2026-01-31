"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/components/features/LocationProvider'
import { useAuth } from '@/components/features/AuthProvider'
import { supabase } from '@/lib/supabase/client'
import { ArrowBigUp, ArrowBigDown, MessageCircle, Clock, MapPin, Flag, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function FeedPage() {
  const { coords, loading: locLoading, error: locError } = useLocation()
  const { user } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<any[]>([])
  const [ad, setAd] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    if (coords) {
      fetchPosts()
      fetchRandomAd()
    } else if (!locLoading) {
      setLoading(false) // Location failed or denied
    }
  }, [coords, locLoading, user])

  async function fetchRandomAd() {
    // Fetch random active ad
    const { data } = await supabase
      .from('ads')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .limit(10) // fetch a few pool

    if (data && data.length > 0) {
      const random = data[Math.floor(Math.random() * data.length)]
      setAd(random)
    }
  }

  async function fetchPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*, votes(value), profiles(yakker_id), communities(name)')
      // Filter: Show if NOT ghost (is_ghost=false) OR (is_ghost=true AND expires_at > now)
      // Simpler: Show if expires_at IS NULL (post) OR expires_at > NOW (ghost)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (data) setPosts(data)
    setLoading(false)
  }

  const handleVote = async (postId: string, value: number) => {
    if (!user) {
      alert("Please login to vote!")
      return
    }

    // Find current vote status from local state
    const postIndex = posts.findIndex(p => p.id === postId)
    if (postIndex === -1) return

    // Check if I have voted
    const myVote = posts[postIndex].votes?.find((v: any) => v.user_id === user.id)
    const currentVal = myVote ? myVote.value : 0

    let newVal = value
    let scoreChange = value

    // Logic:
    // 1. If no vote: Add vote (+1 or -1) => Score changes by +1 or -1
    // 2. If same vote: Remove vote (0) => Score changes by -1 or +1 (reverse)
    // 3. If diff vote: Switch (-1 to 1 or 1 to -1) => Score changes by +2 or -2

    if (currentVal === value) {
      newVal = 0 // Remove vote
      scoreChange = -currentVal
    } else if (currentVal !== 0) {
      // Switching vote
      scoreChange = value - currentVal // e.g. 1 - (-1) = 2
    }

    // Optimistic Update
    setPosts(current => current.map(p => {
      if (p.id === postId) {
        // Update local votes array for future clicks
        const newVotes = p.votes?.filter((v: any) => v.user_id !== user.id) || []
        if (newVal !== 0) newVotes.push({ user_id: user.id, value: newVal })

        return {
          ...p,
          score: (p.score || 0) + scoreChange,
          votes: newVotes
        }
      }
      return p
    }))

    // Database Sync
    // 1. Always delete any existing vote for this post/user combo to clear state
    await supabase.from('votes').delete().eq('post_id', postId).eq('user_id', user.id)

    // 2. If it's not a removal (0), insert the new vote
    if (newVal !== 0) {
      const { error } = await supabase.from('votes').insert({
        post_id: postId,
        user_id: user.id,
        value: newVal
      } as any)

      if (error) {
        console.error("Vote failed:", error)
        // Revert optimistic update if needed, though simple log is usually enough for this demo level
        alert("Vote failed to save. Please try again.")
      }
    }
  }

  const handleReport = async (postId: string) => {
    if (!user) return alert("Login to report.")
    const reason = prompt("Why are you reporting this? (spam, harassment, etc)")
    if (!reason) return

    const { error } = await supabase.from('reports').insert({
      post_id: postId,
      reporter_id: user.id,
      reason: reason,
      status: 'pending'
    } as any)

    if (error) alert("Failed to report: " + error.message)
    else alert("Report sent to moderation team.")
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("Delete this Yak forever?")) return
    const { error } = await supabase.from('posts').delete().eq('id', postId)
    if (error) {
      alert(error.message)
    } else {
      setPosts(posts.filter(p => p.id !== postId))
    }
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
          5 km
        </div>
      </header>

      <div className="space-y-3">
        {/* Sponsored Area - Fetch random active ad */}
        {ad && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Sponsored</span>
              <span className="text-[10px] text-gray-400">Local Promo</span>
            </div>
            {ad.title && <h3 className="font-bold text-gray-900 mb-1 leading-tight">{ad.title}</h3>}
            <p className="font-medium text-gray-800 text-sm">{ad.content}</p>
            <div className="text-[10px] text-gray-400 mt-2 text-right">Expires in {formatDistanceToNow(new Date(ad.expires_at))}</div>
          </div>
        )}


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
                  <button
                    onClick={() => handleVote(post.id, 1)}
                    className="p-1 hover:bg-gray-50 rounded text-gray-400 hover:text-cyan-500 transition-colors"
                  >
                    <ArrowBigUp size={28} />
                  </button>
                  <span className="font-bold text-gray-700">{post.score || 0}</span>
                  <button
                    onClick={() => handleVote(post.id, -1)}
                    className="p-1 hover:bg-gray-50 rounded text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <ArrowBigDown size={28} />
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  {post.is_ghost && (
                    <div className="flex items-center gap-1 text-[10px] text-purple-500 font-bold uppercase tracking-wider">
                      <Clock size={10} /> Ghost Post • {post.expires_at ? formatDistanceToNow(new Date(post.expires_at)) + ' left' : '24h'}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-cyan-600 opacity-80">@{post.profiles?.yakker_id || 'Anon'}</span>
                    {post.communities && (
                      <span onClick={(e) => { e.stopPropagation(); router.push(`/communities/${post.community_id}`) }} className="text-[10px] font-bold bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded cursor-pointer hover:bg-cyan-200">
                        {post.communities.name}
                      </span>
                    )}
                  </div>
                  <p
                    onClick={() => router.push(`/post/${post.id}`)}
                    className="text-gray-800 leading-relaxed text-[15px] cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between mt-3 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      {/* Safe date handling */}
                      {post.created_at ? formatDistanceToNow(new Date(post.created_at)) : 'just now'} ago
                    </div>
                    <div
                      onClick={() => router.push(`/post/${post.id}`)}
                      className="flex items-center gap-1 hover:text-gray-600 cursor-pointer p-2 -m-2"
                    >
                      <MessageCircle size={14} />
                      Reply
                    </div>
                    {user && user.id === post.user_id ? (
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors text-gray-400"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReport(post.id)}
                        className="flex items-center gap-1 hover:text-red-500 transition-colors"
                      >
                        <Flag size={12} /> Report
                      </button>
                    )}
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
