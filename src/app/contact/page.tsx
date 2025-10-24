'use client'

import React, { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Mail, Github } from 'lucide-react'
import ContactForm from '@/components/forms/ContactForm'
import FeedbackForm from '@/components/forms/FeedbackForm'
import Link from 'next/link'

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<'contact' | 'feedback'>('contact')

  return (
    <MainLayout>
      <section className="py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Contact & Feedback</h1>
          <p className="text-muted-foreground mt-2">Use the tabs below to switch between Contact Us and Feedback.</p>
        </div>

        {/* Quick contact cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 mb-6">
          <Card className="border border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground">
                <Mail className="h-4 w-4" />
                <CardTitle className="text-base">Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Direct support and inquiries</p>
              <a href="mailto:mkparmar.131@gmail.com" className="text-sm font-medium text-primary hover:underline">mkparmar.131@gmail.com</a>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-foreground">
                <Github className="h-4 w-4" />
                <CardTitle className="text-base">GitHub</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Contribute or report issues</p>
              <Link href="https://github.com/mkparmar1" className="text-sm font-medium text-primary hover:underline">github.com/mkparmar1</Link>
            </CardContent>
          </Card>
        </div>

        {/* Tab header */}
        <div className="mb-4 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-2 text-sm -mb-px border-b-2 ${activeTab === 'contact' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              aria-selected={activeTab === 'contact'}
              role="tab"
            >
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-3 py-2 text-sm -mb-px border-b-2 ${activeTab === 'feedback' ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              aria-selected={activeTab === 'feedback'}
              role="tab"
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Single form area */}
        <div role="tabpanel">
          {activeTab === 'contact' ? (
            <ContactForm />
          ) : (
            <FeedbackForm />
          )}
        </div>
      </section>
    </MainLayout>
  )
}