'use client'

import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { signOut } from "next-auth/react"

export function SignOut() {
    const { clearClientCart } = useCart()

    const handleLogout = async () => {
        // 1. Clear the client-side cart state immediately
        clearClientCart()
        
        // 2. Sign out from the server and redirect
        await signOut({ redirectTo: '/signin' })
    }

    return (
        <Button onClick={handleLogout} variant="destructive">
            Logout
        </Button>
    )
}