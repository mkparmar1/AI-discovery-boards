"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Mail, User, MessageSquareText, Loader2, CheckCircle2, AlertCircle, Bug, Lightbulb } from 'lucide-react'
import SearchableSelect from "@/components/ui/searchable-select";

interface Props {
  className?: string
}

export default function FeedbackForm({ className }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState<"bug" | "idea" | "other">("idea");
  const [message, setMessage] = useState('')
  const [pageUrl, setPageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Capture current page URL if available
    if (typeof window !== 'undefined') {
      setPageUrl(window.location.href)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (message.trim().length < 10) {
      setError('Feedback must be at least 10 characters long.')
      return
    }
    if (email.trim()) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/
      if (!emailRegex.test(email.trim())) {
        setError('Please provide a valid email address.')
        return
      }
    }

    try {
      setLoading(true)
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type, message, pageUrl })
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit feedback.')
      }

      setSuccess('Thanks! Your feedback is submitted.')
      setName('')
      setEmail('')
      setMessage('')
      setType('idea')
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const typeIcon = type === 'bug' ? <Bug className="h-4 w-4" /> : type === 'idea' ? <Lightbulb className="h-4 w-4" /> : <MessageSquareText className="h-4 w-4" />
  const typeLabel = type === 'bug' ? 'Bug' : type === 'idea' ? 'Idea' : 'Other'

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 text-foreground">
          {typeIcon}
          <CardTitle className="text-base">Submit Feedback ({typeLabel})</CardTitle>
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
              <label className="mb-1 block text-xs text-muted-foreground">Full Name (optional)</label>
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
              <label className="mb-1 block text-xs text-muted-foreground">Email (optional)</label>
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

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Feedback Type</label>
              <SearchableSelect
                value={type}
                onChange={(v) => setType(v as "bug" | "idea" | "other")}
                options={typeOptions}
                placeholder="Select feedback type"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Page (auto)</label>
              <Input
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="Page where you noticed this"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Feedback</label>
            <textarea
              placeholder="Describe the issue or idea…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <CardFooter className="px-0">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  )
}

const typeOptions = [
  {
    value: "idea",
    label: "Idea",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M2 9a10 10 0 1 1 20 0c0 4.5-3 6-5 7-1 1-1 2-1 2H8s0-1-1-2c-2-1-5-2.5-5-7"/></svg>,
  },
  {
    value: "bug",
    label: "Bug",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M8 2v4"/><path d="M16 2v4"/><path d="M8 13v2"/><path d="M16 13v2"/><path d="M3 13h4"/><path d="M17 13h4"/><path d="M12 7a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0v-5a5 5 0 0 0-5-5z"/></svg>,
  },
  {
    value: "other",
    label: "Other",
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M21 15a2 2 0 0 0-2-2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
]