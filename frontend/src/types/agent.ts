export interface Category {
  id: string
  slug: string
  title: string
  description: string
  icon_token: string
  display_order: number
}

export interface AgentListItem {
  id: string
  slug: string
  title: string
  tagline: string
  summary: string
  logo_url: string
  website_url: string
  repository_url: string | null
  github_stars: number
  category_id: string
  deployment_targets: string[]
  llm_backends: string[]
  framework: string | null
  is_open_source: boolean
  is_mcp_compliant: boolean
  upvotes_count: number
  lifecycle_state: string
  is_archived: boolean
  created_at: string
  ranking_score: number
}

export interface AgentDetail extends AgentListItem {
  description_markdown: string
  category_title: string
  hardware_requirements: string | null
  terminal_setup_script: string | null
  strengths: string[]
  known_edge_cases: string[]
  autonomy_level: string
  has_vector_rag: boolean
  memory_backend: string | null
  multimodal_capabilities: string[]
  token_overhead_tier: string
  maintenance_cadence: string
}

export interface UpvoteResponse {
  success: boolean
  agent_id: string
  upvotes_count: number
  has_upvoted: boolean
  message: string
}

export interface SubmissionPayload {
  title: string
  tagline: string
  summary: string
  description_markdown: string
  website_url: string
  repository_url?: string
  category_id: string
  deployment_targets: string[]
  llm_backends: string[]
  framework?: string
  is_open_source: boolean
  is_mcp_compliant: boolean
  hardware_requirements?: string
  terminal_setup_script?: string
  logo_url: string
  submitter_email: string
  bot_token?: string
}

export interface SubmissionResponse {
  submission_id: string
  slug: string
  title: string
  status: string
  sla_hours: number
  submitted_at: string
  message: string
}

export interface Collection {
  id: string
  slug: string
  title: string
  editorial_summary: string
  content_markdown: string
  featured_agents: AgentListItem[]
  display_order: number
}

export interface ComparisonItem {
  id: string
  slug: string
  title: string
  tagline: string
  logo_url: string
  category_title: string
  framework: string | null
  is_open_source: boolean
  is_mcp_compliant: boolean
  github_stars: number
  upvotes_count: number
  autonomy_level: string
  has_vector_rag: boolean
  memory_backend: string | null
  multimodal_capabilities: string[]
  token_overhead_tier: string
  maintenance_cadence: string
  strengths: string[]
  known_edge_cases: string[]
}

export interface ComparisonMatrixResponse {
  agents: ComparisonItem[]
  comparison_parameters: string[]
  is_cross_category: boolean
}

export interface Review {
  id: string
  agent_id: string
  author_name: string
  author_role: string
  rating: number
  comment: string
  created_at: string
}

export interface ReviewCreateInput {
  author_name: string
  author_role: string
  rating: number
  comment: string
}
