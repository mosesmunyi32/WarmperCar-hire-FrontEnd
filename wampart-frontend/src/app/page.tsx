"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Users,
  MapPin,
  CheckCircle,
  ArrowRight,
  Star,
  ChevronDown,
  Search,
  ClipboardList,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 42, startDelay = 900) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let outer: ReturnType<typeof setTimeout>;
    outer = setTimeout(() => {
      let i = 0;
      const tick = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(tick);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(tick);
    }, startDelay);
    return () => clearTimeout(outer);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ─── Scroll-reveal wrapper ────────────────────────────────────────────────────
function AnimateIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(36px)",
        transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────
const FEATURED_CARS = [
  { name: "Toyota Corolla", year: 2023, price: 3500, fuel: "Petrol", seats: 5, rating: 4.8 },
  { name: "BMW X5",         year: 2024, price: 8000, fuel: "Diesel", seats: 7, rating: 4.9 },
  { name: "Mercedes C-Class", year: 2023, price: 12000, fuel: "Petrol", seats: 5, rating: 5.0 },
];

const STEPS = [
  { step: "01", emoji: "🔍", title: "Choose Your Car", desc: "Browse our curated fleet and find the vehicle that suits your journey perfectly." },
  { step: "02", emoji: "📋", title: "Book in Seconds",  desc: "Complete your booking online in minutes — no paperwork, no hassle." },
  { step: "03", emoji: "🚗", title: "Hit the Road",     desc: "Collect your keys and experience Kenya from behind the wheel in style." },
];

const FEATURES = [
  "Well Maintained & Inspected Fleet",
  "Affordable & Transparent Pricing",
  "24/7 Customer Support",
  "Easy Online Booking",
  "Flexible Rental Periods",
  "Comprehensive Insurance",
];

