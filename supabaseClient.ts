import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL='https://vkgdfegqhbrpzehhfbfh.supabase.co'
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrZ2RmZWdxaGJycHplaGhmYmZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjUzMzcsImV4cCI6MjA4OTk0MTMzN30.ktDl5Y_5SNkOx3vr5VbMpNphr0aUUAPo28yLK3tN-Rc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
