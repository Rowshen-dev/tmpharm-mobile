import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL='https://sqtrvvomaregjuxdqaws.supabase.co'
const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxdHJ2dm9tYXJlZ2p1eGRxYXdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDU4NjAsImV4cCI6MjA5NTQ4MTg2MH0.Lv88DVnOcIeHQxLZl0PDP_waRaX1J6swHqjjEoMY22k'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
