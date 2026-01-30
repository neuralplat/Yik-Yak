"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Coordinates {
    latitude: number
    longitude: number
}

interface LocationContextType {
    coords: Coordinates | null
    error: string | null
    loading: boolean
    permissionStatus: string
    refreshLocation: () => void
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
    const [coords, setCoords] = useState<Coordinates | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [permissionStatus, setPermissionStatus] = useState<string>('prompt')

    const refreshLocation = () => {
        setLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser")
            setLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
                setLoading(false)
            },
            (err) => {
                setError(err.message)
                setLoading(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )
    }

    useEffect(() => {
        // Check permission status
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                setPermissionStatus(result.state)
                result.onchange = () => {
                    setPermissionStatus(result.state)
                }
            })
        }

        refreshLocation()
    }, [])

    return (
        <LocationContext.Provider value={{ coords, error, loading, permissionStatus, refreshLocation }}>
            {children}
        </LocationContext.Provider>
    )
}

export function useLocation() {
    const context = useContext(LocationContext)
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider')
    }
    return context
}