const HEADLINE = "Hire the Best Car for Your Journey";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { displayed, done } = useTypewriter(HEADLINE, 42, 900);
  const [activeTab, setActiveTab] = useState<"fleet" | "steps">("fleet");

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <Navbar />

      {/* ══════════════════════════════════════════════════
          HERO — full viewport, Ken Burns image, typewriter
         ══════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden"
        style={{ height: "calc(100svh - 4rem)", minHeight: 560 }}>

        {/* Background image — Ken Burns zoom creates the sense of forward motion */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/Image.png"
            fill
            alt="Open road leading to the mountains"
            className="object-cover object-center ken-burns"
            priority
          />
          {/* Layered overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-black/25 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto w-full">

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/70 text-sm font-medium mb-8 fade-in-down">
            <span className="h-1.5 w-1.5 bg-gold rounded-full animate-pulse" />
            Premium Car Hire · Kenya
          </div>

          {/* Typewriter headline — road lines converge exactly here at the "horizon" */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.08] mb-6 tracking-tight min-h-[2.2em] md:min-h-[1.5em]">
            {displayed}
            <span
              className={`inline-block w-[3px] h-[0.85em] bg-gold ml-1 align-middle rounded-sm ${done ? "cursor-blink" : ""}`}
            />
          </h1>

          {/* Sub-copy — fades in after typewriter finishes */}
          <p
            className="text-white/55 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed transition-all duration-1000"
            style={{
              opacity: done ? 1 : 0,
              transform: done ? "translateY(0)" : "translateY(12px)",
              transitionDelay: "200ms",
            }}
          >
            Every great journey starts with the right car. Drive in style,
            arrive in confidence — wherever the road takes you.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap justify-center gap-4 transition-all duration-700"
            style={{
              opacity: done ? 1 : 0,
              transform: done ? "translateY(0)" : "translateY(16px)",
              transitionDelay: "500ms",
            }}
          >
            <Link href="/cars">
              <Button className="bg-gold text-navy hover:bg-gold/90 font-bold h-12 px-8 gap-2 text-base shadow-xl shadow-gold/25 rounded-xl">
                Book Your Car <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                className="bg-white text-navy hover:bg-white/90 font-bold h-12 px-8 text-base rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
              >
                How It Works
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 transition-all duration-700"
          style={{
            opacity: done ? 1 : 0,
            transitionDelay: "900ms",
          }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4 scroll-bounce" />
        </div>

        {/* Bottom perspective wedge — echoes the road's vanishing point */}
        <div className="absolute bottom-0 inset-x-0 h-16 overflow-hidden pointer-events-none">
          <svg
            viewBox="0 0 1440 64"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path d="M720 0 L0 64 L1440 64 Z" fill="#0A1628" fillOpacity="0.7" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          STATS BAR
         ══════════════════════════════════════════════════ */}
      <section className="bg-navy border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 divide-x divide-white/8">
            {[
              { icon: Car,   label: "Premium Cars",    value: "50+" },
              { icon: Users, label: "Happy Customers", value: "1,000+" },
              { icon: MapPin, label: "Coverage",       value: "Nairobi" },
            ].map(({ icon: Icon, label, value }) => (
              <AnimateIn key={label} className="flex items-center justify-center gap-3 px-4 py-2">
                <Icon className="h-5 w-5 text-gold hidden sm:block shrink-0" />
                <div className="text-center sm:text-left">
                  <p className="text-white font-bold text-xl">{value}</p>
                  <p className="text-white/35 text-xs">{label}</p>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FLEET + HOW IT WORKS — tabbed
         ══════════════════════════════════════════════════ */}
      <section id="how-it-works" className="bg-off-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <AnimateIn className="text-center mb-10">
            <p className="text-royal text-xs font-bold tracking-[0.25em] uppercase mb-3">
              Explore &amp; Book
            </p>
            <h2 className="text-4xl font-black text-navy">Your Journey Starts Here</h2>
            <p className="text-muted-foreground mt-2">Browse our fleet or learn how booking works</p>
          </AnimateIn>

          {/* Tab pills */}
          <AnimateIn className="flex justify-center mb-12">
            <div className="inline-flex rounded-2xl bg-white border border-light-gray p-1.5 shadow-sm gap-1">
              <button
                onClick={() => setActiveTab("fleet")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === "fleet"
                    ? "bg-navy text-white shadow-md scale-[1.02]"
                    : "text-navy/50 hover:text-navy hover:bg-navy/5"
                }`}
              >
                <Search className="h-4 w-4" /> Our Fleet
              </button>
              <button
                onClick={() => setActiveTab("steps")}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === "steps"
                    ? "bg-navy text-white shadow-md scale-[1.02]"
                    : "text-navy/50 hover:text-navy hover:bg-navy/5"
                }`}
              >
                <ClipboardList className="h-4 w-4" /> How to Book
              </button>
            </div>
          </AnimateIn>

          {/* Fleet tab */}
          {activeTab === "fleet" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURED_CARS.map((car, i) => (
                  <AnimateIn key={car.name} delay={i * 100}>
                    <div className="rounded-2xl border border-light-gray overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 hover:scale-[1.02]">
                      <div className="bg-gradient-to-br from-navy to-royal h-52 flex items-center justify-center relative overflow-hidden">
                        <Car className="h-32 w-32 text-white/5 absolute group-hover:scale-110 transition-transform duration-700" />
                        <Car className="h-20 w-20 text-white/25 relative z-10" />
                        <span className="absolute top-3 left-3 bg-success text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          Available
                        </span>
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs text-white">
                          <Star className="h-3 w-3 text-gold fill-gold" />
                          {car.rating}
                        </div>
                        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-navy text-lg">{car.name}</h3>
                        <p className="text-muted-foreground text-xs mb-4">
                          {car.year} · {car.fuel} · {car.seats} seats
                        </p>
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-royal font-black text-2xl">
                              KES {car.price.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground text-xs"> /day</span>
                          </div>
                          <Link href="/cars">
                            <Button
                              size="sm"
                              className="bg-navy text-white hover:bg-royal gap-1 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              Book Now <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </AnimateIn>
                ))}
              </div>
              <AnimateIn className="text-center mt-10">
                <Link href="/cars">
                  <Button
                    variant="outline"
                    className="border-navy text-navy hover:bg-navy hover:text-white gap-2 h-11 px-8 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    View Full Fleet <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </AnimateIn>
            </>
          )}

          {/* How to Book tab */}
          {activeTab === "steps" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-14 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px bg-gradient-to-r from-transparent via-royal/25 to-transparent" />
              {STEPS.map((s, i) => (
                <AnimateIn key={s.step} delay={i * 140}>
                  <div className="relative flex flex-col items-center text-center bg-white p-8 rounded-2xl border border-light-gray shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] group">
                    <span className="absolute top-5 right-6 text-5xl font-black text-navy/5 select-none">
                      {s.step}
                    </span>
                    <div className="h-16 w-16 rounded-2xl bg-navy flex items-center justify-center text-2xl mb-5 shadow-lg shadow-navy/20 group-hover:bg-royal transition-all duration-300">
                      {s.emoji}
                    </div>
                    <h3 className="font-bold text-navy text-lg mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          WHY CHOOSE US — image reused as bg for continuity
         ══════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/Image.png"
            fill
            alt=""
            className="object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-navy/88" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <AnimateIn>
              <p className="text-gold text-xs font-bold tracking-[0.25em] uppercase mb-3">
                Why Us
              </p>
              <h2 className="text-4xl font-black text-white mb-4">
                Why Choose Wampart?
              </h2>
              <p className="text-white/45 leading-relaxed mb-8 max-w-md">
                We are committed to delivering the finest car hire experience in
                Kenya — from our premium fleet to our seamless, transparent
                booking process.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
                      <CheckCircle className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-white/65 text-sm">{f}</span>
                  </div>
                ))}
              </div>

              <Link href="/register">
                <Button className="bg-gold text-navy hover:bg-gold/90 font-bold h-11 px-8 gap-2 rounded-xl shadow-lg shadow-gold/20">
                  Start Your Journey <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </AnimateIn>

            <AnimateIn delay={180}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Cars Available",   value: "50+",    emoji: "🚗" },
                  { label: "Happy Clients",    value: "1,000+", emoji: "😊" },
                  { label: "Years Experience", value: "5+",     emoji: "⭐" },
                  { label: "Satisfaction Rate",value: "98%",    emoji: "✅" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="backdrop-blur-sm bg-white/[0.05] border border-white/[0.08] rounded-2xl p-6 text-center hover:bg-white/[0.09] transition-colors"
                  >
                    <div className="text-3xl mb-3">{stat.emoji}</div>
                    <p className="text-white font-black text-3xl">{stat.value}</p>
                    <p className="text-white/35 text-xs mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BANNER
         ══════════════════════════════════════════════════ */}
      <section className="bg-gold py-20">
        <AnimateIn className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-navy mb-4">
            Ready to Hit the Road?
          </h2>
          <p className="text-navy/55 text-lg mb-10 max-w-xl mx-auto">
            Your perfect car is waiting. Book now and experience Kenya the way
            it was meant to be seen.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/cars">
              <Button className="bg-navy text-white hover:bg-royal font-bold h-12 px-10 gap-2 text-base rounded-xl shadow-lg shadow-navy/30">
                Browse Our Fleet <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="outline"
                className="border-navy/25 text-navy hover:bg-navy/8 h-12 px-10 text-base font-bold rounded-xl"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </AnimateIn>
      </section>

      <Footer />
    </div>
  );
}
