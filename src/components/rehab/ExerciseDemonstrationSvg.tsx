import React from 'react';

interface ExerciseDemonstrationSvgProps {
  exerciseId: string;
  isPlaying?: boolean;
  speedMultiplier?: number;
  className?: string;
}

export const ExerciseDemonstrationSvg: React.FC<ExerciseDemonstrationSvgProps> = ({
  exerciseId,
  isPlaying = true,
  speedMultiplier = 1,
  className = '',
}) => {
  const dur = (baseSeconds: number) =>
    `${Math.max(0.45, baseSeconds / Math.max(0.5, speedMultiplier)).toFixed(2)}s`;
  const playState = isPlaying ? 'running' : 'paused';

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-slate-800 bg-[#060b14] ${className}`}
    >
      <style>{`
        @keyframes astroPedal {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes astroVorHead {
          0%, 100% { transform: rotate(-16deg); }
          50% { transform: rotate(16deg); }
        }
        @keyframes astroBreath {
          0%, 100% { transform: scale(1); opacity: 0.55; }
          50% { transform: scale(1.18); opacity: 0.95; }
        }
        @keyframes astroAnklePump {
          0%, 100% { transform: rotate(-14deg); }
          45% { transform: rotate(22deg); }
        }
        @keyframes astroHydroLegL {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(24deg); }
        }
        @keyframes astroHydroLegR {
          0%, 100% { transform: rotate(24deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes astroWave {
          0%, 100% { transform: translateX(0px); }
          50% { transform: translateX(-18px); }
        }
        @keyframes astroRdlHinge {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(52deg); }
        }
        @keyframes astroRowSlide {
          0%, 100% { transform: translateX(-22px); }
          50% { transform: translateX(22px); }
        }
        @keyframes astroTandemSway {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes astroTrapLift {
          0%, 100% { transform: translateY(16px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes astroLadderHop {
          0% { transform: translate(0px, 0px); }
          25% { transform: translate(36px, -12px); }
          50% { transform: translate(72px, 0px); }
          75% { transform: translate(108px, 12px); }
          100% { transform: translate(0px, 0px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .astro-anim { animation: none !important; }
        }
      `}</style>

      <svg
        viewBox="0 0 360 220"
        className="h-full w-full select-none"
        role="img"
        aria-label={`Biomechanical movement demonstration for ${exerciseId}`}
      >
        <defs>
          <pattern id="grid-dots" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="#1e293b" />
          </pattern>
          <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0.55" />
          </linearGradient>
          <marker id="arrowCyan" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#22d3ee" />
          </marker>
          <marker id="arrowEmerald" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#34d399" />
          </marker>
        </defs>

        <rect width="360" height="220" fill="url(#grid-dots)" />

        {/* 1. 45° Semi-Recumbent Ergometer Cycling */}
        {exerciseId === 'p1_recumbent_cycle' && (
          <g>
            {/* Floor */}
            <line x1="25" y1="188" x2="335" y2="188" stroke="#334155" strokeWidth="2" />
            {/* Ergometer Frame & 45 deg seat */}
            <path d="M 85 188 L 135 150 L 235 162 L 265 188" fill="none" stroke="#475569" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 105 148 L 78 96" stroke="#64748b" strokeWidth="8" strokeLinecap="round" />
            {/* 45 degree angle arc */}
            <path d="M 110 148 L 148 148" stroke="#22d3ee" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 134 148 A 24 24 0 0 0 118 128" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
            <text x="142" y="135" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">45°</text>
            {/* Flywheel */}
            <circle cx="245" cy="158" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <g
              className="astro-anim"
              style={{
                transformOrigin: '245px 158px',
                animation: `astroPedal ${dur(1.6)} linear infinite`,
                animationPlayState: playState,
              }}
            >
              <line x1="245" y1="158" x2="262" y2="158" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
              <circle cx="262" cy="158" r="4" fill="#34d399" />
              <line x1="245" y1="158" x2="228" y2="158" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            {/* Reclined Astronaut Figure */}
            <circle cx="96" cy="96" r="11" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="103" y1="106" x2="132" y2="144" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
            {/* Highlighted Quad & Cardio */}
            <circle cx="116" cy="120" r="6" fill="#f43f5e" opacity="0.7" />
            <path d="M 132 144 L 185 136 L 250 156" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            {/* Rotation arrow */}
            <path d="M 230 124 A 34 34 0 0 1 278 144" fill="none" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrowCyan)" />
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">45° RECLINED TORSO · 65–75 RPM</text>
          </g>
        )}

        {/* 2. VOR x1 Gaze Fixation */}
        {exerciseId === 'p1_vor_gaze' && (
          <g>
            {/* Central Fixed Thumb Target */}
            <line x1="180" y1="115" x2="180" y2="165" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <circle cx="180" cy="108" r="10" fill="#0f172a" stroke="#34d399" strokeWidth="2.5" />
            <circle cx="180" cy="108" r="3" fill="#34d399" />
            <text x="196" y="112" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">FIXED TARGET</text>
            {/* Gaze line */}
            <line x1="180" y1="58" x2="180" y2="96" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Oscillating Head */}
            <g
              className="astro-anim"
              style={{
                transformOrigin: '180px 80px',
                animation: `astroVorHead ${dur(1.0)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <circle cx="180" cy="54" r="20" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2.5" />
              <circle cx="173" cy="52" r="2.5" fill="#22d3ee" />
              <circle cx="187" cy="52" r="2.5" fill="#22d3ee" />
              <line x1="180" y1="34" x2="180" y2="26" stroke="#f59e0b" strokeWidth="2" />
            </g>
            {/* ±20° oscillation arc */}
            <path d="M 136 40 A 52 52 0 0 1 224 40" fill="none" stroke="#22d3ee" strokeWidth="2" markerStart="url(#arrowCyan)" markerEnd="url(#arrowCyan)" />
            <text x="155" y="22" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">±20° @ 1 Hz</text>
            {/* Torso seated */}
            <path d="M 148 185 L 212 185 L 204 142 L 156 142 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
            <text x="18" y="205" fill="#94a3b8" fontSize="10" fontFamily="monospace">KEEP EYES LOCKED ON THUMB WHILE HEAD TURNS</text>
          </g>
        )}

        {/* 3. Supine Multifidus & Diaphragmatic Co-Contraction */}
        {exerciseId === 'p1_diaphragm_core' && (
          <g>
            {/* Padded Mat */}
            <rect x="35" y="168" width="290" height="12" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            {/* Supine Body (Head left, knees bent right) */}
            <circle cx="72" cy="150" r="12" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="86" y1="156" x2="182" y2="156" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
            {/* Hook-lying legs */}
            <path d="M 182 156 L 228 112 L 266 164" fill="none" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            {/* Animated Diaphragm / Core Brace Halo */}
            <ellipse
              cx="140"
              cy="152"
              rx="26"
              ry="13"
              fill="#10b981"
              fillOpacity="0.25"
              stroke="#34d399"
              strokeWidth="2"
              className="astro-anim"
              style={{
                transformOrigin: '140px 152px',
                animation: `astroBreath ${dur(4.0)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            />
            {/* Brace / Inhale arrows */}
            <line x1="140" y1="108" x2="140" y2="132" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrowCyan)" />
            <text x="108" y="98" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">10s CO-CONTRACTION</text>
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">NEUTRAL LUMBAR CURVE · ZERO SPINAL COMPRESSION</text>
          </g>
        )}

        {/* 4. Seated Soleus Venous Return & Heel Slides */}
        {exerciseId === 'p1_ankle_pump' && (
          <g>
            <line x1="30" y1="186" x2="330" y2="186" stroke="#334155" strokeWidth="2" />
            {/* Seated Chair */}
            <path d="M 65 186 L 65 128 L 125 128 L 125 186" fill="none" stroke="#475569" strokeWidth="4" />
            <line x1="65" y1="75" x2="65" y2="128" stroke="#475569" strokeWidth="5" />
            {/* Person seated with leg extended */}
            <circle cx="88" cy="64" r="11" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="88" y1="78" x2="88" y2="124" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
            <line x1="88" y1="124" x2="232" y2="136" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
            {/* Highlighted Calf/Soleus */}
            <ellipse cx="192" cy="134" rx="22" ry="7" fill="#34d399" opacity="0.45" stroke="#34d399" strokeWidth="1.5" />
            {/* Moving Foot & Green Resistance Band */}
            <g
              className="astro-anim"
              style={{
                transformOrigin: '232px 136px',
                animation: `astroAnklePump ${dur(2.8)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <line x1="232" y1="136" x2="246" y2="104" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
              {/* Green band loop */}
              <line x1="108" y1="96" x2="244" y2="108" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 2" />
            </g>
            {/* Movement direction arrows */}
            <path d="M 262 104 Q 278 122 264 142" fill="none" stroke="#22d3ee" strokeWidth="2" markerStart="url(#arrowCyan)" markerEnd="url(#arrowCyan)" />
            <text x="158" y="84" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">GREEN BAND · 3s ECCENTRIC</text>
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">VENOUS CALF PUMP ACTIVATION</text>
          </g>
        )}

        {/* 5. Chest-Deep Hydrotherapy Treadmill Gait (SPECIAL WATER THEME) */}
        {exerciseId === 'p2_aquatic_treadmill' && (
          <g>
            {/* Hydrotherapy Tank */}
            <rect x="40" y="64" width="280" height="128" rx="6" fill="#081a2d" stroke="#0284c7" strokeWidth="2" />
            {/* Animated Water Fill */}
            <rect x="42" y="86" width="276" height="104" fill="url(#waterFill)" />
            {/* Water surface wave */}
            <path
              d="M 42 86 Q 76 80 110 86 T 178 86 T 246 86 T 318 86"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              className="astro-anim"
              style={{
                animation: `astroWave ${dur(2.0)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            />
            {/* Chest-Deep Water Label */}
            <text x="52" y="79" fill="#38bdf8" fontSize="9.5" fontFamily="monospace" fontWeight="bold">
              CHEST-DEEP WATER · 55% BUOYANCY OFFLOAD
            </text>

            {/* Submerged Treadmill Belt */}
            <rect x="92" y="176" width="176" height="10" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="115" y1="181" x2="245" y2="181" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="8 6" />

            {/* Astronaut Upright in Water */}
            <circle cx="180" cy="54" r="11" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            {/* Torso */}
            <line x1="180" y1="66" x2="180" y2="118" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />
            {/* Buoyancy Upward Arrows */}
            <line x1="142" y1="140" x2="142" y2="104" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrowCyan)" />
            <line x1="218" y1="140" x2="218" y2="104" stroke="#38bdf8" strokeWidth="2" markerEnd="url(#arrowCyan)" />
            {/* Alternating Striding Legs */}
            <g
              className="astro-anim"
              style={{
                transformOrigin: '180px 118px',
                animation: `astroHydroLegL ${dur(1.2)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <line x1="180" y1="118" x2="180" y2="174" stroke="#34d399" strokeWidth="6" strokeLinecap="round" />
              <circle cx="180" cy="174" r="4" fill="#34d399" />
            </g>
            <g
              className="astro-anim"
              style={{
                transformOrigin: '180px 118px',
                animation: `astroHydroLegR ${dur(1.2)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <line x1="180" y1="118" x2="180" y2="174" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" />
              <circle cx="180" cy="174" r="4" fill="#22d3ee" />
            </g>
            <text x="118" y="208" fill="#7dd3fc" fontSize="10" fontFamily="monospace">
              SYMMETRIC HEEL-TO-TOE FOOT STRIKE
            </text>
          </g>
        )}

        {/* 6. Supported Banded Romanian Deadlift (RDL) */}
        {exerciseId === 'p2_banded_rdl' && (
          <g>
            <line x1="30" y1="186" x2="330" y2="186" stroke="#334155" strokeWidth="2" />
            {/* Fixed Shins & Foot on Band */}
            <line x1="162" y1="138" x2="168" y2="184" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <line x1="158" y1="184" x2="186" y2="184" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
            {/* Band Anchor */}
            <rect x="164" y="182" width="16" height="5" fill="#10b981" />
            {/* Hip Joint */}
            <circle cx="154" cy="126" r="5" fill="#22d3ee" />
            <line x1="162" y1="138" x2="154" y2="126" stroke="#34d399" strokeWidth="7" strokeLinecap="round" />
            {/* Hinged Torso + Head + Arms */}
            <g
              className="astro-anim"
              style={{
                transformOrigin: '154px 126px',
                animation: `astroRdlHinge ${dur(3.0)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <line x1="154" y1="126" x2="154" y2="68" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              {/* Neutral Spine alignment guide */}
              <line x1="146" y1="124" x2="146" y2="66" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="154" cy="52" r="11" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              {/* Arm gripping resistance band */}
              <line x1="154" y1="78" x2="172" y2="134" stroke="#94a3b8" strokeWidth="5" strokeLinecap="round" />
              {/* Elastic band stretched to hands */}
              <line x1="172" y1="134" x2="172" y2="184" stroke="#10b981" strokeWidth="3" />
            </g>
            {/* Hinge Movement Arrow */}
            <path d="M 130 126 L 96 126" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrowCyan)" />
            <text x="64" y="114" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">HIPS BACK</text>
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">NEUTRAL SPINE HIP HINGE · BANDED ECCENTRIC</text>
          </g>
        )}

        {/* 7. Concept2 Kinetic Chain Rowing Intervals */}
        {exerciseId === 'p2_erg_rowing' && (
          <g>
            {/* Rowing Monorail */}
            <line x1="55" y1="168" x2="295" y2="168" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
            <circle cx="285" cy="146" r="24" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <line x1="258" y1="168" x2="270" y2="142" stroke="#64748b" strokeWidth="4" />
            {/* Sliding Seat + Rower */}
            <g
              className="astro-anim"
              style={{
                animation: `astroRowSlide ${dur(2.2)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <rect x="135" y="156" width="26" height="8" rx="2" fill="#22d3ee" />
              <line x1="148" y1="154" x2="138" y2="98" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <circle cx="136" cy="82" r="11" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              <line x1="148" y1="154" x2="196" y2="132" stroke="#34d399" strokeWidth="6" strokeLinecap="round" />
              <line x1="196" y1="132" x2="245" y2="148" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
              <line x1="140" y1="108" x2="215" y2="122" stroke="#e2e8f0" strokeWidth="5" strokeLinecap="round" />
            </g>
            <line x1="90" y1="54" x2="245" y2="54" stroke="#22d3ee" strokeWidth="2" markerStart="url(#arrowCyan)" markerEnd="url(#arrowCyan)" />
            <text x="92" y="42" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">1. LEGS → 2. BODY → 3. ARMS</text>
            <text x="18" y="204" fill="#94a3b8" fontSize="10" fontFamily="monospace">5 × 3-MIN INTERVALS · CAP HR ≤ 82% MAX</text>
          </g>
        )}

        {/* 8. Dynamic Foam-Pad Tandem Balance & Head Turns */}
        {exerciseId === 'p2_tandem_balance' && (
          <g>
            <line x1="35" y1="188" x2="325" y2="188" stroke="#334155" strokeWidth="2" />
            {/* Safety Handrails */}
            <path d="M 85 188 L 85 104 L 122 104" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            <path d="M 275 188 L 275 104 L 238 104" fill="none" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
            {/* Balance Foam Pad */}
            <rect x="142" y="172" width="76" height="16" rx="4" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="2" />
            {/* Tandem Athlete */}
            <g
              className="astro-anim"
              style={{
                transformOrigin: '180px 172px',
                animation: `astroTandemSway ${dur(2.4)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <line x1="180" y1="172" x2="180" y2="112" stroke="#34d399" strokeWidth="7" strokeLinecap="round" />
              <line x1="180" y1="112" x2="180" y2="66" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <circle cx="180" cy="50" r="12" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              {/* Head Turn Arrow */}
              <path d="M 152 34 Q 180 22 208 34" fill="none" stroke="#22d3ee" strokeWidth="2" markerStart="url(#arrowCyan)" markerEnd="url(#arrowCyan)" />
            </g>
            <text x="122" y="20" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">SLOW L / R HEAD TURNS</text>
            <text x="18" y="208" fill="#94a3b8" fontSize="10" fontFamily="monospace">HEEL-TO-TOE STANCE · HANDRAILS WITHIN REACH</text>
          </g>
        )}

        {/* 9. Overground Tempo Track Run */}
        {exerciseId === 'p3_track_run' && (
          <g>
            {/* Track Lane */}
            <rect x="25" y="174" width="310" height="14" rx="2" fill="#7f1d1d" fillOpacity="0.45" stroke="#f87171" strokeWidth="1.5" />
            {/* Forward lean runner */}
            <circle cx="194" cy="56" r="11" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="190" y1="68" x2="176" y2="116" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
            <g
              className="astro-anim"
              style={{
                transformOrigin: '176px 116px',
                animation: `astroHydroLegL ${dur(0.75)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <path d="M 176 116 L 204 142 L 194 172" fill="none" stroke="#34d399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <g
              className="astro-anim"
              style={{
                transformOrigin: '176px 116px',
                animation: `astroHydroLegR ${dur(0.75)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <path d="M 176 116 L 146 146 L 132 172" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {/* Osteogenic Impact Pulse */}
            <path d="M 225 112 L 290 112" stroke="#34d399" strokeWidth="2.5" markerEnd="url(#arrowEmerald)" />
            <text x="218" y="98" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">&gt;2,000 με</text>
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">FULL 1.0G MIDFOOT TEMPO · OSTEOGENIC STIMULUS</text>
          </g>
        )}

        {/* 10. Hex Trap-Bar Osteogenic Deadlift */}
        {exerciseId === 'p3_trapbar_deadlift' && (
          <g>
            <line x1="30" y1="186" x2="330" y2="186" stroke="#334155" strokeWidth="2" />
            {/* Lifter standing inside hex frame */}
            <circle cx="180" cy="48" r="11" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
            <line x1="180" y1="60" x2="180" y2="112" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
            <line x1="170" y1="112" x2="165" y2="184" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            <line x1="190" y1="112" x2="195" y2="184" stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />
            {/* Animated Hex Bar + Plates */}
            <g
              className="astro-anim"
              style={{
                animation: `astroTrapLift ${dur(2.6)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              <line x1="110" y1="138" x2="250" y2="138" stroke="#22d3ee" strokeWidth="4" />
              <rect x="92" y="114" width="16" height="48" rx="3" fill="#0f172a" stroke="#34d399" strokeWidth="2.5" />
              <rect x="252" y="114" width="16" height="48" rx="3" fill="#0f172a" stroke="#34d399" strokeWidth="2.5" />
            </g>
            <line x1="292" y1="158" x2="292" y2="96" stroke="#34d399" strokeWidth="2" markerEnd="url(#arrowEmerald)" />
            <text x="275" y="84" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">75–80% 1RM</text>
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">BALANCED AXIAL LOAD · FEMORAL NECK BMD</text>
          </g>
        )}

        {/* 11. Multi-Directional Agility Ladder */}
        {exerciseId === 'p3_agility_ladder' && (
          <g>
            {/* Perspective Agility Ladder */}
            <line x1="60" y1="135" x2="300" y2="135" stroke="#f59e0b" strokeWidth="3" />
            <line x1="60" y1="175" x2="300" y2="175" stroke="#f59e0b" strokeWidth="3" />
            {[80, 125, 170, 215, 260, 295].map((x) => (
              <line key={x} x1={x} y1="135" x2={x} y2="175" stroke="#f59e0b" strokeWidth="2.5" />
            ))}
            {/* Animated Footwork Dot */}
            <g
              className="astro-anim"
              style={{
                animation: `astroLadderHop ${dur(2.0)} linear infinite`,
                animationPlayState: playState,
              }}
            >
              <circle cx="102" cy="155" r="8" fill="#34d399" />
              <circle cx="102" cy="155" r="14" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
            </g>
            <path d="M 85 110 L 285 110" stroke="#22d3ee" strokeWidth="2" markerEnd="url(#arrowCyan)" />
            <text x="95" y="96" fill="#22d3ee" fontSize="10" fontFamily="monospace" fontWeight="bold">6 DRILLS × 4 PASSES · ZERO VALGUS</text>
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">RAPID DECELERATION &amp; 180° CUTS</text>
          </g>
        )}

        {/* 12. NHIS Single-Leg Eyes-Closed & 10m Stand Test */}
        {exerciseId === 'p3_nhis_check' && (
          <g>
            <line x1="40" y1="186" x2="320" y2="186" stroke="#334155" strokeWidth="2" />
            {/* Unipedal Figure */}
            <g
              className="astro-anim"
              style={{
                transformOrigin: '180px 184px',
                animation: `astroTandemSway ${dur(3.2)} ease-in-out infinite`,
                animationPlayState: playState,
              }}
            >
              {/* Standing leg */}
              <line x1="180" y1="124" x2="180" y2="184" stroke="#34d399" strokeWidth="7" strokeLinecap="round" />
              {/* Raised leg */}
              <path d="M 180 124 L 210 132 L 204 162" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              {/* Torso & Hands on Hips */}
              <line x1="180" y1="68" x2="180" y2="124" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
              <path d="M 180 78 L 158 102 L 176 118" fill="none" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 180 78 L 202 102 L 184 118" fill="none" stroke="#94a3b8" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="180" cy="52" r="12" fill="#1e293b" stroke="#e2e8f0" strokeWidth="2" />
              {/* Eyes Closed Indicator */}
              <line x1="173" y1="51" x2="177" y2="51" stroke="#f59e0b" strokeWidth="2" />
              <line x1="183" y1="51" x2="187" y2="51" stroke="#f59e0b" strokeWidth="2" />
            </g>
            <text x="218" y="64" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold">EYES CLOSED · 30s</text>
            <text x="18" y="24" fill="#94a3b8" fontSize="10" fontFamily="monospace">NHIS UNIPEDAL &amp; BAROREFLEX CERTIFICATION</text>
          </g>
        )}
      </svg>
    </div>
  );
};
