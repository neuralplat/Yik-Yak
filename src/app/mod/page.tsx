"use client"

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function ModeratorPage() {
    const [reports, setReports] = useState<any[]>([])

    useEffect(() => {
        loadReports()
    }, [])

    async function loadReports() {
        const { data } = await supabase
            .from('reports')
            .select('*, posts(content)')
            .eq('status', 'pending')

        if (data) {
            // Flatten structure for easy display
            setReports(data.map(r => ({
                id: r.id,
                content: r.posts?.content || '[Deleted Post]',
                reason: r.reason,
                post_id: r.post_id
            })))
        }
    }

    const handleAction = async (reportId: string, action: 'approve' | 'ban', postId?: string) => {
        // Optimistic UI update
        setReports(reports.filter(r => r.id !== reportId))

        if (action === 'ban' && postId) {
            // Delete the post
            await supabase.from('posts').delete().eq('id', postId)
            // Update report status
            await supabase.from('reports').update({ status: 'action_taken' } as any).eq('id', reportId)
        } else {
            // Dismiss report
            await supabase.from('reports').update({ status: 'dismissed' } as any).eq('id', reportId)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 min-h-screen bg-gray-50">
            <h1 className="text-2xl font-bold mb-6">Moderator Queue</h1>

            <div className="space-y-4">
                {reports.length === 0 && (
                    <div className="text-center text-gray-500 py-20">All clear! No reports.</div>
                )}

                {reports.map(report => (
                    <div key={report.id} className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                        <div className="flex justify-between mb-4">
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold uppercase">{report.reason}</span>
                            <span className="text-xs text-gray-400">Report ID: #{report.id}</span>
                        </div>

                        <p className="text-lg mb-6 p-4 bg-gray-50 rounded-lg italic">"{report.content}"</p>

                        <div className="flex gap-4">
                            <button
                                onClick={() => handleAction(report.id, 'ban', report.post_id)}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-bold flex justify-center items-center gap-2"
                            >
                                <X size={18} /> Remove Post
                            </button>
                            <button
                                onClick={() => handleAction(report.id, 'approve')}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg font-bold flex justify-center items-center gap-2"
                            >
                                <Check size={18} /> Dismiss Report
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
