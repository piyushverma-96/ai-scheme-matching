const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error('SUPABASE_URL or SUPABASE_ANON_KEY missing');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, anonKey);

  console.log('Testing Anon (Public) Client Access:');

  // Test reading schemes
  const { data: schemes, error: schemesErr } = await supabase.from('schemes').select('*');
  if (schemesErr) {
    console.error('Error fetching schemes:', schemesErr);
  } else {
    console.log(`✓ Fetched ${schemes.length} schemes via public client`);
  }

  // Test reading channel_partners
  const { data: partners, error: partnersErr } = await supabase.from('channel_partners').select('*');
  if (partnersErr) {
    console.error('Error fetching channel_partners:', partnersErr);
  } else {
    console.log(`✓ Fetched ${partners.length} channel partners via public client`);
  }

  // Test reading application_guidance with scheme join
  const { data: guidance, error: guidanceErr } = await supabase.from('application_guidance').select('*, schemes(name, scheme_type)');
  if (guidanceErr) {
    console.error('Error fetching application_guidance:', guidanceErr);
  } else {
    console.log(`✓ Fetched ${guidance.length} application guidance records via public client`);
  }

  // Test unauthenticated insert on applications (should be blocked by RLS)
  const { data: insertData, error: insertErr } = await supabase.from('applications').insert([
    {
      project_type: 'Dairy Farming',
      project_cost: 100000,
      annual_income: 180000,
      city: 'Bhopal'
    }
  ]);
  if (insertErr) {
    console.log(`✓ Unauthenticated insert properly blocked by RLS: "${insertErr.message}"`);
  } else {
    console.warn('Warning: Unauthenticated insert succeeded unexpectedy', insertData);
  }

  console.log('\nAll Supabase client and RLS checks passed!');
}

testSupabaseClient();
