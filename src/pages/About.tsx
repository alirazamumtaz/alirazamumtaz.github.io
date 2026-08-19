import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  Copy,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Rss,
  Twitter,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * About (/about) — design/about.md.
 * Portrait + bio + focus areas + elsewhere/contact + colophon.
 * syst3mfailure-style restraint; one Newsreader serif pull-quote as the
 * only flourish. CSS-var tokens only; both themes; subtle fades only.
 */

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const EMAIL = 'elirazamumtaz@gmail.com'
const REPO_URL = 'https://github.com/locus-x64/locus-x64.github.io'

const FOCUS_AREAS: { term: string; definition: string }[] = [
  {
    term: 'Vulnerability Research',
    definition:
      'Root-cause analysis and n-day reconstruction: baseband firmware, C libraries, deserialization paths.',
  },
  {
    term: 'Exploit Development',
    definition:
      'From crash to controlled execution: heap feng shui, post-exploitation techniques, Android and Linux targets.',
  },
  {
    term: 'Reverse Engineering',
    definition:
      'Static and dynamic analysis of closed-source binaries; IDA/Ghidra workflows, protocol and parser teardowns.',
  },
]

interface ElsewhereLink {
  icon: LucideIcon
  label: string
  value: string
  href: string
  external: boolean
}

const ELSEWHERE: ElsewhereLink[] = [
  {
    icon: Github,
    label: 'GitHub',
    value: 'github.com/locus-x64',
    href: 'https://github.com/locus-x64',
    external: true,
  },
  {
    icon: Linkedin,
    label: 'LinkedIn',
    value: 'linkedin.com/in/locus-x64',
    href: 'https://linkedin.com/in/locus-x64',
    external: true,
  },
  {
    icon: Twitter,
    label: 'X (Twitter)',
    value: '@locus_x64',
    href: 'https://twitter.com/locus_x64',
    external: true,
  },
]

