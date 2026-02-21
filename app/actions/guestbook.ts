'use server';

import { supabase } from '@/utils/supabase/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function addLetter(formData: FormData) {
    const author_name = formData.get('author_name') as string;
    const content = formData.get('content') as string;
    const password = formData.get('password') as string;
    const is_private = formData.get('is_private') === 'on';
    const is_public = !is_private;

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

export async function deleteLetter(id: string, password: string) {
    if (!id || !password) {
        return { error: 'Invalid request.' };
    }

    // First, verify password
    const { data: letter, error: fetchError } = await supabase
        .from('letters')
        .select('password')
        .eq('id', id)
        .single();

    if (fetchError || !letter) {
        return { error: 'Letter not found.' };
    }

    if ((letter as any).password !== password) {
        return { error: '비밀번호가 틀렸습니다!' };
    }

    // If password matches, delete
    const { error: deleteError } = await supabase
        .from('letters')
        .delete()
        .eq('id', id);

    if (deleteError) {
        console.error('Error deleting letter:', deleteError);
        return { error: '삭제에 실패했습니다. 다시 시도해주세요.' };
    }

    revalidatePath('/guestbook');
    return { success: true };
}
