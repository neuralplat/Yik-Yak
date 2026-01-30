"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Map, User, PlusSquare, ShieldCheck, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SideNav() {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'Feed', icon: Home },
        { href: '/explore', label: 'Explore', icon: Search },
        { href: '/communities', label: 'Herds', icon: Map },
        { href: '/me', label: 'My Yak', icon: User },
        // Extra desktop links
        { href: '/business', label: 'Business', icon: Briefcase },
        { href: '/mod', label: 'Moderation', icon: ShieldCheck },
    ]

    return (
        <nav className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r bg-white p-4">
            <div className="flex items-center gap-2 px-4 mb-8">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">Y</div>
                <span className="font-black text-xl tracking-tight">YakClone</span>
            </div>

            <div className="space-y-1 flex-1">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors font-medium text-lg",
                                isActive ? "bg-cyan-50 text-cyan-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            {label}
                        </Link>
                    )
                })}
            </div>

            <Link
                href="/compose"
                className="mt-4 w-full bg-cyan-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-cyan-600 transition-all flex items-center justify-center gap-2"
            >
                <PlusSquare size={24} />
                New Yak
            </Link>
        </nav>
    )
}
