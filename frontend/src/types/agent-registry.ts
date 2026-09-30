export type AgentCategory =
  | 'All'
  | 'Coding & DevOps'
  | 'Browser Automation'
  | 'Deep Research'
  | 'Multi-Agent Frameworks'

export type RuntimeEnvironment =
  | 'All'
  | 'VS Code Extension'
  | 'Local CLI'
  | 'Docker'
  | 'Cloud Web'

export type PricingModel =
  | 'All'
  | '100% Free'
  | 'BYOK'
  | 'Freemium'
  | 'Paid'

export type SortOption =
  | 'trending'
  | 'top_rated'
  | 'stars'
  | 'recently_added'

export interface AgentArchitecture {
  planningLoop: string
  memoryType: string
  toolExecution: string
}

export interface AgentRegistryItem {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  logoUrl: string
  verified: boolean
  upvotesCount: number
  category: Exclude<AgentCategory, 'All'>
  runtime: Exclude<RuntimeEnvironment, 'All'>
  pricing: Exclude<PricingModel, 'All'>
  primaryLlm: string
  license: string
  isMcpReady: boolean
  githubStars: number
  framework: string
  quickstartSnippet: string
  architecture: AgentArchitecture
  strengths: string[]
  knownEdgeCases: string[]
  externalLinks: {
    launchUrl: string
    repoUrl?: string
    docsUrl?: string
  }
  trendingScore: number
  createdAt: string
}
