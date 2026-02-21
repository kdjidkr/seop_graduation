'use server';

import { supabase } from '@/utils/supabase/client';
import { revalidatePath } from 'next/cache';

export async function createGift(formData: {
    name: string;
    sender_name: string;
    password: string;
    expires_at: string | null;
    barcode_number: string;
    is_public?: boolean;
}) {
    const { error } = await supabase
        .from('gifts')
        .insert({
            name: formData.name,
            sender_name: formData.sender_name,
            password: formData.password,
            expires_at: formData.expires_at,
            barcode_number: formData.barcode_number,
            is_public: formData.is_public !== false, // Default to true if not provided
        });

    if (error) {
        console.error('Gift creation error:', error);
        return { error: '쿠폰 발급에 실패했습니다.' };
    }

    revalidatePath('/gift');
    return { success: true };
}

export async function deleteGift(giftId: string, password: string) {
    // 1. Verify password
    const { data: gift, error: fetchError } = await supabase
        .from('gifts')
        .select('password')
        .eq('id', giftId)
        .single();

    if (fetchError || !gift) {
        return { error: '쿠폰을 찾을 수 없습니다.' };
    }

    if (gift.password !== password) {
        return { error: '비밀번호가 일치하지 않습니다.' };
    }

    // 2. Delete
    const { error: deleteError } = await supabase
        .from('gifts')
        .delete()
        .eq('id', giftId);

    if (deleteError) {
        return { error: '삭제 중 오류가 발생했습니다.' };
    }

    revalidatePath('/gift');
    return { success: true };
}
