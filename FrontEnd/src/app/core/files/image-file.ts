/** Browser validation mirrors the server image boundary; it never replaces server checks. */
export async function validateImageFile(file: File): Promise<string | null> {
  if (file.size > 5 * 1024 * 1024) return 'Ảnh phải nhỏ hơn hoặc bằng 5 MB.';
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = bytes.length >= 8 && [137,80,78,71,13,10,26,10].every((value,index) => bytes[index] === value);
  const jpeg = bytes.length >= 3 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (!((file.type === 'image/png' && png) || (file.type === 'image/jpeg' && jpeg) || (file.type === 'image/webp' && webp))) return 'Chọn ảnh PNG, JPEG hoặc WebP hợp lệ.';
  return null;
}