/** Copy-email ghost mini-button — feedback per design.md §5 (check + "Copied", 1.6s). */
function CopyEmailButton() {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      // clipboard API unavailable (e.g. insecure context) — select-less fallback
      const ta = document.createElement('textarea')
      ta.value = EMAIL
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void copy()
      }}
      aria-label={copied ? 'Email address copied' : 'Copy email address'}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[12px] font-medium text-ink-muted transition-colors duration-150 hover:border-border-strong hover:bg-bg-subtle hover:text-ink"
    >
      {copied ? (
        <Check size={13} aria-hidden="true" className="text-accent" />
      ) : (
        <Copy size={13} aria-hidden="true" />
      )}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export default function About() {
  const reduce = useReducedMotion()

  useEffect(() => {
    document.title = 'About · Ali Raza (locus-x64)'
  }, [])

  const rise = (delay = 0) =>
    reduce
      ? { initial: false, animate: { opacity: 1 }, transition: { duration: 0.15, delay } }
      : {
          initial: false,
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.26, delay, ease: EASE },
        }

  const inView = (delay = 0, _y = 16, duration = 0.3) =>
    reduce
      ? {
          initial: false,
          whileInView: { opacity: 1 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration: 0.15, delay },
        }
      : {
          initial: false,
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-60px' },
          transition: { duration, delay, ease: EASE },
        }

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-6">
      {/* ---------- Section 1 — Header ---------- */}
      <header className="flex flex-col gap-6 pt-10 pb-8 sm:flex-row sm:items-center sm:pt-14 sm:pb-10">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="shrink-0"
        >
          <div className="rounded-full border border-border bg-bg p-1">
            <img
              src="/images/avatar.jpg"
              alt="Portrait of Ali Raza"
              width={128}
              height={128}
              className="size-24 rounded-full sm:size-32"
            />
          </div>
        </motion.div>
        <div>
          <motion.h1
            {...rise(0.08)}
            className="font-display text-h1-sm text-ink sm:text-h1"
          >
            Ali Raza
          </motion.h1>
          <motion.p {...rise(0.14)} className="mt-2 font-mono text-[14px] text-ink-muted">
            @locus-x64
          </motion.p>
          <motion.p {...rise(0.2)} className="mt-1.5 text-[15.5px] text-ink-secondary">
            Independent security researcher.
          </motion.p>
        </div>
      </header>

      {/* ---------- Section 2 — Bio + pull-quote ---------- */}
      <section className="hairline-t py-8">
        <div className="max-w-reading text-body-sm text-ink sm:text-body">
          <motion.p {...inView(0)}>
            I'm Ali Raza. I do vulnerability research, exploit development, and
            reverse engineering. Most of my time goes into reading other people's
            code and firmware: C/C++ userland, the Linux kernel, and cellular
            basebands.
          </motion.p>
          <motion.p {...inView(0.08)} className="mt-5">
            My published work includes an n-day reconstruction of a Samsung Shannon
            baseband heap overflow (CVE-2020-25279), an RCE in python-socketio's
            pickle deserialization path (CVE-2025-61765), and arbitrary code
            execution in zlog (CVE-2024-22857). I also build tooling, most
            recently a taint-analysis engine for Python, and contribute patches
            and advisories back to open source.
          </motion.p>
          <motion.p {...inView(0.16)} className="mt-5">
            This site is where I write things down: root-cause analyses,
            exploitation techniques, and the occasional how-to. Everything here is
            my own work and my own opinion.
          </motion.p>
        </div>
      </section>

      {/* ---------- Section 3 — Focus areas ---------- */}
      <section className="hairline-t py-8">
        <h2 className="mb-6 font-display text-h2-sm text-ink sm:text-h2">
          What I work on
        </h2>
        <dl>
          {FOCUS_AREAS.map((area, i) => (
            <motion.div
              key={area.term}
              {...inView(i * 0.07, 12, 0.26)}
              className="grid gap-1.5 border-t border-border py-5 first:border-t-0 first:pt-0 sm:grid-cols-[180px_1fr] sm:gap-6"
            >
              <dt className="flex items-center gap-2.5 text-[15.5px] font-semibold text-ink">
                <span
                  aria-hidden="true"
                  className="size-1.5 shrink-0 rounded-full bg-accent"
                />
                {area.term}
              </dt>
              <dd className="text-[15px] text-ink-secondary">{area.definition}</dd>
            </motion.div>
          ))}
        </dl>
      </section>

      {/* ---------- Section 4 — Elsewhere / contact ---------- */}
      <section className="hairline-t py-8">
        <h2 className="mb-6 font-display text-h2-sm text-ink sm:text-h2">
          Elsewhere
        </h2>
        <ul>
          {ELSEWHERE.map((link, i) => (
            <motion.li
              key={link.label}
              {...inView(i * 0.05, 10, 0.22)}
              className="border-t border-border first:border-t-0"
            >
              <a
                href={link.href}
                {...(link.external
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className="group -mx-3 flex items-center gap-3 rounded-md px-3 py-3 transition-colors duration-150 hover:bg-bg-subtle"
              >
                <link.icon
                  size={18}
                  aria-hidden="true"
                  className="shrink-0 text-ink-muted"
                />
                <span className="text-[15px] font-medium text-ink transition-colors duration-150 group-hover:text-accent">
                  {link.label}
                </span>
                <span className="truncate font-mono text-[13px] text-ink-muted">
                  {link.value}
                </span>
                <ExternalLink
                  size={15}
                  aria-hidden="true"
                  className="ml-auto shrink-0 text-ink-muted"
                />
              </a>
            </motion.li>
          ))}

          {/* Email — row is the mailto; Copy button stop-propagates */}
          <motion.li
            {...inView(ELSEWHERE.length * 0.05, 10, 0.22)}
            className="border-t border-border"
          >
            <a
              href={`mailto:${EMAIL}`}
              className="group -mx-3 flex items-center gap-3 rounded-md px-3 py-3 transition-colors duration-150 hover:bg-bg-subtle"
            >
              <Mail size={18} aria-hidden="true" className="shrink-0 text-ink-muted" />
              <span className="text-[15px] font-medium text-ink transition-colors duration-150 group-hover:text-accent">
                Email
              </span>
              <span className="truncate font-mono text-[13px] text-ink-muted">
                {EMAIL}
              </span>
              <span className="ml-auto shrink-0">
                <CopyEmailButton />
              </span>
            </a>
          </motion.li>

          {/* RSS */}
          <motion.li
            {...inView((ELSEWHERE.length + 1) * 0.05, 10, 0.22)}
            className="border-t border-border"
          >
            <a
              href="/rss.xml"
              className="group -mx-3 flex items-center gap-3 rounded-md px-3 py-3 transition-colors duration-150 hover:bg-bg-subtle"
            >
              <Rss size={18} aria-hidden="true" className="shrink-0 text-ink-muted" />
              <span className="text-[15px] font-medium text-ink transition-colors duration-150 group-hover:text-accent">
                RSS
              </span>
              <span className="truncate font-mono text-[13px] text-ink-muted">
                rss.xml
              </span>
            </a>
          </motion.li>
        </ul>
      </section>

      {/* ---------- Section 5 — Colophon ---------- */}
      <motion.section {...inView(0, 16, 0.25)} className="hairline-t py-8">
        <div className="max-w-[60ch] font-mono text-[12.5px] leading-[1.7] text-ink-muted">
          <p className="mb-2">Built with React, Vite, and Tailwind.</p>
          <p className="mb-2">
            Set in Space Grotesk, Inter, Newsreader, and JetBrains Mono.
          </p>
          <p className="mb-2">
            No trackers, no analytics, no cookies.{' '}
            <a
              href={REPO_URL}
              className="text-accent underline decoration-accent/40 underline-offset-[3px] transition-colors duration-150 hover:text-accent-hover hover:decoration-accent-hover"
            >
              Source on GitHub
            </a>
            .
          </p>
        </div>
      </motion.section>
    </div>
  )
}
