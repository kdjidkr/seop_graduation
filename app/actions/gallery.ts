'use server';

import { supabase } from '@/utils/supabase/client';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

export async function uploadPhoto(formData: FormData) {
    const author_name = formData.get('author_name') as string;
    const is_public = formData.get('is_public') !== 'false'; // Default to true
    const password = formData.get('password') as string;
    const file = formData.get('file') as File;

    if (!file || !author_name || !password) {
        return { error: '이름과 비밀번호를 모두 입력해주세요.' };
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
        return { error: '사진 업로드에 실패했습니다. 다시 시도해주세요.' };
    }

    // 2. Insert into Database
    const { error: dbError } = await (supabase as any)
        .from('photos')
        .insert({
            author_name,
            storage_path: filePath,
            is_public,
            password,
        });

    if (dbError) {
        // Cleanup storage if database insert fails
        await supabase.storage.from('photos').remove([filePath]);
        console.error('Error saving photo metadata:', dbError);
        return { error: '데이터 저장에 실패했습니다. 다시 시도해주세요.' };
    }

    revalidatePath('/gallery');
    return { success: true };
}

export async function deletePhoto(photoId: string, password: string) {
    console.log('--- Delete Photo Start ---');
    console.log('Target ID:', photoId);
    console.log('Provided Password:', password);

    if (!photoId) return { error: 'ID가 없습니다.' };

    try {
        // 1. Verify password & Get storage path
        const { data: photo, error: fetchError } = await (supabase as any)
            .from('photos')
            .select('storage_path, password')
            .eq('id', photoId)
            .single();

        if (fetchError || !photo) {
            console.error('Fetch photo error:', fetchError);
            return { error: `사진 정보 조회 실패: ${fetchError?.message || '데이터 없음'}` };
        }

        console.log('Found photo in DB. DB Password:', photo.password);

        // Comparison that handles null/undefined/empty string equally
        const dbPassword = photo.password || '';
        const providedPassword = password || '';

        if (dbPassword !== providedPassword) {
            console.warn('Password mismatch!');
            return { error: '비밀번호가 일치하지 않습니다.' };
        }

        console.log('Password verified successfully.');

        // 2. Delete from storage (Optional cleanup)
        if (photo.storage_path) {
            console.log('Attempting to delete from storage:', photo.storage_path);
            const { error: storageError } = await supabase.storage
                .from('photos')
                .remove([photo.storage_path]);

            if (storageError) {
                console.error('Storage deletion warning (continuing with DB delete):', storageError);
            } else {
                console.log('Storage deletion success.');
            }
        }

        // 3. Delete from database
        console.log('Attempting to delete from DB table "photos"');
        const { error: deleteError, data: deletedData } = await (supabase as any)
            .from('photos')
            .delete()
            .eq('id', photoId)
            .select(); // Use select to verify row deletion

        if (deleteError) {
            console.error('Database delete error:', deleteError);
            return { error: `DB 삭제 명령 실패: ${deleteError.message}` };
        }

        if (!deletedData || deletedData.length === 0) {
            console.warn('Delete successful but 0 rows affected. RLS or Missing Record?');
            return { error: '삭제 권한이 없거나 이미 삭제된 사진입니다. (데이터베이스 정책 확인 필요)' };
        }

        console.log('Deletion completed successfully.');
        revalidatePath('/gallery');
        return { success: true };
    } catch (err: any) {
        console.error('Unexpected error in deletePhoto:', err);
        return { error: `예상치 못한 오류: ${err.message || '알 수 없는 오류'}` };
    }
}
