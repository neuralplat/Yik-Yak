"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Map, User, PlusSquare, Briefcase, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'Feed', icon: Home },
        { href: '/communities', label: 'Herds', icon: Map },
        { href: '/compose', label: 'Post', icon: PlusSquare },
        { href: '/business', label: 'Biz', icon: Briefcase },
        { href: '/me', label: 'Me', icon: User },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t z-50 py-2 safe-p-b">
            <div className="flex justify-around items-center h-16 max-w-4xl mx-auto px-4">

                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors group",
                                isActive ? "text-cyan-500" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] uppercase font-bold tracking-wide">{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
