import { createClient } from "@supabase/supabase-js";


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {

    private bucket: string;

    constructor(bucket: string) {
        this.bucket = bucket;
    }

    async uploadFile(filePath: string, file: File | Buffer) {
        // sanitize each path segment (keeps slashes) to avoid invalid keys
        const sanitizeSegment = (s: string) => {
            // normalize and remove diacritics
            const normalized = s.normalize('NFKD').replace(/\p{Diacritic}/gu, '')
            // replace spaces with hyphens and remove control chars
            const replaced = normalized.replace(/\s+/g, '-').replace(/[^\w\-\.]/g, '')
            return encodeURIComponent(replaced)
        }

        const parts = filePath.split('/').map((p) => sanitizeSegment(p))
        const safePath = parts.join('/')

        console.debug('[supabase] uploadFile', { bucket: this.bucket, original: filePath, safePath })

        const { data, error } = await supabase.storage.from(this.bucket).upload(safePath, file, { cacheControl: '3600', upsert: true })

        if (error) {
            console.error('[supabase] upload error', error)
            throw error
        }

        return { data, path: safePath }
    }

    async getPublicUrl(filePath: string): Promise <string>{
        // expect filePath already sanitized; ensure we log
        console.debug('[supabase] getPublicUrl', { bucket: this.bucket, filePath })
        const { data } = supabase.storage.from(this.bucket).getPublicUrl(filePath)
        return data.publicUrl
    }

    async deleteFile(filePath :string){
        const {error} = await supabase.storage.from(this.bucket).remove([filePath]);

        if (error) throw error;

        return true;
    }


}