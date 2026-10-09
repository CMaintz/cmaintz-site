export const site = {
  name: 'Christoffer Maintz',
  shortName: 'CM',
  handle: 'cmaintz',
  role: { en: 'Developer · DX, DevOps, Platform & AI', da: 'Udvikler · DX, DevOps, platform & AI' },
  description: {
    en: 'Christoffer Maintz - developer in Aarhus working on developer experience, DevOps, platform engineering and AI enablement.',
    da: 'Christoffer Maintz - udvikler i Aarhus med fokus på developer experience, DevOps, platform engineering og AI.',
  },
  location: 'Aarhus, Denmark',
  timezone: 'Europe/Copenhagen',
  // Public address; Cloudflare Email Routing forwards it to Outlook. The contact
  // form still delivers to CONTACT_TO_EMAIL (Outlook) until Resend verifies maintz.dev.
  email: 'christoffer@maintz.dev',
  available: true,
  // Cal.com/Calendly link for the free intro call; the "Book a call" buttons stay hidden while null.
  booking: null as string | null,
  socials: {
    github: 'https://github.com/CMaintz',
    linkedin: 'https://www.linkedin.com/in/christoffer-maintz/' as string | null,
  },
};
