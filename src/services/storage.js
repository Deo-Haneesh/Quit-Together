/**
 * Firebase Storage Service
 * Handles file uploads with compression and progress tracking
 */

import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Compress an image before upload
 * @param {File} file - Image file to compress
 * @param {number} maxWidth - Maximum width
 * @param {number} quality - Compression quality (0-1)
 * @returns {Promise<Blob>}
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Scale down if needed
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => resolve(blob),
                    file.type,
                    quality
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

/**
 * Upload a file to Firebase Storage
 * @param {File|Blob} file - File to upload
 * @param {string} path - Storage path (e.g., 'posts/user123/image.jpg')
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, path, onProgress = null) {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(Math.round(progress));
                }
            },
            (error) => {
                console.error('Upload error:', error);
                reject(error);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                    url: downloadURL,
                    path: path
                });
            }
        );
    });
}

/**
 * Upload an image with compression
 * @param {File} file - Image file
 * @param {string} folder - Folder path (e.g., 'posts', 'avatars')
 * @param {string} userId - User ID for organizing files
 * @param {function} onProgress - Progress callback
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadImage(file, folder, userId = 'anonymous', onProgress = null) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload an image.');
    }

    // Validate file size (max 10MB before compression)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB.');
    }

    // Compress image (skip for GIFs to preserve animation)
    let fileToUpload = file;
    if (file.type !== 'image/gif') {
        fileToUpload = await compressImage(file);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}_${randomId}.${extension}`;
    const path = `${folder}/${userId}/${filename}`;

    return uploadFile(fileToUpload, path, onProgress);
}

/**
 * Delete a file from storage
 * @param {string} path - Full storage path
 */
export async function deleteFile(path) {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.error('Delete error:', error);
        return false;
    }
}

/**
 * Generate a thumbnail URL (for Firebase Storage, we can use URL transforms)
 * @param {string} url - Original image URL
 * @param {number} size - Thumbnail size
 * @returns {string} Thumbnail URL
 */
export function getThumbnailUrl(url, size = 200) {
    // For Firebase Storage, we'd typically use Cloud Functions for thumbnails
    // For now, return original URL - in production, use Firebase Extensions
    return url;
}

export default {
    uploadFile,
    uploadImage,
    deleteFile,
    compressImage,
    getThumbnailUrl
};
