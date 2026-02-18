'use server';

import { supabase } from '@/utils/supabase/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addLetter(formData: FormData) {
    const author_name = formData.get('author_name') as string;
    const content = formData.get('content') as string;
    const password = formData.get('password') as string;
    const is_public = formData.get('is_public') === 'on';

    if (!author_name || !content || !password) {
        return { error: 'Please fill in all required fields.' };
    }

    const { error } = await supabase
        .from('letters')
        // @ts-ignore
        .insert({
            author_name,
            content,
            password,
            is_public,
        });

    if (error) {
        console.error('Error inserting letter:', error);
        return { error: 'Failed to post letter. Please try again.' };
    }

    revalidatePath('/guestbook');
    return { success: true };
}
