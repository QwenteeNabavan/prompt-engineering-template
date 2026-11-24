import React, { useState, useEffect } from 'react'
import type { TastyTab, CaseDefinition, SkinItem, InventoryItem, LiveDrop } from './types'
import { CASES_DATA } from './data/casesData'
import { TastyDropHeader } from './components/TastyDropHeader'
import { LiveDropTicker } from './components/LiveDropTicker'
import { CaseList } from './components/CaseList'
import { UpgraderView } from './components/UpgraderView'
import { InventoryView } from './components/InventoryView'
import { FreeCasesView } from './components/FreeCasesView'
import { CaseRouletteModal } from './components/CaseRouletteModal'
import { setSoundMuted, playCoinSound } from './utils/audio'
import { Coins } from 'lucide-react'

const INITIAL_BALANCE = 500.0 // As requested: initial balance of 500 coins

const BOT_USERNAMES = [
  's1mple_pro',
  'TastyGamer',
  'm0NESY_cs',
  'Donk_Peek',
  'BurgerKing',
  'ShaormaLover',
  'Kyiv_Sniper',
  'GoldDrop',
  'B1t_Headshot',
  'CS2_Lover',
]

export const TastyDropPage: React.FC = () => {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<TastyTab>('cases')

  // User Balance (default 500)
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('tastydrop_balance')
      if (saved !== null) {
        const parsed = parseFloat(saved)
        if (!isNaN(parsed)) return parsed
      }
    } catch {}
    return INITIAL_BALANCE
  })

  // User Inventory
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tastydrop_inventory')
      if (saved) return JSON.parse(saved)
    } catch {}
    return []
  })

  // Audio mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tastydrop_muted')
      return saved === 'true'
    } catch {
      return false
    }
  })

  // Modal active case
  const [activeCase, setActiveCase] = useState<CaseDefinition | null>(null)

  // Preselected item for upgrader
  const [upgraderPreselected, setUpgraderPreselected] = useState<InventoryItem | null>(null)

  // Toast message
  const [toast, setToast] = useState<string | null>(null)

  // Live Drops feed
  const [liveDrops, setLiveDrops] = useState<LiveDrop[]>([])

  // Save balance to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tastydrop_balance', balance.toFixed(2))
    } catch {}
  }, [balance])

  // Save inventory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tastydrop_inventory', JSON.stringify(inventory))
    } catch {}
  }, [inventory])

  // Sync mute setting
  useEffect(() => {
    setSoundMuted(isMuted)
    try {
      localStorage.setItem('tastydrop_muted', String(isMuted))
    } catch {}
  }, [isMuted])

  // Generate initial simulated live drops
  useEffect(() => {
    const initial: LiveDrop[] = []
    const allSkins: SkinItem[] = []
    CASES_DATA.forEach((c) => allSkins.push(...c.items))

    for (let i = 0; i < 15; i++) {
      const randomSkin = allSkins[Math.floor(Math.random() * allSkins.length)]
      const randomUser = BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)]
      initial.push({
        id: `init_${i}_${Date.now()}`,
        userName: randomUser,
        userAvatar: '👤',
        skin: randomSkin,
        caseName: 'Tasty Case',
        timestamp: Date.now() - i * 15000,
      })
    }
    setLiveDrops(initial)

    // Periodically spawn new simulated live drop
    const interval = setInterval(() => {
      const randomSkin = allSkins[Math.floor(Math.random() * allSkins.length)]
      const randomUser = BOT_USERNAMES[Math.floor(Math.random() * BOT_USERNAMES.length)]
      setLiveDrops((prev) => [
        {
          id: `live_${Date.now()}_${Math.random()}`,
          userName: randomUser,
          userAvatar: '👤',
          skin: randomSkin,
          caseName: 'Tasty Case',
          timestamp: Date.now(),
        },
        ...prev.slice(0, 19),
      ])
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Deduct balance
  const handleDeductBalance = (amount: number): boolean => {
    if (balance < amount) return false
    setBalance((prev) => Math.max(0, prev - amount))
    return true
  }

  // Add balance
  const handleAddBalance = (amount: number) => {
    setBalance((prev) => prev + amount)
    showToast(`+${amount.toFixed(2)} 🪙 додано на баланс!`)
  }

  // Add items to inventory & live ticker
  const handleAddInventory = (items: SkinItem[]) => {
    const newInvItems: InventoryItem[] = items.map((it) => ({
      ...it,
      instanceId: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      unboxedAt: Date.now(),
    }))

    setInventory((prev) => [...newInvItems, ...prev])

    // Prepend to live drop ticker with current player tag
    const newDrops: LiveDrop[] = items.map((it) => ({
      id: `player_drop_${Date.now()}_${Math.random()}`,
      userName: 'Гравець (ТИ)',
      userAvatar: '👑',
      skin: it,
      caseName: activeCase?.name || 'Кейс',
      timestamp: Date.now(),
      isCurrentPlayer: true,
    }))

    setLiveDrops((prev) => [...newDrops, ...prev.slice(0, 20)])
  }

  // Deduct item from inventory (used by Upgrader)
  const handleDeductInventoryItem = (instanceId: string) => {
    setInventory((prev) => prev.filter((it) => it.instanceId !== instanceId))
  }

  // Add single item (e.g. from successful upgrade)
  const handleAddSingleInventoryItem = (item: SkinItem) => {
    const invItem: InventoryItem = {
      ...item,
      instanceId: `upgraded_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      unboxedAt: Date.now(),
    }
    setInventory((prev) => [invItem, ...prev])

    // Announce upgrade on live ticker
    setLiveDrops((prev) => [
      {
        id: `player_upgrade_${Date.now()}`,
        userName: 'Гравець (ТИ)',
        userAvatar: '⚡',
        skin: item,
        caseName: 'Апгрейдер',
        timestamp: Date.now(),
        isCurrentPlayer: true,
      },
      ...prev.slice(0, 20),
    ])
  }

  // Sell single item
  const handleSellItem = (instanceId: string, price: number) => {
    setInventory((prev) => prev.filter((it) => it.instanceId !== instanceId))
    setBalance((prev) => prev + price)
    showToast(`Продано за +${price.toFixed(2)} 🪙`)
  }

  // Sell all items
  const handleSellAll = () => {
    const total = inventory.reduce((acc, curr) => acc + curr.price, 0)
    setInventory([])
    setBalance((prev) => prev + total)
    showToast(`Всі скіни продано на суму +${total.toFixed(2)} 🪙!`)
  }

  // Send to upgrader
  const handleSendToUpgrader = (item: InventoryItem) => {
    setUpgraderPreselected(item)
    setActiveTab('upgrader')
    showToast(`Скін ${item.name} відправлено в Апгрейдер!`)
  }

  // Faucet claim (+100 free coins)
  const handleClaimFaucet = () => {
    playCoinSound()
    setBalance((prev) => prev + 100)
    showToast('Кран видав +100.00 🪙 безкоштовно!')
  }

  // Reset simulator
  const handleResetData = () => {
    if (window.confirm('Скинути баланс до 500 коїнів та очистити інвентар?')) {
      setBalance(INITIAL_BALANCE)
      setInventory([])
      try {
        localStorage.removeItem('tastydrop_balance')
        localStorage.removeItem('tastydrop_inventory')
      } catch {}
      showToast('Баланс відновлено до 500 🪙!')
    }
  }

  const inventoryValue = inventory.reduce((acc, curr) => acc + curr.price, 0)

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-amber-500/40 bg-slate-900/95 px-5 py-3 text-sm text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3">
          <Coins className="h-4 w-4 text-amber-400 animate-spin" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Live Drops Ticker */}
      <LiveDropTicker drops={liveDrops} />

      {/* TastyDrop Header */}
      <TastyDropHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        balance={balance}
        inventoryCount={inventory.length}
        inventoryValue={inventoryValue}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onClaimFaucet={handleClaimFaucet}
        onResetData={handleResetData}
      />

      {/* Main Tab Content */}
      <main className="flex-1 py-6">
        {activeTab === 'cases' && (
          <CaseList userBalance={balance} onSelectCase={(c) => setActiveCase(c)} />
        )}

        {activeTab === 'upgrader' && (
          <UpgraderView
            userBalance={balance}
            inventory={inventory}
            preselectedItem={upgraderPreselected}
            onDeductInventoryItem={handleDeductInventoryItem}
            onAddInventoryItem={handleAddSingleInventoryItem}
            onDeductBalance={handleDeductBalance}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            inventory={inventory}
            onSellItem={handleSellItem}
            onSellAll={handleSellAll}
            onSendToUpgrader={handleSendToUpgrader}
            onOpenCasesTab={() => setActiveTab('cases')}
          />
        )}

        {activeTab === 'free' && (
          <FreeCasesView
            userBalance={balance}
            onOpenCase={(c) => setActiveCase(c)}
            onAddBalance={handleAddBalance}
          />
        )}
      </main>

      {/* Case Roulette Opening Modal */}
      <CaseRouletteModal
        isOpen={Boolean(activeCase)}
        caseDef={activeCase}
        userBalance={balance}
        onClose={() => setActiveCase(null)}
        onAddInventory={handleAddInventory}
        onDeductBalance={handleDeductBalance}
        onAddBalance={handleAddBalance}
        onSendToUpgrader={handleSendToUpgrader}
      />

      {/* Footer Info */}
      <footer className="border-t border-slate-800/80 bg-[#060912] py-6 text-center text-xs text-slate-500">
        <div className="container max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-400">
            TastyDrop Simulator — Віртуальний симулятор відкриття кейсів та апгрейдеру
          </p>
          <p>
            Початковий баланс 500 🪙 • Чесні шанси • Всі предмети та коїни є виключно віртуальними
            для розваги.
          </p>
        </div>
      </footer>
    </div>
  )
}
