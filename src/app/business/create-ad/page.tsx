"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, MapPin } from 'lucide-react'

export default function CreateAdPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const handlePayment = () => {
        setLoading(true)
        // Simulate API call to Stripe
        setTimeout(() => {
            setLoading(false)
            router.push('/business')
            alert('Payment successful! Your ad is now live.')
        }, 2000)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-white border-b p-4">
                <div className="flex items-center gap-4 max-w-lg mx-auto">
                    <button onClick={() => router.back()} className="text-gray-500 hover:text-black">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold">Create Campaign</h1>
                </div>
            </header>

            <main className="max-w-lg mx-auto p-4 space-y-6">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <h2 className="font-bold text-lg">Ad Details</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Content</label>
                                <textarea
                                    className="w-full border rounded-lg p-3 h-24 resize-none"
                                    placeholder="What do you want to tell local Yakkers?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Radius</label>
                                <select className="w-full border rounded-lg p-3 bg-white">
                                    <option>1 mile (Walkable)</option>
                                    <option>5 miles (Neighborhood)</option>
                                    <option>10 miles (City)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800"
                        >
                            Continue to Payment
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                            <h2 className="font-bold text-lg">Checkout</h2>

                            <div className="flex justify-between items-center py-4 border-b">
                                <span>Monthly Subscription</span>
                                <span className="font-bold">$499.00</span>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                <CreditCard size={20} className="text-gray-500" />
                                <input
                                    placeholder="Card Number"
                                    className="bg-transparent outline-none flex-1"
                                />
                            </div>

                            <div className="flex gap-4">
                                <input placeholder="MM/YY" className="w-1/2 p-3 bg-gray-50 rounded-lg border outline-none" />
                                <input placeholder="CVC" className="w-1/2 p-3 bg-gray-50 rounded-lg border outline-none" />
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full bg-cyan-500 text-white py-3 rounded-lg font-bold hover:bg-cyan-600 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Pay $499 & Launch'}
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
