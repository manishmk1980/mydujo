import fetch from 'node-fetch';
import 'dotenv/config';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create_test_user`;

async function testCreateUser() {
    console.log('🚀 Testing create_test_user function...');
    console.log(`URL: ${FUNCTION_URL}`);

    const testData = {
        email: `test_user_${Date.now()}@example.com`,
        password: 'TestPassword123!'
    };

    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify(testData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Success!');
            console.log('User created:', result.user.user.email);
        } else {
            console.error('❌ Error:', result.error);
            if (result.details) console.error('Details:', result.details);
        }
    } catch (err) {
        console.error('💥 Request failed:', err.message);
    }
}

testCreateUser();
