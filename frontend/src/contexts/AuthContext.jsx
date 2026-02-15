import { createContext, useContext, useEffect, useState } from 'react'
import { App } from '@capacitor/app'
import { supabase } from '../supabaseClient'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!supabase) {
            console.warn('Supabase client not initialized. Authentication disabled.')
            setLoading(false)
            return
        }

        // Handle Deep Links (for Android)
        App.addListener('appUrlOpen', (event) => {
            console.log('App opened with URL:', event.url)
            // Extract tokens from the hash fragment
            // URL format: ailegal://login#access_token=...&refresh_token=...
            const hashIndex = event.url.indexOf('#')
            if (hashIndex > -1) {
                const params = new URLSearchParams(event.url.substring(hashIndex + 1))
                const accessToken = params.get('access_token')
                const refreshToken = params.get('refresh_token')

                if (accessToken && refreshToken) {
                    supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken
                    }).then(({ error }) => {
                        if (!error) {
                            // Session set successfully, user logic will update automatically via onAuthStateChange
                            console.log('Session restored from Deep Link')
                        }
                    })
                }
            }
        })

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        }).catch((err) => {
            console.error('Error getting session:', err)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signInWithEmail = async (email, fullName) => {
        if (!supabase) throw new Error("Supabase is not configured.")

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // Use Deep Link for Mobile, Window Origin for Web
                emailRedirectTo: 'ailegal://login',
                data: {
                    full_name: fullName
                }
            }
        })
        if (error) throw error
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signInWithEmail, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext)
}
