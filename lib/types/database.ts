// Supabase database types for Hi Low Studio BD system

export type ContactStage =
  | "lead"
  | "engaged"
  | "call_booked"
  | "proposal_sent"
  | "won"
  | "lost";

export type ContactSource =
  | "booking"
  | "manual"
  | "linkedin"
  | `catalog:${string}`;

export type ActivityType =
  | "booking_created"
  | "email_sent"
  | "stage_changed"
  | "note_added"
  | "call_completed";

export type PostType = "text" | "carousel" | "poll" | "article";

export type PostStatus =
  | "draft"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export type HookType =
  // ToFu
  | "contrarian"
  | "data_backed"
  | "vulnerability_story"
  | "curiosity_gap"
  | "bold_claim"
  | "question"
  | "myth_busting"
  | "tribal"
  | "paradox"
  | "quote_wisdom"
  | "name_drop"
  | "observation_trend"
  | "empathy_validation"
  | "david_goliath"
  | "hyperbolic"
  // MoFu
  | "warning_mistake"
  | "how_to"
  | "number_list"
  | "behind_scenes"
  | "framework"
  | "steal_my"
  | "milestone_lesson"
  | "what_if"
  | "ultra_specific"
  | "proof_of_work"
  | "negative_command"
  | "i_was_wrong"
  | "secret_truth"
  | "letter_younger_self"
  // BoFu
  | "transformation"
  | "case_study"
  | "time_frame";

export type FunnelStage = "tofu" | "mofu" | "bofu";

export type IdeaStatus = "active" | "hidden";

export type IdeaSource =
  | "call_notes"
  | "market_observation"
  | "competitor"
  | "personal"
  | "client_feedback"
  | "book"
  | "podcast"
  | "youtube"
  | "article"
  | "repurpose"
  | "external";

export type VoiceCategory = "principle" | "do" | "dont" | "reference_post";

/** User-defined content pillar slug. Stored in the content_pillars DB table. */
export type ContentPillar = string;

export interface ContentPillarRow {
  id: string;
  slug: string;
  label: string;
  short_label: string;
  description: string;
  funnel_role: string;
  color_class: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  source: ContactSource;
  stage: ContactStage;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  contact_id: string;
  google_event_id: string | null;
  meet_link: string | null;
  start_time: string;
  end_time: string;
  message: string | null;
  questionnaire_sent: boolean;
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  contact_id: string;
  type: ActivityType;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ContentPost {
  id: string;
  title: string | null;
  body: string;
  post_type: PostType;
  hook_type: HookType | null;
  funnel_stage: FunnelStage | null;
  content_pillar: ContentPillar | null;
  week_number: number | null;
  visual_url: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  status: PostStatus;
  linkedin_post_id: string | null;
  error_message: string | null;
  first_comment: string | null;
  first_comment_delay_minutes: number;
  first_comment_posted: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LinkedinMetrics {
  id: string;
  post_id: string;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  fetched_at: string;
}

export interface ContentIdea {
  id: string;
  raw_insight: string;
  source: IdeaSource;
  suggested_hook: HookType | null;
  suggested_funnel: FunnelStage | null;
  suggested_pillar: ContentPillar | null;
  source_url: string | null;
  source_material: string | null;
  source_metadata: Record<string, unknown>;
  status: IdeaStatus;
  use_count: number;
  promoted_post_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoiceGuide {
  id: string;
  category: VoiceCategory;
  content: string;
  sort_order: number;
  created_at: string;
}

// Insert types (omit auto-generated fields)
export type ContactInsert = Omit<Contact, "id" | "created_at" | "updated_at"> &
  Partial<Pick<Contact, "id">>;

export type BookingInsert = Omit<Booking, "id" | "created_at"> &
  Partial<Pick<Booking, "id">>;

export type ActivityInsert = Omit<Activity, "id" | "created_at"> &
  Partial<Pick<Activity, "id">>;

export type ContentPostInsert = Omit<ContentPost, "id" | "created_at" | "updated_at"> &
  Partial<Pick<ContentPost, "id">>;

export type ContentIdeaInsert = Omit<ContentIdea, "id" | "created_at" | "updated_at"> &
  Partial<Pick<ContentIdea, "id">>;

export type VoiceGuideInsert = Omit<VoiceGuide, "id" | "created_at"> &
  Partial<Pick<VoiceGuide, "id">>;
