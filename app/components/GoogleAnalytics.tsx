// app/components/GoogleAnalytics.tsx
"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Types for GA4 events
type GtagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

// Types for gtag configuration
type GtagConfig = {
  page_path?: string;
  event_category?: string;
  event_label?: string;
  value?: number;
  send_page_view?: boolean;
  anonymize_ip?: boolean;
  cookie_flags?: string;
  link_attribution?: boolean;
  [key: string]: string | number | boolean | undefined;
};

// Extend the Window interface
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: GtagConfig
    ) => void;
    dataLayer: Array<unknown>;
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!;

// Helper function to track page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Helper function to track events
export const event = ({
  action,
  category,
  label,
  value,
  ...parameters
}: GtagEvent) => {
  if (typeof window.gtag !== "undefined") {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      ...parameters,
    });
  }
};

// ==========================================
// VISIT & SOURCE TRACKING
// ==========================================

export const trackVisit = () => {
  if (typeof window === "undefined") return;

  // 1. Check Source
  const referrer = document.referrer;
  let source = "direct";

  if (referrer) {
    if (referrer.includes("google")) {
      source = "google_search";
    } else if (referrer.includes(window.location.hostname)) {
       // internal navigation, usually shouldn't happen on first load unless reload
       source = "internal";
    } else {
      source = "referral_link";
    }
  }

  // 2. Check First Time Visit
  const hasVisited = localStorage.getItem("hasVisitedPortfolio");
  const isFirstTime = !hasVisited;

  if (isFirstTime) {
    localStorage.setItem("hasVisitedPortfolio", "true");
  }

  // 3. Simple Device Check (for convenience)
  const isMobile = window.innerWidth < 768;
  const device = isMobile ? "mobile" : "desktop";

  // Send Event
  event({
    action: "visit",
    category: "traffic",
    label: `source: ${source} | first_time: ${isFirstTime} | device: ${device}`,
    non_interaction: true, // This event doesn't impact bounce rate
  });
};

// ==========================================
// BLACK HOLE ANIMATION TRACKING
// ==========================================

// Track when user MANUALLY CLICKS the black hole (Understood Assignment)
export const trackBlackHoleStartClick = () => {
  event({
    action: "blackhole_manual_click", // Distinct name!
    category: "blackhole_interaction",
    label: "manual_click",
  });
};

// Track when user WAITS for the auto-start (Did not click)
export const trackBlackHoleWait = () => {
  event({
    action: "blackhole_auto_start", // Distinct name!
    category: "blackhole_interaction",
    label: "auto_start",
  });
};

// Track when user skip the transition animation
export const trackBlackHoleSkip = (timeBeforeSkip: number) => {
  event({
    action: "blackhole_skip",
    category: "blackhole_interaction",
    label: "clicked_skip_button",
    value: timeBeforeSkip,
  });
};

// Track when the full black hole animation sequence completes naturally
export const trackBlackHoleComplete = (duration: number) => {
  event({
    action: "blackhole_complete",
    category: "blackhole_interaction", // Consistent category
    value: duration,
  });
};

// ==========================================
// PORTFOLIO ENGAGEMENT TRACKING
// ==========================================

// Track project card interactions
export const trackProjectView = (projectName: string) => {
  event({
    action: "click_project_card",
    category: "engagement",
    label: projectName,
  });
};

// Track contact button clicks
export const trackContactClick = (method: string) => {
  event({
    action: "click_contact_me",
    category: "engagement",
    label: method,
  });
};

// Track Resume download/view click
export const trackResumeClick = () => {
  event({
    action: "click_resume",
    category: "engagement",
    label: "resume_view",
  });
};

// Track social media link clicks
export const trackSocialClick = (platform: string) => {
  event({
    action: "click_social",
    category: "engagement",
    label: platform,
  });
};

// Track scroll to bottom
export const trackScrollBottom = () => {
  event({
    action: "scroll_bottom",
    category: "engagement",
    label: "reached_end",
  });
};

// ==========================================
// MAIN GOOGLE ANALYTICS COMPONENT
// ==========================================

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname, searchParams]);

  // Initial Visit Tracking
  useEffect(() => {
    trackVisit();
  }, []);

  // Track scroll depth & bottom
  useEffect(() => {
    let firedBottomEvent = false;

    const trackScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      
      // Safety check for 0 height
      if (height <= 0) return;

      const scrolledPercentage = (scrolled / height) * 100;

      // Track Bottom Reach (Threshold > 95% is usually good)
      if (!firedBottomEvent && scrolledPercentage > 95) {
        trackScrollBottom();
        firedBottomEvent = true;
      }
    };

    window.addEventListener("scroll", trackScroll);
    return () => window.removeEventListener("scroll", trackScroll);
  }, []);

  // Don't load analytics if no measurement ID
  if (!GA_MEASUREMENT_ID) {
    console.warn("Google Analytics Measurement ID not found");
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: false,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure',
              link_attribution: true,
            });
          `,
        }}
      />
    </>
  );
}
