"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, User, FileText, MessageSquareText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface Props {
  className?: string
}

export default function ContactForm({ className }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Simple client-side validation
    if (name.trim().length < 2) {
      setError('Please enter your name (min 2 characters).')
      return
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.')
      return
    }
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters long.')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit your message.')
      }

      setSuccess('Thanks! Your message has been received.')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-foreground">
          <MessageSquareText className="h-4 w-4" />
          <CardTitle className="text-base">Send a Message</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-green-700/20 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:border-green-400/20 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>{success}</span>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-red-700/20 bg-red-600/10 px-3 py-2 text-sm text-red-700 dark:border-red-400/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Subject (optional)</label>
            <div className="relative">
              <FileText className="pointer-events-none absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="How can we help?"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Message</label>
            <div className="relative">
              <textarea
                placeholder="Write your message…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>
          <CardFooter className="px-0">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Message'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}