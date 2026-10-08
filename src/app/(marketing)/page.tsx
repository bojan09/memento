import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  FolderClosed,
  Image as ImageIcon,
  Link as LinkIcon,
  Quote,
  Search,
  Smartphone,
  StickyNote,
} from "lucide-react";

export const metadata: Metadata = {
  title: { absolute: "memento · Capture now. Find it when it matters." },
  description:
    "Save links, notes and screenshots in one gesture, with a line about why. Find them again from any device.",
};

const FEATURES = [
  {
    icon: LinkIcon,
    title: "One field for everything",
    body: "Paste a link, type a thought or drop a screenshot. Memento works out which it is, so saving takes a second.",
  },
  {
    icon: Quote,
    title: "Remember why",
    body: "Add a one-line reason as you save. It's the first thing you see when you come back months later.",
  },
  {
    icon: Search,
    title: "Find it fast",
    body: "Search titles, notes and reasons across everything you've kept. Group what belongs together into projects.",
  },
];

const STEPS = [
  { title: "Capture", body: "Paste, type or drop. Add why, if you like. Done." },
  { title: "Keep", body: "Everything lands in one calm feed, on your phone and your desktop." },
  { title: "Find", body: "Search or browse by project when the moment comes." },
];

export default function LandingPage() {
  return (
    <>
      <section className="hero site-wrap" aria-labelledby="hero-h">
        <div className="hero-copy">
          <span className="eyebrow">Your second memory</span>
          <h1 id="hero-h">
            Capture now. <span className="muted">Find it when it matters.</span>
          </h1>
          <p className="lede">
            Memento keeps the links, notes and screenshots you mean to come back to, with a line about why you saved
            them.
          </p>
          <div className="hero-cta">
            <Link href="/login" className="btn btn-primary btn-lg">
              Get started
              <ArrowRight className="icon" aria-hidden />
            </Link>
            <a href="#how" className="btn btn-secondary btn-lg">See how it works</a>
          </div>
          <p className="hero-note">
            <Smartphone className="icon-sm" aria-hidden /> Works on your phone and desktop. Sign in with Google.
          </p>
        </div>

        <div className="hero-visual" aria-hidden>
          <article className="mcard hero-card c1">
            <div className="mcard-head">
              <span className="kind"><LinkIcon className="icon" /></span>
              <span className="mcard-src">figma.com</span>
              <time className="mcard-time mono">2 d</time>
            </div>
            <h3>How Figma&apos;s multiplayer technology works</h3>
            <div className="why"><span className="badge badge-user">Your note</span><q>For the sync design at work</q></div>
          </article>
          <article className="mcard hero-card c2">
            <div className="mcard-head">
              <span className="kind"><StickyNote className="icon" /></span>
              <span className="mcard-src">Note</span>
              <time className="mcard-time mono">5 d</time>
            </div>
            <h3>Tile for the backsplash: zellige, matte</h3>
            <div className="tags"><span className="tag">kitchen</span><span className="tag">reno</span></div>
          </article>
          <article className="mcard hero-card c3">
            <div className="mcard-head">
              <span className="kind"><ImageIcon className="icon" /></span>
              <span className="mcard-src">Screenshot</span>
              <time className="mcard-time mono">3 w</time>
            </div>
            <h3>Linear&apos;s onboarding checklist</h3>
            <div className="tags"><span className="tag"><FolderClosed className="icon-sm" />Side project</span></div>
          </article>
        </div>
      </section>

      <section id="features" className="site-section site-wrap" aria-labelledby="features-h">
        <div className="section-intro">
          <span className="eyebrow">Features</span>
          <h2 id="features-h">Less filing. More finding.</h2>
        </div>
        <div className="feature-grid">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="feature">
              <span className="feature-icon"><Icon className="icon" aria-hidden /></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="site-section site-wrap" aria-labelledby="how-h">
        <div className="section-intro">
          <span className="eyebrow">How it works</span>
          <h2 id="how-h">Three steps, no folders.</h2>
        </div>
        <ol className="steps">
          {STEPS.map(({ title, body }, i) => (
            <li key={title} className="step">
              <span className="step-num mono">{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="site-section site-wrap" aria-labelledby="cta-h">
        <div className="cta-band">
          <h2 id="cta-h">Start keeping what matters.</h2>
          <p>Sign in with Google and save your first memory in under a minute.</p>
          <Link href="/login" className="btn btn-primary btn-lg">
            Get started
            <ArrowRight className="icon" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
