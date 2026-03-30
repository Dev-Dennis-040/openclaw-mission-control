"use client";

import { Baby, Calendar, ImageIcon, School, Sparkles, Clock, MapPin, Heart } from "lucide-react";

import { DashboardShell } from "@/components/templates/DashboardShell";
import { SignedIn, SignedOut } from "@/auth/clerk";
import { SignedOutPanel } from "@/components/auth/SignedOutPanel";

export default function FamilyHubPage() {
  return (
    <DashboardShell>
      <SignedOut>
        <SignedOutPanel
          message="Sign in to access the Family Hub."
          forceRedirectUrl="/family"
          signUpForceRedirectUrl="/family"
        />
      </SignedOut>

      <SignedIn>
        <main className="flex-1 overflow-auto bg-slate-50/50 p-6 md:p-8">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500 ease-in-out">
            <header className="mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
                  <Baby className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">
                    Family Hub
                  </h1>
                  <p className="mt-1 text-slate-500">
                    Alle dagboekverhalen, foto's en school-updates van Rain & Dane
                  </p>
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* BSO Updates Column */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-500" />
                  <h2 className="font-heading text-xl font-semibold text-slate-900">BSO Avonturen (Mock)</h2>
                </div>

                {/* Example Mock Post 1 */}
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                          R
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Rain</p>
                          <p className="text-xs text-slate-500">KSE Ouderportaal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>Vandaag, 14:30</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-slate-600">
                      Vandaag hebben we met z'n allen een enorme zandkasteel gebouwd in de zandbak! Rain vond het fantastisch om de gracht te vullen met water. Daarna hebben we fruit gegeten en nog even binnen geknutseld.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                        <ImageIcon className="h-3.5 w-3.5" />
                        2 Foto's beschikbaar
                      </div>
                    </div>
                  </div>
                </article>

                {/* Example Mock Post 2 */}
                <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                          D
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Dane</p>
                          <p className="text-xs text-slate-500">KSE Ouderportaal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        <span>Gisteren, 16:15</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-slate-600">
                      Dane heeft heerlijk meegedaan met de gymles in de grote zaal. Hij was super snel bij het tikspelletje!
                    </p>
                  </div>
                </article>

                {/* Waiting State */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                  <Sparkles className="mb-2 h-6 w-6 text-slate-400" />
                  <p className="text-sm font-medium text-slate-900">Wachten op verse N8N data...</p>
                  <p className="mt-1 text-xs text-slate-500">Nova is momenteel bezig met de historische bulk verwerking.</p>
                </div>
              </div>

              {/* School Updates Column */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <School className="h-5 w-5 text-blue-500" />
                  <h2 className="font-heading text-xl font-semibold text-slate-900">School Dashboard (Binnenkort)</h2>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 font-heading text-lg font-semibold text-slate-900">
                      Klaar voor de School Data
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">
                      Hier komt de live integratie voor de school-app. Hier kun je straks direct zien wanneer er studiedagen zijn, wat de wekelijkse updates van de juffen zijn en of er berichtjes in de klas-app staan.
                    </p>
                    <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        Basisschool
                      </span>
                      <span>•</span>
                      <span>Geplande Integratie</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </SignedIn>
    </DashboardShell>
  );
}
