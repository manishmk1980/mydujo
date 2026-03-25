import { prisma } from '../src/db.js';

const initialPincodes = [
    // Metro / major cities
    { pincode: '110001', city: 'New Delhi', state: 'Delhi' },
    { pincode: '400001', city: 'Mumbai', state: 'Maharashtra' },
    { pincode: '700001', city: 'Kolkata', state: 'West Bengal' },
    { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu' },
    { pincode: '560001', city: 'Bengaluru', state: 'Karnataka' },
    { pincode: '500001', city: 'Hyderabad', state: 'Telangana' },
    { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat' },
    { pincode: '302001', city: 'Jaipur', state: 'Rajasthan' },
    { pincode: '226001', city: 'Lucknow', state: 'Uttar Pradesh' },
    { pincode: '800001', city: 'Patna', state: 'Bihar' },
    { pincode: '751001', city: 'Bhubaneswar', state: 'Odisha' },
    { pincode: '160017', city: 'Chandigarh', state: 'Chandigarh' },
    { pincode: '462001', city: 'Bhopal', state: 'Madhya Pradesh' },
    { pincode: '492001', city: 'Raipur', state: 'Chhattisgarh' },
    { pincode: '781001', city: 'Guwahati', state: 'Assam' },
    { pincode: '695001', city: 'Thiruvananthapuram', state: 'Kerala' },
    { pincode: '605001', city: 'Puducherry', state: 'Puducherry' },
    { pincode: '834001', city: 'Ranchi', state: 'Jharkhand' },
    { pincode: '831001', city: 'Jamshedpur', state: 'Jharkhand' },

    // State capitals / key cities
    { pincode: '522001', city: 'Guntur', state: 'Andhra Pradesh' },
    { pincode: '791111', city: 'Itanagar', state: 'Arunachal Pradesh' },
    { pincode: '823001', city: 'Gaya', state: 'Bihar' },
    { pincode: '396210', city: 'Daman', state: 'Dadra and Nagar Haveli and Daman and Diu' },
    { pincode: '403001', city: 'Panaji', state: 'Goa' },
    { pincode: '122001', city: 'Gurugram', state: 'Haryana' },
    { pincode: '171001', city: 'Shimla', state: 'Himachal Pradesh' },
    { pincode: '180001', city: 'Jammu', state: 'Jammu and Kashmir' },
    { pincode: '795001', city: 'Imphal', state: 'Manipur' },
    { pincode: '793001', city: 'Shillong', state: 'Meghalaya' },
    { pincode: '796001', city: 'Aizawl', state: 'Mizoram' },
    { pincode: '797001', city: 'Kohima', state: 'Nagaland' },
    { pincode: '141001', city: 'Ludhiana', state: 'Punjab' },
    { pincode: '799001', city: 'Agartala', state: 'Tripura' },
    { pincode: '248001', city: 'Dehradun', state: 'Uttarakhand' },

    // Union Territories
    { pincode: '744101', city: 'Port Blair', state: 'Andaman and Nicobar Islands' },
    { pincode: '682555', city: 'Kavaratti', state: 'Lakshadweep' },
    { pincode: '194101', city: 'Leh', state: 'Ladakh' },

    // Additional important cities for better practical reach
    { pincode: '411001', city: 'Pune', state: 'Maharashtra' },
    { pincode: '395003', city: 'Surat', state: 'Gujarat' },
    { pincode: '201001', city: 'Ghaziabad', state: 'Uttar Pradesh' },
    { pincode: '121001', city: 'Faridabad', state: 'Haryana' },
    { pincode: '282001', city: 'Agra', state: 'Uttar Pradesh' },
    { pincode: '208001', city: 'Kanpur', state: 'Uttar Pradesh' },
    { pincode: '201301', city: 'Noida', state: 'Uttar Pradesh' },
    { pincode: '641001', city: 'Coimbatore', state: 'Tamil Nadu' },
    { pincode: '682011', city: 'Kochi', state: 'Kerala' },
    { pincode: '530001', city: 'Visakhapatnam', state: 'Andhra Pradesh' },
    { pincode: '440001', city: 'Nagpur', state: 'Maharashtra' },
    { pincode: '313001', city: 'Udaipur', state: 'Rajasthan' },
    { pincode: '324001', city: 'Kota', state: 'Rajasthan' },
    { pincode: '380015', city: 'Ahmedabad', state: 'Gujarat' },
    { pincode: '282002', city: 'Agra', state: 'Uttar Pradesh' },
];

async function main() {
    console.log(`🌱 Seeding ${initialPincodes.length} representative pan-India pincodes...`);

    for (const item of initialPincodes) {
        await prisma.pincodeLookup.upsert({
            where: { pincode: item.pincode },
            update: {
                city: item.city,
                state: item.state,
            },
            create: item,
        });
    }

    console.log('✅ Pan-India representative pincode seeding completed.');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });