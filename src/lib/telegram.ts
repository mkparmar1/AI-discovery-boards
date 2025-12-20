import { NextRequest } from 'next/server'
import { UAParser } from 'ua-parser-js'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID = process.env.TELEGRAM_CHAT_ID

function ensureEnv() {
  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not set')
  }
}

export async function sendTelegramMessage(html: string) {
  ensureEnv()
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
  const payload = {
    chat_id: CHAT_ID,
    text: html,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    console.error('Failed to send Telegram message', res.status, errText)
  }
}

function formatDeviceInfo(userAgent: string) {
  try {
    const parser = new UAParser(userAgent)
    const os = parser.getOS()
    const browser = parser.getBrowser()
    const osLabel = [os.name, os.version].filter(Boolean).join(' ')
    const browserLabel = [browser.name, browser.major || browser.version].filter(Boolean).join(' ')
    return `${osLabel || 'Unknown OS'} / ${browserLabel || 'Unknown Browser'}`
  } catch {
    return userAgent || 'unknown'
  }
}

export function getRequestContext(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')
  const ip = (forwarded ? forwarded.split(',')[0].trim() : '') || realIp || cfIp || 'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  const device = formatDeviceInfo(userAgent)
  return { ipAddress: ip, userAgent, device }
}

async function lookupIpLocation(ipAddress: string | null | undefined) {
  if (!ipAddress || ipAddress === 'unknown' || ipAddress === '127.0.0.1') return null
  try {
    const res = await fetch(`https://ipapi.co/${ipAddress}/json/`)
    if (!res.ok) return null
    const data = await res.json().catch(() => null)
    if (!data) return null
    const parts = [data.city, data.region, data.country_name].filter(Boolean)
    return parts.length ? parts.join(', ') : null
  } catch {
    return null
  }
}

function formatTime(date: Date, timeZone?: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: 'numeric', minute: '2-digit', hour12: true,
      timeZone: timeZone || 'Asia/Kolkata'
    }).format(date)
  } catch {
    return date.toISOString()
  }
}

function toIdString(id: unknown): string | null {
  if (id == null) return null
  if (typeof id === 'string') return id
  if (typeof id === 'number') return String(id)
  const maybeToString = (id as { toString?: () => string }).toString
  if (typeof maybeToString === 'function') {
    try {
      return maybeToString.call(id)
    } catch {
      return null
    }
  }
  return null
}

function buildMessage(title: string, details: {
  name?: string | null
  email?: string | null
  userId?: string | null
  ipAddress?: string | null
  device?: string | null
  time?: Date
  location?: string | null
  action?: string | null
}) {
  const lines = [
    `${title}`,
    '━━━━━━━━━━━━━━━━━━━',
    details.name ? `👤 Name: ${details.name}` : '',
    details.email ? `📧 Email: ${details.email}` : '',
    details.userId ? `🆔 User ID: ${details.userId}` : '',
    details.ipAddress ? `🌍 IP: ${details.ipAddress}` : '',
    details.device ? `💻 Device: ${details.device}` : '',
    details.time ? `🕒 Time: ${formatTime(details.time)}` : '',
    details.location ? `📍 Location: ${details.location}` : '',
    details.action ? `⚙️ Action: ${details.action}` : '',
    '🔗 Website: <code>https://www.aidiscoveryboards.info</code>',
    '━━━━━━━━━━━━━━━━━━━'
  ].filter(Boolean)
  return lines.join('\n')
}

export async function sendLoginNotification(user: { _id: unknown, name?: string, email?: string }, request: NextRequest, options?: { suspicious?: boolean }) {
  const ctx = getRequestContext(request)
  const location = await lookupIpLocation(ctx.ipAddress)
  const title = options?.suspicious ? '⚠️ <b>Suspicious Login Detected</b>' : '🚀 <b>New Login Detected</b>'
  const html = buildMessage(title, {
    name: user?.name || null,
    email: user?.email || null,
    userId: toIdString(user?._id),
    ipAddress: ctx.ipAddress || null,
    device: ctx.device || null,
    time: new Date(),
    location: location,
    action: 'Login'
  })
  await sendTelegramMessage(html)
}

export async function sendRegisterNotification(user: { _id: unknown, name?: string, email?: string }, request: NextRequest) {
  const ctx = getRequestContext(request)
  const location = await lookupIpLocation(ctx.ipAddress)
  const html = buildMessage('🎉 <b>New User Registration</b>', {
    name: user?.name || null,
    email: user?.email || null,
    userId: toIdString(user?._id),
    ipAddress: ctx.ipAddress || null,
    device: ctx.device || null,
    time: new Date(),
    location: location,
    action: 'Register'
  })
  await sendTelegramMessage(html)
}

export async function sendUserActionNotification(user: { _id: unknown, name?: string, email?: string }, request: NextRequest, actionName: string) {
  const ctx = getRequestContext(request)
  const location = await lookupIpLocation(ctx.ipAddress)
  const html = buildMessage('📣 <b>User Action</b>', {
    name: user?.name || null,
    email: user?.email || null,
    userId: toIdString(user?._id),
    ipAddress: ctx.ipAddress || null,
    device: ctx.device || null,
    time: new Date(),
    location: location,
    action: actionName
  })
  await sendTelegramMessage(html)
}

export async function sendContactNotification(details: { name?: string | null; email?: string | null; subject?: string | null; message?: string | null }, request: NextRequest) {
  const ctx = getRequestContext(request)
  const location = await lookupIpLocation(ctx.ipAddress)
  const title = '📝 <b>New Contact Submission</b>'
  const maxMsgLen = 500
  const safeMessage = (details.message || '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const messagePreview = safeMessage.length > maxMsgLen ? safeMessage.slice(0, maxMsgLen) + '…' : safeMessage

  const lines = [
    title,
    '━━━━━━━━━━━━━━━━━━━',
    details.name ? `👤 Name: ${details.name}` : '',
    details.email ? `📧 Email: ${details.email}` : '',
    details.subject ? `🧾 Subject: ${details.subject}` : '',
    messagePreview ? `✉️ Message:\n<code>${messagePreview}</code>` : '',
    ctx.ipAddress ? `🌍 IP: ${ctx.ipAddress}` : '',
    ctx.device ? `💻 Device: ${ctx.device}` : '',
    `🕒 Time: ${formatTime(new Date())}`,
    location ? `📍 Location: ${location}` : '',
    '🔗 Website: <code>https://www.aidiscoveryboards.info</code>',
    '━━━━━━━━━━━━━━━━━━━'
  ].filter(Boolean)

  await sendTelegramMessage(lines.join('\n'))
}

export async function sendFeedbackNotification(details: { name?: string | null; email?: string | null; type: 'bug' | 'idea' | 'other'; message: string; pageUrl?: string | null }, request: NextRequest) {
  const ctx = getRequestContext(request)
  const location = await lookupIpLocation(ctx.ipAddress)

  const typeLabel = details.type === 'bug' ? '🐞 Bug' : details.type === 'idea' ? '💡 Idea' : '💬 Other'
  const title = `🗂️ <b>New Feedback</b> — ${typeLabel}`

  const maxMsgLen = 600
  const safeMessage = (details.message || '')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  const messagePreview = safeMessage.length > maxMsgLen ? safeMessage.slice(0, maxMsgLen) + '…' : safeMessage

  const lines = [
    title,
    '━━━━━━━━━━━━━━━━━━━',
    details.name ? `👤 Name: ${details.name}` : '',
    details.email ? `📧 Email: ${details.email}` : '',
    details.pageUrl ? `🔗 Page: <code>${details.pageUrl}</code>` : '',
    messagePreview ? `✉️ Message:\n<code>${messagePreview}</code>` : '',
    ctx.ipAddress ? `🌍 IP: ${ctx.ipAddress}` : '',
    ctx.device ? `💻 Device: ${ctx.device}` : '',
    `🕒 Time: ${formatTime(new Date())}`,
    location ? `📍 Location: ${location}` : '',
    '🔗 Website: <code>https://www.aidiscoveryboards.info</code>',
    '━━━━━━━━━━━━━━━━━━━'
  ].filter(Boolean)

  await sendTelegramMessage(lines.join('\n'))
}