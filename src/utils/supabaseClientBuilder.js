import { createClient } from '@supabase/supabase-js'

export default class SupabaseClientBuilder {
    static client

    static getClient(supabaseUrl, supabaseKey) {
        if (!this.client) {
            this.client = createClient(supabaseUrl, supabaseKey, { autoRefreshToken: true })
        }
        return this.client
    }
}