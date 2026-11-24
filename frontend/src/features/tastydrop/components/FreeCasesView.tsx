import React, { useState } from 'react'
import type { CaseDefinition } from '../types'
import { CASES_DATA } from '../data/casesData'
import { CaseCard } from './CaseCard'
import { playCoinSound } from '../utils/audio'
import { Gift, Sparkles, Key } from 'lucide-react'

interface FreeCasesViewProps {
  userBalance: number
  onOpenCase: (caseDef: CaseDefinition) => void
  onAddBalance: (amount: number) => void
}

const PROMO_CODES: Record<string, number> = {
  TASTY500: 500,
  FREECOINS: 100,
  LUCKY: 250,
  BURGER: 150,
  SHAWARMA: 200,
}

export const FreeCasesView: React.FC<FreeCasesViewProps> = ({
  userBalance,
  onOpenCase,
  onAddBalance,
}) => {
  const [promoInput, setPromoInput] = useState<string>('')
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [usedPromos, setUsedPromos] = useState<Record<string, boolean>>({})

  const freeCases = CASES_DATA.filter((c) => c.isFree)

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    const code = promoInput.trim().toUpperCase()
    if (!code) return

    if (usedPromos[code]) {
      setPromoMessage(`Промокод "${code}" вже був активований!`)
      return
    }

    if (PROMO_CODES[code]) {
      const reward = PROMO_CODES[code]
      onAddBalance(reward)
      playCoinSound()
      setUsedPromos((prev) => ({ ...prev, [code]: true }))
      setPromoMessage(`Успіх! Нараховано +${reward} 🪙 за промокод ${code}!`)
      setPromoInput('')
    } else {
      setPromoMessage('Невірний промокод! Спробуйте: TASTY500, FREECOINS, LUCKY')
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-xs font-mono text-emerald-300">
              <Gift className="h-3.5 w-3.5" />
              <span>100% Безкоштовний розділ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Безкоштовні Кейси та Бонуси TastyDrop
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Крутіть кейси без витрат балансу! Ми додали стартовий перекус, щоденний дроп та смачну
              шаурму з шансом вибити справжні дорогі ножі та рукавички.
            </p>
          </div>

          {/* Quick Promo Box */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 w-full sm:w-80 space-y-3 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
              <Key className="h-4 w-4" />
              <span>Активація промокоду</span>
            </div>

            <form onSubmit={handleApplyPromo} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Введіть код..."
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white uppercase placeholder:text-slate-600 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>

              {promoMessage && (
                <p className="text-[11px] font-mono text-emerald-400 animate-in fade-in">
                  {promoMessage}
                </p>
              )}

              <div className="text-[10px] text-slate-500 font-mono">
                Підказка: спробуйте коди <code className="text-emerald-400">TASTY500</code> або{' '}
                <code className="text-amber-400">FREECOINS</code>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* FREE CASES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Безкоштовні кейси (Ціна: 0.00 🪙):</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {freeCases.length} кейси доступні зараз
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {freeCases.map((c) => (
            <CaseCard key={c.id} caseDef={c} onSelect={onOpenCase} userBalance={userBalance} />
          ))}
        </div>
      </div>
    </div>
  )
}
