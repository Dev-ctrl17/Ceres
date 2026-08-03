// Quick live test for the EstateOS API endpoint
// Run: node test-live-api.mjs

const API_URL = 'https://luxurypropertiesltd.com.ng/api/estateos/properties';
const API_KEY = 'estateos_live_c440d4596ca80129c9f3796c7affa5e1';

async function main() {
  console.log('Testing EstateOS API endpoint...\n');

  // Test 1: No auth -> expect 401
  try {
    const res1 = await fetch(`${API_URL}?status=all&page=1&limit=1`);
    console.log(`[1] No auth       -> HTTP ${res1.status}`);
    const body1 = await res1.json();
    console.log(`    Response: ${JSON.stringify(body1)}`);
    console.log(`    ✅ PASS (correctly rejected)`);
  } catch (e) {
    console.log(`[1] No auth       -> FAILED to connect: ${e.message}`);
  }

  console.log('');

  // Test 2: With valid auth -> expect 200
  try {
    const res2 = await fetch(`${API_URL}?status=all&include_unpublished=true&page=1&limit=5`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
    });
    console.log(`[2] With auth     -> HTTP ${res2.status}`);
    const body2 = await res2.json();
    console.log(`    Items: ${body2.items?.length ?? 'N/A'}, Total: ${body2.total}, Page: ${body2.page}, HasMore: ${body2.hasMore}`);
    if (body2.items && body2.items.length > 0) {
      console.log(`    First item: ${JSON.stringify(body2.items[0], null, 2)}`);
    }
  } catch (e) {
    console.log(`[2] With auth     -> FAILED to connect: ${e.message}`);
  }
}

main();