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
  [key: string]: any;
};

// Extend the Window interface
declare global {
  interface Window {
    gtag: (
      command: "config" | "event" | "js" | "set",
      targetId: string | Date,
      config?: any
    ) => void;
    dataLayer: any[];
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

// Custom event helpers for portfolio
export const trackProjectView = (projectName: string) => {
  event({
    action: "view_project",
    category: "engagement",
    label: projectName,
  });
};

export const trackContactClick = (method: string) => {
  event({
    action: "contact_click",
    category: "engagement",
    label: method,
  });
};

export const trackBlackHoleComplete = (duration: number) => {
  event({
    action: "blackhole_animation_complete",
    category: "engagement",
    value: duration,
  });
};

export const trackSocialClick = (platform: string) => {
  event({
    action: "social_click",
    category: "engagement",
    label: platform,
  });
};

export const trackScrollDepth = (percentage: number) => {
  event({
    action: "scroll",
    category: "engagement",
    label: `${percentage}%`,
    value: percentage,
  });
};

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      pageview(pathname);
    }
  }, [pathname, searchParams]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    const trackScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledPercentage = Math.round((scrolled / height) * 100);

      if (scrolledPercentage > maxScroll && scrolledPercentage % 25 === 0) {
        maxScroll = scrolledPercentage;
        trackScrollDepth(scrolledPercentage);
      }
    };

    window.addEventListener("scroll", trackScroll);
    return () => window.removeEventListener("scroll", trackScroll);
  }, []);

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
