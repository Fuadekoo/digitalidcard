"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Shield,
  Users,
  FileText,
  CheckCircle,
  TrendingUp,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import useTranslation from "@/hooks/useTranslation";

// Counter Component
function Counter({
  end,
  duration = 2000,
  suffix = "",
}: {
  end: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isVisible, end, duration]);

  return (
    <div ref={counterRef} className="text-4xl font-bold">
      {count}
      {suffix}
    </div>
  );
}

export default function HomeUI() {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section with Flags */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-8 px-6 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-6">
            {/* Oromia Flag */}
            <div className="animate-fade-in-left">
              <div className="relative w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden shadow-2xl border-2 border-white/30 hover:scale-105 transition-transform duration-300">
                <Image
                  src="/oflag.png"
                  alt="Oromia Flag"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Title Section */}
            <div className="flex-1 text-center animate-fade-in-up">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                {t("home.systemTitle")}
              </h1>
              <p className="text-lg md:text-2xl font-semibold mb-1">
                {t("home.systemDescription")}
              </p>
              <p className="text-sm md:text-base text-white/90">
                {t("home.systemDescription")}
              </p>
            </div>

            {/* Ethiopia Flag */}
            <div className="animate-fade-in-right">
              <div className="relative w-24 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden shadow-2xl border-2 border-white/30 hover:scale-105 transition-transform duration-300">
                <Image
                  src="/ethflag.png"
                  alt="Ethiopia Flag"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-8 md:h-12"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C300,60 900,60 1200,0 L1200,120 L0,120 Z"
              fill="white"
              className="animate-wave"
            />
          </svg>
        </div>
      </div>

      {/* Why Choose Our System - Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8 animate-fade-in">
            {t("home.whyChoose")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-up">
              <Counter end={99.9} duration={2500} suffix="%" />
              <div className="text-lg text-white/90 mt-2">
                {t("home.systemUptime")}
              </div>
              <p className="text-sm text-white/70 mt-2">
                {t("home.uptimeDescription")}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-100">
              <div className="text-4xl font-bold text-white">24/7</div>
              <div className="text-lg text-white/90 mt-2">
                {t("home.supportAvailable")}
              </div>
              <p className="text-sm text-white/70 mt-2">
                {t("home.supportDescription")}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-fade-in-up animation-delay-200">
              <Counter end={100} duration={2500} suffix="%" />
              <div className="text-lg text-white/90 mt-2">
                {t("home.dataSecurity")}
              </div>
              <p className="text-sm text-white/70 mt-2">
                {t("home.securityDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* System Logo and Description */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Digital ID Card Management System
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              A comprehensive and secure platform for managing citizen
              identification cards in the East Shawa Zone of Oromia Region. Our
              system streamlines the process of ID card generation,
              verification, and management with cutting-edge technology.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up border-t-4 border-t-blue-500">
            <CardContent className="p-6 space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-blue-600 animate-pulse-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Advanced security measures to protect citizen data with
                encrypted storage and secure authentication protocols.
              </p>
            </CardContent>
          </Card>

          {/* Feature 2 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-100 border-t-4 border-t-green-500">
            <CardContent className="p-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-green-600 animate-pulse-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">User-Friendly</h3>
              <p className="text-gray-600">
                Intuitive interface designed for easy navigation and efficient
                ID card processing for all station personnel.
              </p>
            </CardContent>
          </Card>

          {/* Feature 3 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-200 border-t-4 border-t-purple-500">
            <CardContent className="p-6 space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-purple-600 animate-pulse-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Comprehensive Reports
              </h3>
              <p className="text-gray-600">
                Generate detailed reports and analytics for better
                decision-making and system monitoring.
              </p>
            </CardContent>
          </Card>

          {/* Feature 4 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-300 border-t-4 border-t-orange-500">
            <CardContent className="p-6 space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-orange-600 animate-pulse-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Quality Assurance
              </h3>
              <p className="text-gray-600">
                Multi-level verification process ensures accuracy and quality of
                every ID card issued.
              </p>
            </CardContent>
          </Card>

          {/* Feature 5 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-400 border-t-4 border-t-indigo-500">
            <CardContent className="p-6 space-y-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-indigo-600 animate-pulse-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Real-time Tracking
              </h3>
              <p className="text-gray-600">
                Monitor ID card applications and processing status in real-time
                across all stations.
              </p>
            </CardContent>
          </Card>

          {/* Feature 6 */}
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-fade-in-up animation-delay-500 border-t-4 border-t-red-500">
            <CardContent className="p-6 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-8 h-8 text-red-600 animate-pulse-slow" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Role-Based Access
              </h3>
              <p className="text-gray-600">
                Granular permission system ensures users only access features
                relevant to their role.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Mission */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-white animate-fade-in">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Our Mission</h2>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Our Digital ID Card Management System is built with modern
              technology to serve the citizens of East Shawa Zone efficiently.
              We prioritize security, accessibility, and user experience to
              deliver a world-class identification system that empowers
              communities and ensures reliable citizen services.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25px);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-fade-in-left {
          animation: fade-in-left 0.8s ease-out;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  );
}
