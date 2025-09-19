'use client'

import React from 'react'
import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react'

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    platform: [
      { title: 'AI Tools', href: '/tools' },
      { title: 'Research Papers', href: '/research' },
      { title: 'Learning Center', href: '/learn' },
      { title: 'Career Roadmaps', href: '/careers' },
    ],
    community: [
      { title: 'Forums', href: '/community/forums' },
      { title: 'Q&A', href: '/community/qa' },
      { title: 'Events', href: '/community/events' },
      { title: 'Contributors', href: '/community/contributors' },
    ],
    resources: [
      { title: 'Documentation', href: '/docs' },
      { title: 'API Reference', href: '/api' },
      { title: 'Tutorials', href: '/learn/tutorials' },
      { title: 'Blog', href: '/blog' },
    ],
    company: [
      { title: 'About Us', href: '/about' },
      { title: 'Contact', href: '/contact' },
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
    ],
  }

  const socialLinks = [
    { icon: Github, href: 'https://github.com/aidiscoveryboards', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/aidiscoveryboards', label: 'Twitter' },
    { icon: Linkedin, href: 'https://linkedin.com/company/aidiscoveryboards', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:hello@aidiscoveryboards.com', label: 'Email' },
  ]

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-bold">AI</span>
              </div>
              <span className="font-bold">AI Discovery Boards</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your comprehensive hub for AI tools, research papers, learning resources, 
              career guidance, and community discussions.
            </p>
            <div className="mt-6 flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h3 className="font-semibold text-foreground">Platform</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community links */}
          <div>
            <h3 className="font-semibold text-foreground">Community</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.community.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources links */}
          <div>
            <h3 className="font-semibold text-foreground">Resources</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.title}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {currentYear} AI Discovery Boards. All rights reserved.
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              Made with <Heart className="h-4 w-4 text-red-500" /> for the AI community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer