import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
});

function ArrowIcon() {
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 12L12 2M12 2H4M12 2v8" />
      </svg>
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
      <path d="M3 1.5v11l9-5.5L3 1.5z" />
    </svg>
  );
}

export function HeroView2() {
  return (
    <section className="relative min-h-[90vh] w-full overflow-hidden rounded-2xl">
      {/* Full-screen video background — no overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260228_065522_522e2295-ba22-457e-8fdb-fbcd68109c73.mp4"
      />

      {/* Subtle dark scrim for text readability */}
      <div className="absolute inset-0 bg-black/30" />

      {/* ── Navigation Bar ── */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-20 mx-auto mt-5 flex max-w-[1100px] items-center justify-between rounded-[16px] bg-white/95 px-6 py-3 backdrop-blur-md"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
      >
        {/* Logo */}
        <span
          className="text-lg font-bold tracking-tight text-[#222]"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          Logoisum
        </span>

        {/* Center links */}
        <div className="hidden items-center gap-8 md:flex">
          {["About", "Works", "Services", "Testimonial"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-medium text-[#222]/70 transition-colors hover:text-[#222]"
              style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14 }}
            >
              {link}
            </a>
          ))}
        </div>

        {/* CTA */}
        <button
          className="flex items-center gap-2 rounded-full bg-[#222] px-5 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          Book A Free Meeting
          <ArrowIcon />
        </button>
      </motion.nav>

      {/* ── Hero Content ── */}
      <div className="relative z-10 mx-auto flex max-w-[1100px] flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        {/* Headline */}
        <motion.h1 {...fadeUp(0.15)} className="text-white">
          <span
            className="block leading-[1.1] tracking-[-4px]"
            style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 600, fontSize: 72 }}
          >
            Agency that makes your
          </span>
          <span
            className="mt-1 block leading-[1.05]"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 84,
            }}
          >
            videos &amp; reels viral
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...fadeUp(0.3)}
          className="mt-6 max-w-lg text-center text-white/80"
          style={{ fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 18 }}
        >
          Short-form video editing for Influencers, Creators and Brands
        </motion.p>

        {/* Secondary CTA */}
        <motion.button
          {...fadeUp(0.45)}
          className="mt-10 flex items-center gap-3 rounded-full bg-white px-8 py-4 text-base font-semibold text-[#222] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ fontFamily: "'Barlow', sans-serif" }}
        >
          <PlayIcon />
          See Our Workreel
        </motion.button>
      </div>
    </section>
  );
}
