"use client"

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Send, ArrowBigUp, ArrowBigDown, Clock, MessageCircle, Flag, MapPin, MoreHorizontal, X, AlertTriangle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/components/features/AuthProvider'
import { generateYakkerId } from '@/lib/name-generator'

export default function PostPage() {
    const { id } = useParams()
    const postId = id as string
    const router = useRouter()
    const { user } = useAuth()

    // State
    const [post, setPost] = useState<any>(null)
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState('')
    const [replyingTo, setReplyingTo] = useState<any>(null) // For nested replies
    const [loading, setLoading] = useState(true)
    const [reportingComment, setReportingComment] = useState<string | null>(null) // Comment ID being reported

    useEffect(() => {
        loadData()
    }, [postId])

    async function loadData() {
        setLoading(true)
        // Fetch Post
        const { data: postData } = await supabase
            .from('posts')
            .select('*, profiles(yakker_id), votes(value)')
            .eq('id', postId)
            .single()

        // Fetch Comments
        const { data: commentsData } = await supabase
            .from('comments')
            .select('*, profiles(yakker_id), comment_votes(value)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (postData) {
            const p = postData as any
            if (p.expires_at && new Date(p.expires_at) < new Date()) {
                setPost(null)
            } else {
                setPost(p)
            }
        }
        if (commentsData) setComments(commentsData)
        setLoading(false)
    }

    // --- VOTING LOGIC ---

    const handleCommentVote = async (commentId: string, value: number) => {
        if (!user) return alert("Login to vote")

        setComments(current => current.map(c => {
            if (c.id === commentId) {
                const myVote = c.comment_votes?.find((v: any) => v.user_id === user.id)
                const currentVal = myVote ? myVote.value : 0
                let newVal = value

                // Toggle off if same vote
                if (currentVal === value) newVal = 0

                // Calculate optimistic score
                let diff = newVal - currentVal

                // Update votes array for UI state
                const newVotes = c.comment_votes?.filter((v: any) => v.user_id !== user.id) || []
                if (newVal !== 0) newVotes.push({ user_id: user.id, value: newVal })

                return { ...c, score: (c.score || 0) + diff, comment_votes: newVotes }
            }
            return c
        }))

        // DB Call
        // Using direct table access since RPC might be missing or typed strictly
        const myVote = comments.find(c => c.id === commentId)?.comment_votes?.find((v: any) => v.user_id === user.id)
        const currentVal = myVote ? myVote.value : 0
        if (currentVal === value) {
            await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', user.id)
        } else {
            await supabase.from('comment_votes').upsert({ comment_id: commentId, user_id: user.id, value: value } as any)
        }
    }

    // --- REPLY LOGIC ---

    const handleComment = async () => {
        if (!newComment.trim()) return
        if (!user) return alert("Login to reply")

        // Ensure Profile
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single()
        if (!profile) {
            await supabase.from('profiles').insert({ id: user.id, yakker_id: generateYakkerId() } as any)
        }

        const payload: any = {
            post_id: postId,
            user_id: user.id,
            content: newComment,
            parent_id: replyingTo ? replyingTo.id : null
        }

        const { data, error } = await supabase.from('comments').insert(payload).select('*, profiles(yakker_id)').single()

        if (data) {
            setComments([...comments, { ...(data as any), score: 0, comment_votes: [] }])
            setNewComment('')
            setReplyingTo(null)
        }
    }

    // --- REPORT LOGIC ---

    const handleReportComment = async (commentId: string) => {
        if (!user) return alert("Login to report")
        const reason = prompt("Reason for reporting this comment?")
        if (!reason) return

        const { error } = await supabase.from('reports').insert({
            reporter_id: user.id,
            comment_id: commentId,
            reason: reason,
            status: 'pending'
        } as any)

        if (!error) alert("Report submitted.")
        else alert("Failed to report.")
    }

    // --- RENDER HELPERS ---

    // Sort comments: Parents first, then children? Or just flat list with indentation?
    // Flat list with visual threading is easier for MVP. 
    // Or we filter root comments and recurse. 

    // Let's stick to flat list but maybe show "Replying to @user" if nested
    // OR better, actual nesting logic.

    const rootComments = comments.filter(c => !c.parent_id)
    const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId)


    const CommentItem = ({ comment, depth = 0 }: { comment: any, depth?: number }) => {
        const myVote = comment.comment_votes?.find((v: any) => v.user_id === user?.id)?.value || 0
        const replies = getReplies(comment.id)

        return (
            <div className={`relative ${depth > 0 ? 'ml-6 mt-2' : 'mt-4'}`}>
                {depth > 0 && <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gray-100" />}

                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex gap-3">
                        {/* Vote Controls */}
                        <div className="flex flex-col items-center justify-start gap-1 pt-1">
                            <button onClick={() => handleCommentVote(comment.id, 1)} className={`p-0.5 rounded ${myVote === 1 ? 'text-cyan-600 bg-cyan-50' : 'text-gray-300 hover:text-cyan-500'}`}><ArrowBigUp size={20} /></button>
                            <span className={`text-xs font-bold ${myVote !== 0 ? (myVote === 1 ? 'text-cyan-600' : 'text-blue-500') : 'text-gray-600'}`}>{comment.score || 0}</span>
                            <button onClick={() => handleCommentVote(comment.id, -1)} className={`p-0.5 rounded ${myVote === -1 ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-blue-500'}`}><ArrowBigDown size={20} /></button>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-[11px] font-bold text-cyan-600">@{comment.profiles?.yakker_id || 'Anon'}</span>
                                <div className="flex gap-2">
                                    <span className="text-[10px] text-gray-300">{formatDistanceToNow(new Date(comment.created_at))} ago</span>
                                    <button onClick={() => handleReportComment(comment.id)} className="text-gray-300 hover:text-red-400"><Flag size={12} /></button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>

                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    onClick={() => setReplyingTo(comment)}
                                    className="text-xs font-bold text-gray-400 hover:text-cyan-600 flex items-center gap-1"
                                >
                                    <MessageCircle size={12} /> Reply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recursion for replies */}
                <div className="space-y-2">
                    {replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                    ))}
                </div>
            </div>
        )
    }

    if (loading) return <div className="p-10 text-center text-gray-400">Loading replies...</div>
    if (!post) return <div className="p-10 text-center text-gray-400">Post gone ghost. 👻</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            <header className="bg-white p-4 flex items-center gap-4 sticky top-0 shadow-sm z-10 z-[100]">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-black text-lg text-gray-800">Yak</span>
            </header>

            <div className="p-4">
                {/* Main Post */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-cyan-600">@{post.profiles?.yakker_id || 'Anon'}</span>
                        {post.is_ghost && <span className="text-[10px] text-purple-500 font-bold uppercase flex items-center gap-1"><Clock size={10} /> Ghost</span>}
                    </div>
                    <div className="text-xl leading-relaxed text-gray-800 mb-4 font-medium">{post.content}</div>
                    <div className="flex items-center justify-between text-gray-400 text-sm border-t pt-4">
                        <div className="flex items-center gap-1"><Clock size={14} /> {formatDistanceToNow(new Date(post.created_at))} ago</div>
                        <div className="font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">{post.score || 0} Points</div>
                    </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider px-2">
                    <MessageCircle size={16} /> {comments.length} Replies
                </div>

                {/* Comments Tree */}
                <div className="pb-20">
                    {rootComments.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 italic">No chatter yet. Start the herd!</div>
                    ) : (
                        rootComments.map(c => <CommentItem key={c.id} comment={c} />)
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-[110]">
                {replyingTo && (
                    <div className="flex justify-between items-center bg-gray-100 p-2 rounded-t-lg text-xs text-gray-500 mb-2">
                        <span>Replying to @{replyingTo.profiles?.yakker_id || 'Anon'}</span>
                        <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-gray-200 rounded-full"><X size={14} /></button>
                    </div>
                )}
                <div className="flex gap-2 items-end max-w-2xl mx-auto">
                    <textarea
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder={replyingTo ? "Write a reply..." : "Yak back..."}
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-cyan-500 resize-none min-h-[50px] max-h-[120px] text-black placeholder-gray-800"
                        rows={1}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                handleComment()
                            }
                        }}
                    />
                    <button
                        onClick={handleComment}
                        disabled={!newComment.trim()}
                        className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 shadow-md mb-0.5"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}
