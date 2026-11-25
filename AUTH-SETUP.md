# PLACEME authentication setup
This branch uses Supabase passwordless phone OTP. It intentionally does not implement password + OTP MFA or password reset. Contact email and city are user metadata, not verified email or authorization claims. The existing static profile and dashboard remain public; no confidential data should be put in HTML or the public spreadsheet. Supabase Auth stores the account; no separate database table is necessary for these fields.
1. Create a Supabase project at https://supabase.com/dashboard.
2. Enable Phone authentication and phone confirmation. Configure a supported SMS provider and its credentials inside Supabase only. Phone.Email is not a built-in SMS provider; its client ID cannot replace SMS provider credentials.
3. Set the public site URL to https://shivam0x03.github.io/placeme/ in Auth URL configuration.
4. Fill auth-config.js with the project URL and publishable (or legacy anon) key only.
5. Configure SMS rate limits and CAPTCHA before public launch. For staging, use Supabase test phone numbers and fixed OTP if available; remove test numbers before production. Never commit test OTP or secrets.
6. Test signup, login for existing users, incorrect code, expired code, resend, reuse, logout and session refresh in a separate test project. Real SMS may cost money. Do not merge until configuration and tests are complete.
7. For future private tables, enable Row Level Security and policies scoped to auth.uid(). Browser UI is not a security boundary.
Docs: https://supabase.com/docs/guides/auth/phone-login
