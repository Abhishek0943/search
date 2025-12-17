export function buildUploadFormData({ description, media, url, options, postType }: UploadBody) {
  const fd = new FormData();

  fd.append('description', description ?? '');
  fd.append('postType', postType ?? '');

  if (url) fd.append('url', url);

  (options || []).forEach(opt => {
    if (opt) fd.append('options', opt);
  });

  (media || []).forEach((file, i) => {
    if (!file?.uri) return;

    const uri = file.uri;
    const name = file.fileName || `media_${i}.${(file.type || 'image/jpeg').split('/')[1]}`;
    const type = file.type || 'image/jpeg';

    fd.append('image', { ...file, uri, name, type } as any);
  });

  return fd;
}