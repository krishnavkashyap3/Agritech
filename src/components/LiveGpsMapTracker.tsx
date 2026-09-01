import React, { useState, useEffect, useRef } from 'react';
import { OrderTransaction } from '../types';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  Phone, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  RotateCw, 
  Play, 
  Pause, 
  Radio, 
  Thermometer, 
  Droplets, 
  Lock, 
  Copy, 
  ExternalLink,
  Layers,
  ChevronRight,
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

interface LiveGpsMapTrackerProps {
  transaction: OrderTransaction;
  onClose?: () => void;
}

interface Waypoint {
  id: string;
  name: string;
  type: 'origin' | 'toll' | 'checkpoint' | 'destination';
  distanceKm: number;
  timeEst: string;
  passed: boolean;
  tollAmount?: number;
  fastTagStatus?: string;
  x: number; // SVG %
  y: number; // SVG %
  notes?: string;
}

export const LiveGpsMapTracker: React.FC<LiveGpsMapTrackerProps> = ({
  transaction,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progressPercent, setProgressPercent] = useState<number>(62); // 0 to 100%
  const [mapTheme, setMapTheme] = useState<'highway' | 'night' | 'terrain'>('highway');
  const [copiedLink, setCopiedLink] = useState(false);
  const [callingDriver, setCallingDriver] = useState(false);
  const [speed, setSpeed] = useState(58); // km/h
  const [coords, setCoords] = useState({
    lat: 19.2183,
    lng: 73.0867,
  });
  const [activeTab, setActiveTab] = useState<'map' | 'sensors' | 'tolls' | 'driver'>('map');

  // Derive realistic origin & destination info
  const originLocation = transaction.sellerName.includes('Karnal') 
    ? 'Karnal Mandi Yard, Haryana' 
    : transaction.sellerName.includes('Nashik') || transaction.sellerName.includes('Patil')
    ? 'Nashik Onion & Agri Terminal, Maharashtra'
    : transaction.sellerName.includes('Malwa')
    ? 'Sehore Grain Mandi, Madhya Pradesh'
    : 'APMC Regional Agri-Hub';

  const destinationLocation = transaction.destination || 'Central Processing Godown';
  const truckNo = transaction.truckNumber || 'MH 12 QX 9821';
  const driverName = transaction.driverName || 'Balwinder Singh';
  const driverContact = transaction.driverPhone || '+91 98220 91823';

  // Dynamic route waypoints
  const waypoints: Waypoint[] = [
    {
      id: 'wp-1',
      name: originLocation,
      type: 'origin',
      distanceKm: 0,
      timeEst: '06:30 AM',
      passed: true,
      x: 10,
      y: 75,
      notes: 'Outward Weighbridge Tare Verified: 16.4 MT',
    },
    {
      id: 'wp-2',
      name: 'APMC Inter-District Checkpost (NH-48)',
      type: 'checkpoint',
      distanceKm: 42,
      timeEst: '08:15 AM',
      passed: true,
      x: 28,
      y: 60,
      notes: 'e-Way Bill & Mandi Cess Part-B Scanned',
    },
    {
      id: 'wp-3',
      name: 'Ghoti Highway Toll Plaza',
      type: 'toll',
      distanceKm: 94,
      timeEst: '10:40 AM',
      passed: true,
      tollAmount: 240,
      fastTagStatus: 'FastTag Debited ₹240',
      x: 48,
      y: 46,
      notes: 'Lane 4 Automatic FASTag Clearance',
    },
    {
      id: 'wp-4',
      name: 'Padgha Expressway Terminal & Waypoint',
      type: 'checkpoint',
      distanceKm: 148,
      timeEst: '12:50 PM',
      passed: progressPercent >= 60,
      x: 68,
      y: 35,
      notes: 'Current Sector: Cruising @ 58 km/h',
    },
    {
      id: 'wp-5',
      name: 'Thane Central Bypass Toll Plaza',
      type: 'toll',
      distanceKm: 185,
      timeEst: '02:15 PM',
      passed: progressPercent >= 85,
      tollAmount: 310,
      fastTagStatus: 'FastTag Scheduled',
      x: 82,
      y: 28,
      notes: 'Approaching Destination Logistics Corridor',
    },
    {
      id: 'wp-6',
      name: destinationLocation,
      type: 'destination',
      distanceKm: 220,
      timeEst: '03:45 PM (ETA)',
      passed: progressPercent >= 99,
      x: 94,
      y: 18,
      notes: 'Inward Unloading Bay Gate No. 4',
    },
  ];

  // Simulation timer for live movement
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 98) return 98;
        return Number((prev + 0.15).toFixed(2));
      });

      // Fluctuate speed slightly
      setSpeed(Math.floor(54 + Math.random() * 8));

      // Jitter coordinates slightly
      setCoords((prev) => ({
        lat: Number((prev.lat + (Math.random() - 0.5) * 0.0003).toFixed(5)),
        lng: Number((prev.lng + (Math.random() - 0.5) * 0.0003).toFixed(5)),
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const totalDistanceKm = 220;
  const currentDistanceKm = Math.round((progressPercent / 100) * totalDistanceKm);
  const remainingDistanceKm = Math.max(0, totalDistanceKm - currentDistanceKm);

  // SVG coordinates for truck
  const currentX = 10 + (progressPercent / 100) * 84;
  // Curve equation roughly matching highway path
  const currentY = 75 - (progressPercent / 100) * 57 + Math.sin((progressPercent / 100) * Math.PI * 2) * 5;

  const handleCopyLink = () => {
    try {
      const trackingUrl = `${window.location.origin}/?track=${transaction.id}&gps=live`;
      navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {}
  };

  const handleCallDriver = () => {
    setCallingDriver(true);
    setTimeout(() => {
      setCallingDriver(false);
    }, 4000);
  };

  const handleAdvanceStep = () => {
    setProgressPercent((prev) => Math.min(98, prev + 10));
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Status Bar */}
      <div className="bg-[#233B2B] text-[#FAF9F6] p-4 rounded-2xl border border-[#3E5C47] shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D4F38] border border-[#3E654B] flex items-center justify-center text-amber-300 relative shadow-inner">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#233B2B] animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-amber-200">
                {truckNo}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE GPS TELEMETRY
              </span>
            </div>
            <p className="text-xs text-[#C6DFC9] flex items-center gap-1 mt-0.5">
              <span>{transaction.cropName}</span> • <span>{transaction.quantityTons} MT</span> • <span>Transporter: {transaction.logisticsPartner}</span>
            </p>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              isPlaying
                ? 'bg-amber-400/20 text-amber-200 border-amber-400/30 hover:bg-amber-400/30'
                : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Sim</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Live</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAdvanceStep}
            title="Simulate truck advancement"
            className="px-3 py-1.5 bg-[#2D4F38] hover:bg-[#1E3727] text-[#FAF9F6] border border-[#3E654B] rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-200" />
            <span>+10% Advance</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className={`relative rounded-3xl overflow-hidden border transition-all duration-300 ${
        mapTheme === 'night' 
          ? 'bg-[#121A15] border-[#233B2B]' 
          : mapTheme === 'terrain'
          ? 'bg-[#EAE5D9] border-[#D5CCBD]'
          : 'bg-[#F2EFE8] border-[#D8D2C4]'
      } shadow-inner min-h-[380px] sm:min-h-[420px] flex flex-col justify-between p-4 sm:p-6`}>
        
        {/* Map Header Overlay */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Corridor Info */}
          <div className="bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-[#D5CCBD] shadow-xs text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#1C1C1C]">
              <Navigation className="w-3.5 h-3.5 text-[#2D4F38]" />
              <span>Corridor: NH-48 / Western Dedicated Freight Corridor</span>
            </div>
            <p className="text-[11px] text-[#7A746B] mt-0.5">
              Active GPS Tracking: 14 Satellites Locked (GLONASS / NavIC Fix)
            </p>
          </div>

          {/* Speed & Heading Gauge */}
          <div className="flex items-center gap-2">
            <div className="bg-[#233B2B] text-white px-3.5 py-1.5 rounded-2xl border border-[#3E5C47] shadow-xs flex items-center gap-2 text-xs">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <div>
                <span className="text-[10px] text-[#A6C5AD] block leading-none">Speed</span>
                <span className="font-mono font-bold text-sm text-amber-200">{speed} km/h</span>
              </div>
            </div>

            {/* Map Theme Toggle */}
            <div className="flex bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-[#D5CCBD] text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setMapTheme('highway')}
                className={`px-2.5 py-1 rounded-xl transition ${mapTheme === 'highway' ? 'bg-[#233B2B] text-white' : 'text-[#5C554B]'}`}
              >
                Day
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('night')}
                className={`px-2.5 py-1 rounded-xl transition ${mapTheme === 'night' ? 'bg-[#233B2B] text-white' : 'text-[#5C554B]'}`}
              >
                Night
              </button>
              <button
                type="button"
                onClick={() => setMapTheme('terrain')}
                className={`px-2.5 py-1 rounded-xl transition ${mapTheme === 'terrain' ? 'bg-[#233B2B] text-white' : 'text-[#5C554B]'}`}
              >
                Terrain
              </button>
            </div>
          </div>
        </div>

        {/* SVG Route Visualization Map Canvas */}
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <svg className="w-full h-full p-6 sm:p-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              {/* Highway Glow */}
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="60%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="passedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background Grid Map Lines */}
            <path
              d="M0,20 Q50,30 100,10 M0,50 Q50,40 100,60 M0,80 Q50,70 100,90"
              stroke={mapTheme === 'night' ? '#1E2D24' : '#E0DACE'}
              strokeWidth="0.5"
              fill="none"
              strokeDasharray="2,3"
            />
            <path
              d="M20,0 Q30,50 10,100 M50,0 Q40,50 60,100 M80,0 Q70,50 90,100"
              stroke={mapTheme === 'night' ? '#1E2D24' : '#E0DACE'}
              strokeWidth="0.5"
              fill="none"
              strokeDasharray="2,3"
            />

            {/* Base Highway Polyline (Full Track) */}
            <path
              d="M 10,75 C 30,65 45,50 68,35 C 78,28 85,22 94,18"
              stroke={mapTheme === 'night' ? '#2A3F33' : '#D1C7B7'}
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Traveled Highway Track (Active) */}
            <path
              d="M 10,75 C 30,65 45,50 68,35 C 78,28 85,22 94,18"
              stroke="url(#routeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="100"
              strokeDashoffset={100 - progressPercent}
              fill="none"
              filter="url(#glow)"
            />

            {/* Waypoint Nodes on Route */}
            {waypoints.map((wp) => (
              <g key={wp.id} className="pointer-events-auto cursor-pointer">
                {/* Node Ring */}
                <circle
                  cx={wp.x}
                  cy={wp.y}
                  r={wp.type === 'origin' || wp.type === 'destination' ? '3.5' : '2.5'}
                  fill={wp.passed ? '#10B981' : mapTheme === 'night' ? '#1E2D24' : '#FFFFFF'}
                  stroke={wp.passed ? '#065F46' : '#8A847A'}
                  strokeWidth="1"
                />
                {wp.passed && (
                  <circle
                    cx={wp.x}
                    cy={wp.y}
                    r="4.5"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="0.5"
                    opacity="0.6"
                  />
                )}
              </g>
            ))}

            {/* Live Moving Truck Node */}
            <g transform={`translate(${currentX}, ${currentY})`}>
              {/* Pulse ripple */}
              <circle cx="0" cy="0" r="5" fill="#3B82F6" opacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="3" fill="#1D4ED8" stroke="#FFFFFF" strokeWidth="0.8" />
            </g>
          </svg>
        </div>

        {/* Interactive Floating Waypoint Cards */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 my-auto pointer-events-auto">
          {/* Origin Card */}
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-emerald-200 shadow-xs space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Origin Mandi</span>
            </div>
            <p className="font-bold text-xs text-[#1C1C1C] truncate">{originLocation}</p>
            <span className="text-[10px] text-[#7A746B] block">Departed: 06:30 AM</span>
          </div>

          {/* Current Highway Status */}
          <div className="bg-[#233B2B] text-white p-2.5 rounded-2xl border border-[#3E5C47] shadow-xs space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-200 uppercase tracking-wider">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Live Location Ping</span>
              </div>
              <span className="font-mono text-[10px] text-[#A6C5AD]">
                {coords.lat}° N, {coords.lng}° E
              </span>
            </div>
            <p className="font-bold text-xs text-amber-100 truncate">
              {progressPercent >= 80 
                ? 'Sector 4: Approaching Consignee Godown Ring Road'
                : progressPercent >= 50
                ? 'Sector 3: Cruising NH-48 Express Corridor (Padgha)'
                : 'Sector 2: Ascending Ghat Highway Transit'}
            </p>
            <div className="flex items-center justify-between text-[10px] text-[#C6DFC9]">
              <span>Traveled: {currentDistanceKm} km</span>
              <span>Remaining: {remainingDistanceKm} km</span>
            </div>
          </div>

          {/* Destination Card */}
          <div className="bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-[#D5CCBD] shadow-xs space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#5C554B] uppercase tracking-wider">
              <MapPin className="w-3 h-3 text-rose-600" />
              <span>Consignee Hub</span>
            </div>
            <p className="font-bold text-xs text-[#1C1C1C] truncate">{destinationLocation}</p>
            <span className="text-[10px] font-bold text-[#2D4F38] block">ETA: 03:45 PM Today</span>
          </div>
        </div>

        {/* Map Bottom Progress Bar & Details */}
        <div className="relative z-10 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-[#D5CCBD] shadow-xs space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#1C1C1C]">Route Completion</span>
              <span className="bg-[#EBF3ED] text-[#233B2B] font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                {progressPercent}% Complete
              </span>
            </div>
            <span className="text-xs font-mono font-semibold text-[#5C554B]">
              {remainingDistanceKm} km to Godown Gate
            </span>
          </div>

          {/* Progress Line */}
          <div className="w-full bg-[#E8E5DF] h-2.5 rounded-full overflow-hidden p-0.5">
            <div 
              className="bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs for Detailed Telemetry & Controls */}
      <div className="bg-white rounded-2xl border border-[#E8E5DF] shadow-xs overflow-hidden">
        <div className="flex border-b border-[#F0ECE1] bg-[#FAF9F6] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 px-4 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-white text-[#1C1C1C] border-b-2 border-[#233B2B] font-bold'
                : 'text-[#5C554B] hover:text-[#1C1C1C]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#2D4F38]" />
            <span>Transit Checkpoints & Milestones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tolls')}
            className={`flex-1 py-3 px-4 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'tolls'
                ? 'bg-white text-[#1C1C1C] border-b-2 border-[#233B2B] font-bold'
                : 'text-[#5C554B] hover:text-[#1C1C1C]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>FASTag & Mandi Toll Passes ({waypoints.filter(w => w.type === 'toll').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sensors')}
            className={`flex-1 py-3 px-4 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'sensors'
                ? 'bg-white text-[#1C1C1C] border-b-2 border-[#233B2B] font-bold'
                : 'text-[#5C554B] hover:text-[#1C1C1C]'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            <span>Cargo IoT & E-Seal Sensors</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('driver')}
            className={`flex-1 py-3 px-4 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'driver'
                ? 'bg-white text-[#1C1C1C] border-b-2 border-[#233B2B] font-bold'
                : 'text-[#5C554B] hover:text-[#1C1C1C]'
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>Driver Hotline & Support</span>
          </button>
        </div>

        {/* Tab 1: Checkpoints Timeline */}
        {activeTab === 'map' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="space-y-3">
              {waypoints.map((wp, idx) => (
                <div 
                  key={wp.id} 
                  className={`flex items-start gap-3 p-3 rounded-xl border transition ${
                    wp.passed 
                      ? 'bg-[#FAF9F6] border-emerald-200' 
                      : 'bg-white border-[#E8E5DF] opacity-75'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                    wp.passed 
                      ? 'bg-[#233B2B] text-amber-200' 
                      : 'bg-[#EAE5D9] text-[#7A746B]'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-bold text-[#1C1C1C] text-xs sm:text-sm">{wp.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        wp.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {wp.passed ? 'PASSED / VERIFIED' : 'UPCOMING'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5C554B]">{wp.notes}</p>
                    <div className="flex items-center gap-3 text-[10px] text-[#7A746B] pt-1">
                      <span>Milestone: <strong>{wp.distanceKm} km</strong></span>
                      <span>Scheduled Time: <strong>{wp.timeEst}</strong></span>
                      {wp.tollAmount && (
                        <span className="text-blue-700 font-semibold">Toll: ₹{wp.tollAmount} (FASTag)</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: FASTag Tolls */}
        {activeTab === 'tolls' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="bg-[#FAF6F0] border border-[#E8DFC8] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#1C1C1C]">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>National Highways Authority of India (NHAI) - Electronic Toll Logs</span>
              </div>
              <p className="text-[11px] text-[#5C554B] leading-relaxed">
                Consignment truck FASTag wallet is pre-funded through KrishiQuant logistics escrow. Automated clearance receipts are synchronized directly from NPCI FASTag servers.
              </p>
            </div>

            <div className="border border-[#E8E5DF] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F1EA] text-[#5C554B] border-b border-[#E8E5DF]">
                  <tr>
                    <th className="p-3">Toll Plaza / Plaza ID</th>
                    <th className="p-3">Highway</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E5DF]">
                  <tr>
                    <td className="p-3 font-semibold text-[#1C1C1C]">Ghoti Toll Plaza (PLZ-8812)</td>
                    <td className="p-3">NH-48 Corridor</td>
                    <td className="p-3 font-mono font-bold">₹240</td>
                    <td className="p-3">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        DEBITED SUCCESS
                      </span>
                    </td>
                    <td className="p-3 text-right text-[#7A746B] font-mono">10:40 AM</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#1C1C1C]">Thane Central Bypass (PLZ-9904)</td>
                    <td className="p-3">NH-48 Corridor</td>
                    <td className="p-3 font-mono font-bold">₹310</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        SCHEDULED INBOUND
                      </span>
                    </td>
                    <td className="p-3 text-right text-[#7A746B] font-mono">02:15 PM (Est)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Cargo IoT Sensors */}
        {activeTab === 'sensors' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tarpaulin Temp */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E8E5DF] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A746B] text-[11px] font-medium">Cargo Temperature</span>
                  <Thermometer className="w-4 h-4 text-rose-500" />
                </div>
                <div className="text-xl font-bold font-mono text-[#1C1C1C]">24.4°C</div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">
                  Optimal (Grain Safe &lt; 28°C)
                </span>
              </div>

              {/* Relative Humidity */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E8E5DF] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A746B] text-[11px] font-medium">Internal Relative Humidity</span>
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-xl font-bold font-mono text-[#1C1C1C]">51.8%</div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">
                  Dry Safe Standard (Target 50-55%)
                </span>
              </div>

              {/* Electronic Digital E-Seal */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E8E5DF] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A746B] text-[11px] font-medium">Tamper-Proof E-Seal</span>
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-base font-bold font-mono text-emerald-800">E-SEAL #DL-99120</div>
                <span className="text-[10px] text-[#5C554B] block">
                  Status: <strong>LOCKED & INTACT</strong> (0 Tamper Events)
                </span>
              </div>

              {/* Vehicle Shock & Vibration */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E8E5DF] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A746B] text-[11px] font-medium">Road Shock & Vibration</span>
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold font-mono text-[#1C1C1C]">0.22 g</div>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">
                  Smooth Highway Air-Suspension
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Driver Hotline */}
        {activeTab === 'driver' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="bg-[#FAF9F6] border border-[#E8E5DF] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#233B2B] text-amber-200 flex items-center justify-center font-serif font-bold text-lg border border-[#3E5C47]">
                  🚚
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1C1C1C]">{driverName}</h4>
                  <p className="text-xs text-[#5C554B]">Commercial Heavy Vehicle Captain • 12 Yrs Exp</p>
                  <p className="text-[11px] text-[#7A746B] font-mono mt-0.5">{driverContact}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCallDriver}
                  disabled={callingDriver}
                  className="px-4 py-2.5 bg-[#233B2B] hover:bg-[#1B2F22] text-amber-200 rounded-xl text-xs font-semibold transition border border-[#3E5C47] shadow-xs flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{callingDriver ? 'Connecting Direct Line...' : 'Call Driver Now'}</span>
                </button>
              </div>
            </div>

            {callingDriver && (
              <div className="bg-emerald-50 border border-emerald-300 p-3.5 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
                <Phone className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>Simulating bridge call to Captain Balwinder Singh via KrishiQuant Dispatch Switchboard...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
