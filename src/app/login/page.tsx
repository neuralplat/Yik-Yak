"use client"

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { generateYakkerId } from '@/lib/name-generator'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            router.push('/')
        }
    }

    const handleSignUp = async () => {
        setLoading(true)
        setError(null)

        // 1. Sign Up Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                // If you want to disable email confirmation requirement for dev, you need to toggle it in Supabase dashboard
                // otherwise this will require checking email.
                data: {
                    yakker_id: generateYakkerId() // Store in metadata too as backup
                }
            }
        })

        if (authError) {
            setError("Sign up failed: " + authError.message)
            setLoading(false)
            return
        }

        if (authData.user) {
            // 2. Create Public Profile
            const yakkerId = generateYakkerId()
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    yakker_id: yakkerId,
                } as any)

            if (profileError) {
                console.error("Profile creation failed:", profileError)
                // Don't block flow, might still work
            }

            // Check if we are already logged in (Email confirmation disabled)
            if (authData.session) {
                router.push('/') // Go straight to feed
            } else {
                alert("Account created! Check your email to confirm.")
            }
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
            <div className="w-full max-w-sm space-y-4 text-center">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome to YakClone</h1>
                <p className="text-sm text-gray-500">Enter your email to sign in or create an account</p>

                {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4 text-left">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full mt-1 p-2 border rounded-md"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full mt-1 p-2 border rounded-md"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-black text-white p-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Sign In'}
                        </button>
                        <button
                            type="button"
                            onClick={handleSignUp}
                            disabled={loading}
                            className="flex-1 border border-gray-300 text-gray-700 p-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
