import { defineConfig } from 'vitepress';
import { withMermaid } from 'vitepress-plugin-mermaid';

export default withMermaid(
  defineConfig({
    title: 'Zomato Reel Feed',
    description: 'Engineering Guide, Architecture, and Complete Interview-Ready Documentation',
    appearance: 'dark',
    base: '/',
    themeConfig: {
      siteTitle: 'Zomato Reels Eng Docs',
      logo: undefined,
      search: {
        provider: 'local',
      },
      outline: [2, 3],
      socialLinks: [
        { icon: 'github', link: 'https://github.com/AVISHJAIN9/zomato-reel' },
      ],
      nav: [
        { text: 'Guide', link: '/00a-project-analysis' },
        { text: 'Features', link: '/01-features' },
        { text: 'API Reference', link: '/03-api-reference' },
        { text: 'Comparisons', link: '/04-tech-comparisons' },
        { text: 'System Design', link: '/system-design/' },
        { text: 'Interview Q&A', link: '/09-interview-qa' },
        { text: 'Say It Out Loud', link: '/14-say-it-out-loud' },
      ],
      sidebar: [
        {
          text: 'Project Overview',
          collapsed: false,
          items: [
            { text: 'Step 0: Project Type Detection', link: '/00-project-type' },
            { text: 'Step 0: Full Project Analysis', link: '/00a-project-analysis' },
            { text: 'Project Pitches (30s / 2m)', link: '/00b-project-pitch' },
            { text: 'Step 1: Codebase Map & Inventory', link: '/00-project-map' },
            { text: 'Step 3: Rebuild Order From Scratch', link: '/02-build-order' },
          ],
        },
        {
          text: 'Feature Breakdown & Trace',
          collapsed: false,
          items: [
            { text: 'Step 2: Master Feature Inventory', link: '/01-features' },
            { text: 'User Authentication (F1-F3)', link: '/features/01-user-auth' },
            { text: 'Food Partner Authentication (F4-F6)', link: '/features/02-partner-auth' },
            { text: 'Reel Feed & Interactions (F7-F10)', link: '/features/03-video-feed' },
            { text: 'Food Creation & Media Upload (F11)', link: '/features/04-food-creation' },
            { text: 'Partner Profile & Catalog (F12)', link: '/features/05-partner-profile' },
            { text: 'Infrastructure & Shared Pieces (F13-F15)', link: '/features/06-infrastructure-shared' },
            { text: 'Step 2.5: Say It Out Loud Scripts', link: '/14-say-it-out-loud' },
          ],
        },
        {
          text: 'Engineering & Deep Dives',
          collapsed: false,
          items: [
            { text: 'Step 4: API Reference', link: '/03-api-reference' },
            { text: 'Step 5: Technology Choice Comparisons', link: '/04-tech-comparisons' },
            { text: 'Step 6: Architecture & Lifecycle', link: '/05-architecture' },
            { text: 'Step 7: Security Audit (OWASP Top 10)', link: '/06-security' },
            { text: 'Step 8: AI Integration Deep Dive', link: '/07-ai-integration' },
            { text: 'Step 9: Quality, Testing & Operations', link: '/08-quality-and-ops' },
          ],
        },
        {
          text: 'System Design Deep Dive (Step 14)',
          collapsed: true,
          items: [
            { text: 'System Design Overview', link: '/system-design/' },
            { text: '14.1 Requirements & Capacity Estimation', link: '/system-design/14.1-requirements-estimation' },
            { text: '14.2 Architecture Styles & Decomposition', link: '/system-design/14.2-architecture-styles' },
            { text: '14.3 Networking & Communication Protocols', link: '/system-design/14.3-networking-communication' },
            { text: '14.4 Load Balancing & Scaling Strategy', link: '/system-design/14.4-load-balancing-scaling' },
            { text: '14.5 Databases & Storage Architecture', link: '/system-design/14.5-databases-storage' },
            { text: '14.6 Caching Layers & Cache Stampede', link: '/system-design/14.6-caching' },
            { text: '14.7 Messaging, Queues & Async Workflows', link: '/system-design/14.7-messaging-queues' },
            { text: '14.8 Consistency, Concurrency & Locking', link: '/system-design/14.8-consistency-concurrency' },
            { text: '14.9 Reliability, Circuit Breakers & SLAs', link: '/system-design/14.9-reliability-resilience' },
            { text: '14.10 API Gateway & Rate Limiting Algorithms', link: '/system-design/14.10-api-design-rate-limiting' },
            { text: '14.11 Security Architecture & Token Revocation', link: '/system-design/14.11-security-architecture' },
            { text: '14.12 Search & AI Recommendation Systems', link: '/system-design/14.12-search-ai-architecture' },
            { text: '14.13 Real-Time Protocols & WebSockets', link: '/system-design/14.13-real-time-systems' },
            { text: '14.14 Observability, Tracing & Logging', link: '/system-design/14.14-observability-operations' },
            { text: '14.15 Performance Engineering & Profiling', link: '/system-design/14.15-performance-engineering' },
            { text: '14.16 Cost Economics & Cloud Trade-offs', link: '/system-design/14.16-cost-tradeoffs' },
            { text: '14.17 Classic System Design Problems', link: '/system-design/14.17-classic-system-design-problems' },
            { text: '14.18 Design Decisions Log', link: '/system-design/decisions' },
          ],
        },
        {
          text: 'Interview Readiness & Master Reference',
          collapsed: false,
          items: [
            { text: 'Step 10: 150+ Interview Questions & Answers', link: '/09-interview-qa' },
            { text: 'Step 11: Production Gaps & Roadmap', link: '/10-gaps-and-improvements' },
            { text: 'Step 12: Technical Glossary', link: '/11-glossary' },
            { text: 'Step 12: Confirm With Developer List', link: '/12-confirm-list' },
            { text: 'Master Checklist: All 275 Items', link: '/13-master-checklist' },
            { text: 'Master Index (README)', link: '/README' },
          ],
        },
      ],
    },
    mermaid: {
      theme: 'dark',
    },
  })
);
