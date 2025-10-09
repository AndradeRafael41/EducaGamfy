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
        
        const { data, error } = await supabase.storage.from(this.bucket).upload(filePath, file, {cacheControl: "3600",upsert: true});
        
        if (error) throw error;

        return data;
    }

    async getPublicUrl(filePath: string): Promise <string>{
        const {data} = supabase.storage.from(this.bucket).getPublicUrl(filePath);
        return data.publicUrl;
    }

    async deleteFile(filePath :string){
        const {error} = await supabase.storage.from(this.bucket).remove([filePath]);

        if (error) throw error;

        return true;
    }


}