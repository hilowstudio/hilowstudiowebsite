// The four products on hilowstudio.dev. Content as code: edit here.
// Every line must be true today (QSF honesty). Statuses and facts that
// change go here, never in the page markup.

export type ProductStatus = {
    label: string;
    tone: "live" | "early" | "paused";
    note?: string;
};

export type Fact = { label: string; value: string };

export type Section = { heading: string; body: string[] };

export type Product = {
    slug: string;
    name: string;
    audience: string;
    tagline: string;
    summary: string;
    lead: string;
    mark: { src: string; width: number; height: number; kind: "icon" | "mark" };
    status: ProductStatus;
    facts: Fact[];
    chips: string[];
    sections: Section[];
    primary?: { label: string; href: string };
    site?: { label: string; href: string };
};

export const products: Product[] = [
    {
        slug: "exegetica",
        name: "Exegetica",
        audience: "For Christian schools",
        tagline: "Bible study and teaching for Christian schools.",
        summary:
            "Students study a passage with a library of public-domain and openly licensed texts: Bible translations, Greek and Hebrew lexicons, commentaries, the church fathers, creeds and confessions, and a reading room of about 15,000 books. Teachers build lessons, quizzes and handouts from the same library and check every line before a student sees it.",
        lead: "Exegetica is a study and teaching tool for Christian schools. It answers from its own library and shows where each answer came from.",
        mark: { src: "/site/exegetica.png", width: 512, height: 512, kind: "icon" },
        status: { label: "In use at a school", tone: "live" },
        facts: [
            { label: "Made for", value: "Christian schools: teachers of grades 6 to 12, students in grades 9 to 12" },
            { label: "Runs on", value: "Any browser, with a school Google sign-in" },
            { label: "Needs", value: "An internet connection" },
            { label: "AI", value: "An outside model writes each answer from the library, and each answer says what it drew on" },
            { label: "Paid for by", value: "The studio pays the running costs. No ads, no payment, no data sales." },
        ],
        chips: ["Any browser", "School Google sign-in", "Needs internet", "Sources shown on every answer"],
        sections: [
            {
                heading: "For students",
                body: [
                    "Study a passage with the library. Every Scripture reference opens the passage in context, and every answer says which books it drew on.",
                    "Practise memory verses on a ladder that hides the text a step at a time, and read from a reading room of about 15,000 public-domain books.",
                ],
            },
            {
                heading: "For teachers",
                body: [
                    "The Prep Room drafts lessons, quizzes and handouts from a book or from your course standards. You edit every line and see a source check beside it, and the teacher copy and student copy never mix.",
                    "The Living Library keeps the books, articles, videos and podcasts you gather for your classes.",
                ],
            },
            {
                heading: "What it won’t do",
                body: [
                    "It won’t pretend to be a person, write prayers or devotions, or write a student’s graded work. Questions about faith, doubt or life go to a teacher, parent or pastor.",
                ],
            },
            {
                heading: "Privacy",
                body: [
                    "No ads, no analytics on students, and no streaks, points or notifications. Students sign in with a school Google account, and anyone can download their data or delete their account from Settings.",
                ],
            },
        ],
        primary: { label: "Talk with us about your school", href: "/contact" },
        site: { label: "exegetica.app", href: "https://exegetica.app" },
    },
    {
        slug: "quillandcompass",
        name: "Quill & Compass",
        audience: "For homeschool families",
        tagline: "Homeschool planning for Christian families.",
        summary:
            "Lesson plans, worksheets and a weekly planner, built from the books already on your shelf. Plan the week, print what you need, and close the app.",
        lead: "Quill & Compass takes the planning off the kitchen table. Tell it what you’re teaching, and it drafts lesson plans, worksheets and quizzes from the books you already own.",
        mark: { src: "/site/quillandcompass.png", width: 512, height: 421, kind: "mark" },
        status: { label: "Live", tone: "live" },
        facts: [
            { label: "Made for", value: "Christian homeschool families" },
            { label: "Runs on", value: "Any browser" },
            { label: "Needs", value: "An internet connection" },
        ],
        chips: ["Any browser", "Needs internet", "Built from your own books"],
        sections: [
            {
                heading: "Planning, drafted for you",
                body: [
                    "Lesson plans, worksheets, reading questions, quizzes and writing prompts, shaped by your family’s approach to school and by the books on your shelf.",
                ],
            },
            {
                heading: "Each child where they are",
                body: [
                    "Every student gets a learning profile, and each worksheet adapts to how that child learns. The profile stays with your family. There’s no ad network on the other end.",
                ],
            },
            {
                heading: "A curriculum compiler",
                body: [
                    "Set the subject, length, reading level and limits, and it builds a coordinated bundle: a teacher guide, a student packet, a reading anthology, organizers and slides. Print it and teach, or work through it in the app.",
                ],
            },
            {
                heading: "A week, planned",
                body: [
                    "The weekly planner spreads lessons across your school days, around holidays and field trips, for each of your children. When the week is planned, close it.",
                ],
            },
        ],
        primary: { label: "Open Quill & Compass", href: "https://www.quillandcompass.app" },
    },
    {
        slug: "podcatch",
        name: "Podcatch",
        audience: "For listeners",
        tagline: "Keep what you heard.",
        summary:
            "Transcribes, summarizes and organizes the podcasts you follow, in the background. Search all of it, or send notes to Notion, Readwise, Obsidian or Google Drive.",
        lead: "You listen on a walk, in the car, while cooking dinner. Podcatch keeps what you heard, so you don’t have to go back to the screen to find it.",
        mark: { src: "/site/podcatch.png", width: 502, height: 512, kind: "mark" },
        status: { label: "Paused", tone: "paused", note: "Podcatch is offline while it moves to new hosting." },
        facts: [
            { label: "Made for", value: "People who learn from podcasts" },
            { label: "Runs on", value: "The web" },
            { label: "Needs", value: "An internet connection" },
            { label: "Your data", value: "Export every transcript and summary, any time" },
        ],
        chips: ["The web", "Exports everything"],
        sections: [
            {
                heading: "It works in the background",
                body: [
                    "When a new episode comes out, Podcatch transcribes it and pulls out the key points, the chapters, and the books and people mentioned.",
                ],
            },
            {
                heading: "Search it, then close it",
                body: [
                    "Search your whole library, or ask a question and get an answer grounded in what was said. Send notes to Notion, Readwise, Obsidian or Google Drive, wherever your notes already live.",
                ],
            },
            {
                heading: "Your library is yours",
                body: ["Export every transcript, summary and note, any time, and take it somewhere else."],
            },
            {
                heading: "Quiet by design",
                body: [
                    "No infinite scroll, no algorithmic feed, no streaks. It doesn’t badge your phone or ping you at dinner. It checks your feeds, does the work and waits.",
                ],
            },
        ],
    },
    {
        slug: "hilowbrowser",
        name: "Hilow Browser",
        audience: "For focus",
        tagline: "A desktop browser that guards your attention.",
        summary:
            "Built first for people with ADHD. Each session starts with what you came to do, and when you drift, it asks whether the page belongs to that.",
        lead: "Hilow Browser is a desktop browser built first for people with ADHD, and for anyone who has opened a tab to check one thing and surfaced two hours later.",
        mark: { src: "/site/mark.png", width: 480, height: 346, kind: "mark" },
        status: { label: "Early access, v0.1.0", tone: "early" },
        facts: [
            { label: "Runs on", value: "Windows, macOS and Linux" },
            { label: "Version", value: "0.1.0, early access, March 2026" },
            { label: "Price", value: "Free for now" },
            { label: "AI", value: "Optional, with your own API key" },
        ],
        chips: ["Windows", "macOS", "Linux", "Free for now"],
        sections: [
            {
                heading: "Intent before input",
                body: [
                    "Each session starts with what you came to do and a quick check on your energy. The browser uses the answer in the moment and doesn’t keep it.",
                ],
            },
            {
                heading: "Focus guardrails",
                body: [
                    "When you drift, it asks whether the page belongs to what you came to do. Say no, and you get five minutes before it brings you back.",
                ],
            },
            {
                heading: "Impulse protection",
                body: [
                    "Shopping pages wait while you type yourself a reason. Most impulses fade within minutes, and the browser gives them the room.",
                ],
            },
            {
                heading: "Capacity tracking",
                body: [
                    "A running estimate of your energy (sleep, water, medication timing, focus fatigue, and your cycle if you opt in) sets how much support the browser gives.",
                ],
            },
            {
                heading: "An assistant that waits",
                body: [
                    "An optional side panel can summarize a page, draft an email or translate. It speaks only when you ask. You bring your own API key, and we never see your data.",
                ],
            },
        ],
    },
];

export const downloads = [
    { platform: "Windows", detail: "x64", href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-Setup-0.1.0.exe" },
    { platform: "macOS", detail: "Apple silicon", href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-0.1.0-arm64.dmg" },
    { platform: "macOS", detail: "Intel", href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-0.1.0.dmg" },
    { platform: "Linux", detail: "x64 AppImage", href: "https://github.com/taiyowhales/hilowbrowser/releases/download/v0.1.0/Hilow-Browser-0.1.0.AppImage" },
];

export function getProduct(slug: string): Product {
    const p = products.find((x) => x.slug === slug);
    if (!p) throw new Error(`Unknown product ${slug}`);
    return p;
}
