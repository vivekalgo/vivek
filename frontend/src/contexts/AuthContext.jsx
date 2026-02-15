import { Capacitor } from '@capacitor/core'

// ...

useEffect(() => {
    // ... (check imports)

    // Handle Deep Links (for Android)
    App.addListener('appUrlOpen', (event) => {
        console.log('App opened with URL:', event.url)

        // Handle both hash (#) and query (?) styles
        const url = event.url
        let params = new URLSearchParams()

        if (url.includes('#')) {
            params = new URLSearchParams(url.split('#')[1])
        } else if (url.includes('?')) {
            params = new URLSearchParams(url.split('?')[1])
        }

        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')

        // Also check for error parameters
        const error = params.get('error')
        const errorDescription = params.get('error_description')

        if (error) {
            console.error('Auth error from link:', errorDescription)
            return
        }

        if (accessToken && refreshToken) {
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            }).then(({ error }) => {
                if (!error) {
                    console.log('Session restored from Deep Link')
                    // Reload user to ensure state is fresh
                    supabase.auth.getUser().then(({ data }) => {
                        if (data?.user) setUser(data.user)
                    })
                }
            })
        }
    })

    // ...
}, [])

const signInWithEmail = async (email, fullName) => {
    if (!supabase) throw new Error("Supabase is not configured.")

    const isNative = Capacitor.isNativePlatform()
    const redirectUrl = isNative ? 'ailegal://login' : window.location.origin

    console.log(`Attempting login. Native: ${isNative}, Redirect: ${redirectUrl}`)

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: redirectUrl,
            data: {
                full_name: fullName
            }
        }
    })
    if (error) throw error
}

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

            // Handle both hash (#) and query (?) styles
            const url = event.url
            let params = new URLSearchParams()

            if (url.includes('#')) {
                params = new URLSearchParams(url.split('#')[1])
            } else if (url.includes('?')) {
                params = new URLSearchParams(url.split('?')[1])
            }

            const accessToken = params.get('access_token')
            const refreshToken = params.get('refresh_token')

            if (accessToken && refreshToken) {
                supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                }).then(({ error }) => {
                    if (!error) {
                        supabase.auth.getUser().then(({ data }) => {
                            if (data?.user) setUser(data.user)
                        })
                    }
                })
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
