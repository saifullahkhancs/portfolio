import { assets, profile } from "@/data/portfolio";
import { useState, useEffect } from "react";

export default function IDCard() {
  const [isDropped, setIsDropped] = useState(false);
  const [showNail, setShowNail] = useState(false);
  const [caughtOnNail, setCaughtOnNail] = useState(false);
  const [isSwaying, setIsSwaying] = useState(false);

  useEffect(() => {
    // Start free-fall animation after component mounts
    const dropTimer = setTimeout(() => {
      setIsDropped(true);
    }, 100);

    // Show nail at top
    const nailTimer = setTimeout(() => {
      setShowNail(true);
    }, 2000);

    // Apex of strips catches nail
    const catchTimer = setTimeout(() => {
      setCaughtOnNail(true);
    }, 2500);

    // Card swings to rest after catching
    const swayTimer = setTimeout(() => {
      setIsSwaying(true);
    }, 2600);

    return () => {
      clearTimeout(dropTimer);
      clearTimeout(nailTimer);
      clearTimeout(catchTimer);
      clearTimeout(swayTimer);
    };
  }, []);

  return (
    <div className="relative h-96 w-56">
      {/* Nail at top */}
      <div 
        className={`absolute left-1/2 top-0 -translate-x-1/2 transition-all duration-300 z-20 ${
          showNail ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
        }`}
      >
        <div className="relative">
          {/* Metal ring */}
          <div className="h-4 w-4 rounded-full border-2 border-gray-400 bg-gray-200" />
          {/* Blue thumbtack head */}
          <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-md" />
          {/* Nail body */}
          <div className="ml-1.5 h-2 w-1 bg-gray-500" />
        </div>
      </div>

      {/* Card assembly with strips */}
      <div 
        className={`absolute left-1/2 top-0 -translate-x-1/2 transition-all duration-[2000ms] ease-out ${
          isDropped ? 'translate-y-0' : '-translate-y-[400px]'
        } ${isSwaying ? 'animate-sway' : ''}`}
      >
        {/* Strips container - positioned to create triangle */}
        <div className="relative top-0 left-1/2 -translate-x-1/2">
          {/* Left strip - connects from apex to left attachment point */}
          <div 
            className={`absolute top-0 left-1/2 z-10 transition-all duration-500 ${
              caughtOnNail ? 'opacity-100' : 'opacity-100'
            } ${isDropped && !caughtOnNail ? 'animate-flutter' : ''}`}
            style={{ 
              width: '5px',
              height: '160px',
              background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transformOrigin: 'top center',
              transform: caughtOnNail 
                ? 'translateX(-50%) rotate(30deg) translateX(-35px)' 
                : 'translateX(-50%) rotate(-8deg) translateX(-35px)'
            }}
          />

          {/* Right strip - connects from apex to right attachment point */}
          <div 
            className={`absolute top-0 left-1/2 z-10 transition-all duration-500 ${
              caughtOnNail ? 'opacity-100' : 'opacity-100'
            } ${isDropped && !caughtOnNail ? 'animate-flutter-right' : ''}`}
            style={{ 
              width: '5px',
              height: '160px',
              background: 'linear-gradient(to bottom, #ffffff, #f8f8f8)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              transformOrigin: 'top center',
              transform: caughtOnNail 
                ? 'translateX(-50%) rotate(-30deg) translateX(35px)' 
                : 'translateX(-50%) rotate(8deg) translateX(35px)'
            }}
          />

          {/* Apex connection point where strips meet */}
          <div 
            className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              caughtOnNail ? 'opacity-100 scale-100' : 'opacity-80 scale-90'
            }`}
            style={{ zIndex: 15 }}
          >
            <div className="h-2 w-2 rounded-full bg-white border border-gray-300 shadow-sm" />
          </div>
        </div>

        {/* Plastic holder with card */}
        <div className="absolute left-1/2 top-40 -translate-x-1/2 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100/70 shadow-2xl" style={{ height: '280px' }}>
          {/* ID Card */}
          <div className="relative m-2 rounded-lg bg-gray-50 p-4 shadow-sm h-full">
            {/* Profile image - larger for future full-body */}
            <div className="mx-auto mb-3 h-32 w-32 overflow-hidden rounded-full bg-gray-200 flex items-center justify-center sm:h-40 sm:w-40">
              <img
                src={assets.portrait}
                alt="Portrait of Saifullah Khan"
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* ID number and email */}
            <div className="space-y-1 font-mono text-[10px] text-gray-700 sm:text-xs">
              <div className="flex justify-between">
                <span className="text-blue-600">Id No:</span>
                <span>SE-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600">Email:</span>
                <span className="truncate max-w-[100px]">{profile.email}</span>
              </div>
            </div>
          </div>

          {/* Two attachment points for strips - positioned to align with strip ends */}
          <div className="absolute left-2 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-2 border-gray-400 shadow-md z-20" />
          <div className="absolute right-2 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-2 border-gray-400 shadow-md z-20" />
        </div>
      </div>
    </div>
  );
}
