// database.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase URL and anon key


const supabase = createClient(process.env.SUPABASEURL, process.env.SUPABASEKEY);

module.exports = supabase;
