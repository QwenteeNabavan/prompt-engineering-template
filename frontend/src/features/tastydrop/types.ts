export type ItemRarity = 'consumer' | 'mil-spec' | 'restricted' | 'classified' | 'covert' | 'gold'

export interface SkinItem {
  id: string
  name: string
  weapon: string
  skin: string
  wear: 'FN' | 'MW' | 'FT' | 'WW' | 'BS' // Factory New, Minimal Wear, etc.
  wearFull: string
  rarity: ItemRarity
  price: number // in coins 🪙
  chance: number // in percentage, e.g. 15.5 for 15.5%
  imageEmoji?: string
  svgIcon?: string
}

export interface CaseDefinition {
  id: string
  name: string
  subtitle: string
  price: number // 0 for free cases!
  isFree?: boolean
  freeCooldownHours?: number
  badge?: string
  category: 'free' | 'tasty' | 'budget' | 'knives' | 'exclusive'
  items: SkinItem[]
  themeColor: string // hex or tailwind
}

export interface InventoryItem extends SkinItem {
  instanceId: string
  unboxedAt: number
}

export interface LiveDrop {
  id: string
  userName: string
  userAvatar: string
  skin: SkinItem
  caseName: string
  timestamp: number
  isCurrentPlayer?: boolean
}

export type TastyTab = 'cases' | 'upgrader' | 'inventory' | 'free'
