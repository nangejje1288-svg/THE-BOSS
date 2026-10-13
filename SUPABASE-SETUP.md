# Connect the Sharine photo community

The site is a static HTML project; Supabase supplies the shared database, image storage, and secure admin sign-in.

1. Create a Supabase project. In **Authentication → Sign-in / Providers**, enable anonymous sign-ins for public likes. Turn off public email sign-ups; create Sharine's admin account directly in the Supabase dashboard instead.
2. In the Supabase SQL Editor, run `supabase-setup.sql`.
3. In **Authentication → Users**, create Sharine's account with an email address and a new, strong password. Do not reuse the short password that was shared in chat. Copy the user's UUID, then run this in the SQL Editor, replacing the placeholder:

   ```sql
   insert into public.admin_users (user_id)
   values ('THE_AUTH_USER_UUID');
   ```

   The site checks both Supabase authentication and this allowlist before showing admin tools. The login form uses the email for the Supabase account; “Sharine” is the site's admin identity, not a separate public username.
4. Copy the project's **Project URL** and **publishable key** (or legacy `anon` key) into `supabase-config.js`. These are public browser settings; never put a `service_role` key or database password there.
5. In **Authentication → URL Configuration**, set the deployed site as the Site URL and add it to the allowed redirect URLs. Serve the website from HTTPS or a local web server; opening the HTML files directly with `file://` is not a deployable setup.
6. Publish the site, open `gallery.html`, and sign in with the admin email and the new password. The studio lets Sharine upload and delete photos published through that studio; it does not delete the site's original local archive photos.

Visitors can post a display name and comment without creating an account. Public comments are visible to everyone; Sharine can remove an inappropriate comment in the Supabase SQL Editor:

```sql
delete from public.photo_comments where id = 'COMMENT_UUID';
```

The browser uses the public Supabase key under row-level security. Admin membership, photo publishing, and viewer notes are restricted by the SQL policies; likes are tied to anonymous Supabase user IDs. The public photo bucket accepts JPEG, PNG, and WEBP uploads up to 10 MB.

## Enable the floating Sharine AI chat

The floating chat button is displayed on Home, Stories, Gallery and Supporta. To enable answers, deploy its Supabase Edge Function and keep the AI provider key server-side:

1. Create an API key with your AI provider. Never paste it into a website file, chat message, or browser setting.
2. In the Supabase dashboard, open **Edge Functions → Secrets** and add `OPENAI_API_KEY` with the provider key. The function uses `gpt-4o-mini` by default; optionally set `OPENAI_MODEL` there to a model enabled for your provider account.
3. Install and sign in to the Supabase CLI, then link this folder to the same project used above:

   ```text
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   supabase functions deploy sharine-ai --project-ref YOUR_PROJECT_REF
   ```

   The Edge Function source is `supabase/functions/sharine-ai/index.ts`. Its public gateway setting is in `supabase/config.toml`; the function validates message sizes and applies a best-effort per-instance request limit.
4. Set the project URL and publishable (or legacy anon) key in `supabase-config.js`. The key is required for community features; the AI chat can call its Edge Function without a browser key because JWT verification is disabled for that public endpoint. Never use a `service_role` key in the browser.
5. Open any page over HTTPS and try the floating **Ask Sharine AI** button. Until the Edge Function and project settings are in place, the widget explains that it is not connected.

The chat can answer general questions, but identifies itself as AI and does not impersonate Sharine. It treats the first-person memoir pieces as drafts, not verified personal events. Because the function accepts public visitor questions, add a stronger durable rate limiter or CAPTCHA and provider spending limits before promoting the site widely; the included in-memory limit is only a basic safeguard.
