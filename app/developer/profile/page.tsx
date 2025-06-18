"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to CV Management page
    router.replace('/developer/cv-management')
  }, [router])

  return null
}