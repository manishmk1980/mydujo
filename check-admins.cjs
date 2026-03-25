const { createClient } = require('@supabase/supabase-js')
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    console.log('Checking admin_users...');
    const { data, error } = await supabase.from('admin_users').select('*');
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Admins found:', data.length);
        console.log(JSON.stringify(data, null, 2));
    }
}

check();
