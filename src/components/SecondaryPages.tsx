import React, { useState } from 'react';
import {
  Activity,
  Check,
  Send,
} from 'lucide-react';
import { BACKDROP_ASSETS } from '../data/backdropAssets';
import type { PageTab } from '../types/astral';

interface SecondaryPagesProps {
  activeTab: Exclude<PageTab, 'home'>;
  onNavigate: (tab: PageTab) => void;
}

export const SecondaryPages: React.FC<SecondaryPagesProps> = ({
  activeTab,
  onNavigate,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [sentUplinks, setSentUplinks] = useState<
    Array<{ id: string; sender: string; message: string; timestamp: string }>
  >([]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactMsg.trim()) {
      setContactError('Please enter both your name/agency and a clinical message.');
      return;
    }
    setContactError('');
    setContactSent(true);
    setSentUplinks((prev) => [
      {
        id: `AC-UPLINK-${String(prev.length + 1).padStart(3, '0')}`,
        sender: contactName.trim(),
        message: contactMsg.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev,
    ]);
    setContactName('');
    setContactMsg('');
  };

  if (activeTab === 'deployment') {
    return (
      <section className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/70 p-5 backdrop-blur-md md:p-8">
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#060d1f] p-5 md:p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-65"
              style={{ backgroundImage: `url("${BACKDROP_ASSETS.issCupolaOrbit}")` }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(100deg, rgba(5, 11, 26, 0.84) 0%, rgba(6, 15, 36, 0.48) 60%, rgba(4, 10, 24, 0.78) 100%)',
              }}
            />
          </div>
          <div className="relative z-10 max-w-3xl">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Mission Licensing &amp; Deployment
            </span>
            <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
              Space Exploration Tiers
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Scalable mission health suites designed for commercial LEO stations, lunar outposts, and deep-space expeditions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b152c]/85 p-6 transition-colors hover:border-cyan-500/40">
            <div>
              <div className="font-mono text-xs font-bold text-cyan-400">LEO RESEARCH &amp; DEMO</div>
              <h3 className="mt-1 text-xl font-bold text-white">Open Challenge Tier</h3>
              <div className="my-4 font-mono text-3xl font-bold text-white tabular-nums">
                $0 <span className="text-xs font-normal text-slate-400">/ Space Apps 2026</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-400">
                For university labs, analog astronaut habitats, and open-source space medicine research.
              </p>
              <ul className="mb-6 space-y-2 font-mono text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> 100% Offline Local Rule-Engine
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Interactive 3D Body Twin (Mode A &amp; B)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> 45-Day Post-Flight Rehab Plan
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> NASA DONKI Space Weather API
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 font-mono text-xs font-bold text-cyan-300 transition-colors hover:bg-slate-700"
            >
              Launch Current Demo
            </button>
          </div>

          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-cyan-500/70 bg-[#0b152c]/90 p-6 shadow-[0_0_28px_-12px_rgba(6,182,212,0.5)]">
            <div>
              <div className="flex items-center justify-between font-mono text-xs font-bold text-cyan-400">
                <span>COMMERCIAL LEO &amp; LUNAR</span>
                <span>RECOMMENDED</span>
              </div>
              <h3 className="mt-1 text-xl font-bold text-white">Expedition Suite</h3>
              <div className="my-4 font-mono text-3xl font-bold text-cyan-300 tabular-nums">
                $2,400 <span className="text-xs font-normal text-slate-400">/ seat / mo</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-400">
                For commercial space stations and Artemis Lunar Gateway flights.
              </p>
              <ul className="mb-6 space-y-2 font-mono text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Everything in Open Challenge
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Butterfly iQ+ Ultrasound Uplink
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Multi-Astronaut Crew Sync
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-cyan-400" /> Flight Surgeon Ground Uplink
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="min-h-[44px] w-full rounded-xl bg-cyan-600 px-4 py-2 font-mono text-xs font-bold text-white transition-colors hover:bg-cyan-500"
            >
              Request Flight Certification
            </button>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b152c]/85 p-6 transition-colors hover:border-emerald-500/40">
            <div>
              <div className="font-mono text-xs font-bold text-emerald-400">
                DEEP SPACE EXPLORATION
              </div>
              <h3 className="mt-1 text-xl font-bold text-white">Autonomous Agency</h3>
              <div className="my-4 font-mono text-3xl font-bold text-white">
                Enterprise <span className="text-xs font-normal text-slate-400">/ Vehicle</span>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-400">
                Complete avionics integration for multi-year Mars Transit Vehicles.
              </p>
              <ul className="mb-6 space-y-2 font-mono text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Zero-Comms Autonomous Triage
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Radiation Biodosimetry Models
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> MIL-STD-1553 Telemetry Bus
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> 24/7 Flight Surgeon Standby
                </li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 font-mono text-xs font-bold text-emerald-300 transition-colors hover:bg-slate-700"
            >
              Contact Space Agency Desk
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Contact Tab
  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-[#070f22]/70 p-5 backdrop-blur-md md:p-8">
      <div className="relative mb-8 overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#060d1f] p-5 md:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-no-repeat opacity-55"
            style={{
              backgroundImage: `url("${BACKDROP_ASSETS.nasaNeonEmblem}")`,
              backgroundSize: 'auto 145%',
              backgroundPosition: 'right 35%',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(95deg, rgba(5, 11, 26, 0.90) 0%, rgba(6, 14, 34, 0.62) 62%, rgba(4, 9, 22, 0.68) 100%)',
            }}
          />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
            Team Contact &amp; Feedback
          </span>
          <h2 className="mt-1 text-2xl font-bold text-white md:text-3xl">
            Connect with Team RETRO-V
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Send questions, clinical protocol feedback, or collaboration inquiries directly to the RETRO-V development team.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-slate-800 bg-[#0b152c]/85 p-4">
            <h3 className="font-mono font-bold text-white">Development Team</h3>
            <p className="mt-1 font-semibold text-cyan-300">
              RETRO-V (Udamgie, Rashmi, Buddhiprabha, Vidasni)
            </p>
            <p className="mt-1 text-slate-400">
              NASA Space Apps Challenge 2026 · ASTROCARE Platform
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0b152c]/85 p-4">
            <h3 className="font-mono font-bold text-white">Autonomous Offline Architecture</h3>
            <p className="mt-1 text-slate-400">
              Operates 100% locally without cloud dependencies. Astronaut telemetry and logs remain on-device.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0b152c]/85 p-4">
            <h3 className="font-mono font-bold text-white">Contact Channels &amp; Social Links</h3>
            <div className="mt-2 space-y-1.5 text-slate-300">
              <div className="flex justify-between gap-2 border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">Team Email</span>
                <span className="font-mono text-slate-300">Available via message form</span>
              </div>
              <div className="flex justify-between gap-2 border-b border-slate-800 pb-1.5">
                <span className="text-slate-400">GitHub Repository</span>
                <span className="font-mono text-slate-400">Placeholder link slot</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">LinkedIn / Team Profiles</span>
                <span className="font-mono text-slate-400">Placeholder link slot</span>
              </div>
            </div>
          </div>

          {sentUplinks.length > 0 && (
            <div className="rounded-xl border border-cyan-500/30 bg-[#0b1322] p-4">
              <h3 className="mb-2 font-mono font-bold text-cyan-300">
                Sent Message Log ({sentUplinks.length})
              </h3>
              <div className="space-y-2">
                {sentUplinks.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-slate-800 bg-[#070f22] p-2.5"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-emerald-300">{entry.id}</span>
                      <span className="text-slate-400">{entry.timestamp}</span>
                    </div>
                    <div className="mt-0.5 font-semibold text-white">{entry.sender}</div>
                    <p className="mt-0.5 text-slate-300">{entry.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={handleContactSubmit}
          className="space-y-3.5 rounded-xl border border-slate-800 bg-[#0b152c]/85 p-5 font-mono text-xs"
        >
          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-slate-400">
              Your Name / Organization
            </label>
            <input
              id="contact-name"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Name or affiliation"
              className="min-h-[44px] w-full rounded-xl border border-slate-700 bg-[#070f22] px-3 py-2 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="contact-msg" className="mb-1.5 block text-slate-400">
              Message
            </label>
            <textarea
              id="contact-msg"
              rows={4}
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              placeholder="Enter your feedback, clinical question, or inquiry for Team RETRO-V..."
              className="w-full rounded-xl border border-slate-700 bg-[#070f22] px-3 py-2.5 text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {contactError && <p className="text-rose-400">{contactError}</p>}
          {contactSent && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-700/60 bg-emerald-950/30 p-3 text-emerald-300">
              <Activity className="h-4 w-4 shrink-0" />
              <span>Message recorded for Team RETRO-V review.</span>
            </div>
          )}

          <button
            type="submit"
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-cyan-500"
          >
            <Send className="h-4 w-4" />
            <span>Send Message to RETRO-V</span>
          </button>
        </form>
      </div>
    </section>
  );
};
