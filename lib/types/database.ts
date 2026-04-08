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
  scheduled_at: string | null;
  published_at: string | null;
  status: PostStatus;
  linkedin_post_id: string | null;
  error_message: string | null;
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

// Insert types (omit auto-generated fields)
export type ContactInsert = Omit<Contact, "id" | "created_at" | "updated_at"> &
  Partial<Pick<Contact, "id">>;

export type BookingInsert = Omit<Booking, "id" | "created_at"> &
  Partial<Pick<Booking, "id">>;

export type ActivityInsert = Omit<Activity, "id" | "created_at"> &
  Partial<Pick<Activity, "id">>;

export type ContentPostInsert = Omit<ContentPost, "id" | "created_at" | "updated_at"> &
  Partial<Pick<ContentPost, "id">>;
