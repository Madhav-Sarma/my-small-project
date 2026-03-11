import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
});

export function HeroView1() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden rounded-2xl bg-white">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover [transform:scaleY(-1)]"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260302_085640_276ea93b-d7da-4418-a09b-2aa5b490e838.mp4"
      />

      {/* White gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[26.416%] from-[rgba(255,255,255,0)] to-[66.943%] to-white" />

      {/* Content */}
      <div
        className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center gap-8 px-6"
        style={{ paddingTop: 290 }}
      >
        {/* Heading */}
        <motion.h1
          {...fadeUp(0)}
          className="text-center leading-[1.05] tracking-[-0.04em] text-black"
          style={{ fontFamily: "'Geist', system-ui, sans-serif", fontWeight: 500, fontSize: 80 }}
        >
          Simple{" "}
          <span
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 100,
            }}
          >
            management
          </span>
          <br />
          for your remote team
        </motion.h1>

        {/* Description */}
        <motion.p
          {...fadeUp(0.15)}
          className="max-w-[554px] text-center leading-relaxed"
          style={{
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: 18,
            color: "#373a46",
            opacity: 0.8,
          }}
        >
          Streamline collaboration, track progress, and empower your distributed
          team — all from one beautifully simple workspace.
        </motion.p>

        {/* Email input + CTA */}
        <motion.div
          {...fadeUp(0.3)}
          className="flex w-full max-w-[480px] items-center gap-2 rounded-[40px] border border-black/[0.06] bg-[#fcfcfc] px-2 py-2"
          style={{ boxShadow: "0px 10px 40px 5px rgba(194,194,194,0.25)" }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-transparent px-5 py-2.5 text-sm text-black/80 outline-none placeholder:text-black/30"
            style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
          />
          <button
            className="shrink-0 rounded-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] px-7 py-3 text-sm font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{
              fontFamily: "'Geist', system-ui, sans-serif",
              boxShadow:
                "inset -4px -6px 25px 0px rgba(201,201,201,0.08), inset 4px 4px 10px 0px rgba(29,29,29,0.24)",
            }}
          >
            Create Free Account
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div {...fadeUp(0.42)} className="flex items-center gap-3 pt-1">
          {/* Star row */}
          <div className="flex -space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="h-4 w-4 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span
            className="text-sm font-medium text-black/60"
            style={{ fontFamily: "'Geist', system-ui, sans-serif" }}
          >
            1,020+ Reviews
          </span>
          {/* Mini brand dots */}
          <div className="flex gap-1.5 pl-2">
            {["#4285F4", "#34A853", "#EA4335", "#FBBC05"].map((c) => (
              <span
                key={c}
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
