"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Car, Menu, X, Bell, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import useAuthStore from "@/store/authStore"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav className="sticky top-0 z-50 bg-navy shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white">
            <Car className="h-7 w-7 text-gold" />
            <span className="text-xl font-bold tracking-tight">WAMPART</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/cars" className="text-sm text-white/80 hover:text-white transition-colors">
              Browse Cars
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="text-sm text-white/80 hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link href="/bookings" className="text-sm text-white/80 hover:text-white transition-colors">
                  My Bookings
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button className="relative text-white/70 hover:text-white">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-danger rounded-full" />
                </button>
                <div className="relative">
                  <button
                    className="flex items-center gap-2 text-sm text-white/80 hover:text-white"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <div className="h-8 w-8 rounded-full bg-royal flex items-center justify-center text-white font-semibold text-xs border-2 border-white/20">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span>{user?.firstName}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-light-gray py-1 z-50">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-foreground hover:bg-off-white">
                        Dashboard
                      </Link>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-off-white">
                        My Profile
                      </Link>
                      <Link href="/bookings" className="block px-4 py-2 text-sm text-foreground hover:bg-off-white">
                        My Bookings
                      </Link>
                      <hr className="my-1 border-light-gray" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gold text-navy hover:bg-gold/90 font-semibold">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white p-1" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 py-4 flex flex-col gap-2">
          <Link href="/cars" className="text-white/80 hover:text-white py-2 text-sm" onClick={() => setIsOpen(false)}>
            Browse Cars
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/dashboard" className="text-white/80 hover:text-white py-2 text-sm" onClick={() => setIsOpen(false)}>
                Dashboard
              </Link>
              <Link href="/bookings" className="text-white/80 hover:text-white py-2 text-sm" onClick={() => setIsOpen(false)}>
                My Bookings
              </Link>
              <Link href="/profile" className="text-white/80 hover:text-white py-2 text-sm" onClick={() => setIsOpen(false)}>
                My Profile
              </Link>
            </>
          )}
          {!isAuthenticated ? (
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className={cn("w-full border-white/20 text-white")}>Login</Button>
              </Link>
              <Link href="/register" className="flex-1" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-gold text-navy font-semibold">Get Started</Button>
              </Link>
            </div>
          ) : (
            <button onClick={handleLogout} className="text-left text-danger py-2 text-sm mt-1">
              Sign Out
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
