'use server';

import { supabase } from '@/utils/supabase/client';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function uploadPhoto(formData: FormData) {
    const author_name = formData.get('author_name') as string;
    const caption = formData.get('caption') as string;
    const file = formData.get('file') as File;

    if (!file || !author_name) {
        return { error: 'Please select a photo and enter your name.' };
    }

    // 1. Upload to Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return { error: 'Failed to upload photo. Please try again.' };
    }

    // 2. Insert into Database
    // Get public URL? Actually we can just store the path and construct URL on client or here.
    // The schema has `storage_path`.

    const { error: dbError } = await supabase
        .from('photos')
        // @ts-ignore
        .insert({
            author_name,
            caption,
            storage_path: filePath,
        });

    if (dbError) {
        console.error('Error saving photo metadata:', dbError);
        return { error: 'Failed to display photo. Please try again.' };
    }

    revalidatePath('/gallery');
    return { success: true };
}
