import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
});

const cleanText = (value: unknown, max = 500) => String(value ?? '').trim().slice(0, max);
const cleanCode = (value: unknown) => cleanText(value, 64).toLowerCase().replace(/[^a-z0-9_-]/g, '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Backend configuration is incomplete.' }, 500);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const url = new URL(req.url);
  const route = url.pathname.split('/').filter(Boolean).pop();

  try {
    if (req.method === 'POST' && route === 'apply') {
      const body = await req.json();
      const firstName = cleanText(body.firstName, 80);
      const lastName = cleanText(body.lastName, 80);
      const email = cleanText(body.email, 160).toLowerCase();
      const platform = cleanText(body.platform, 80);
      const profile = cleanText(body.profile, 500);
      const country = cleanText(body.country, 120);
      const about = cleanText(body.about, 2000);
      const followers = body.followers ? Number(body.followers) : null;

      if (!firstName || !lastName || !email || !platform || !profile || !country || !about || body.acceptedTerms !== true) {
        return json({ error: 'Please complete all required fields.' }, 400);
      }

      const { data, error } = await supabase
        .from('creator_applications')
        .insert({
          first_name: firstName,
          last_name: lastName,
          email,
          platform,
          profile_url: profile,
          followers: Number.isFinite(followers) ? followers : null,
          country,
          about
        })
        .select('id')
        .single();

      if (error) throw error;
      return json({ ok: true, applicationId: data.id }, 201);
    }

    if (req.method === 'POST' && route === 'click') {
      const body = await req.json();
      const creatorCode = cleanCode(body.creatorCode);
      const landingPath = cleanText(body.landingPath, 500) || '/';
      if (!creatorCode) return json({ ok: true });

      const { data: creator } = await supabase
        .from('creators')
        .select('id,status')
        .eq('creator_code', creatorCode)
        .maybeSingle();

      if (!creator || creator.status !== 'active') return json({ ok: true });

      const { error } = await supabase
        .from('referral_clicks')
        .insert({ creator_id: creator.id, landing_path: landingPath });
      if (error) throw error;
      return json({ ok: true }, 201);
    }

    if (req.method === 'GET' && route === 'health') {
      return json({ ok: true, service: 'luma-creator-api' });
    }

    return json({ error: 'Not found.' }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: 'Request failed.' }, 500);
  }
});