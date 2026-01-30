"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Map, User, PlusSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileNav() {
    const pathname = usePathname()

    const links = [
        { href: '/', label: 'Feed', icon: Home },
        { href: '/explore', label: 'Explore', icon: Search },
        { href: '/compose', label: 'Post', icon: PlusSquare },
        { href: '/communities', label: 'Herds', icon: Map },
        { href: '/me', label: 'Me', icon: User },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-white pb-safe pt-2 z-50">
            <div className="flex justify-around items-center h-14">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                                isActive ? "text-cyan-500" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
