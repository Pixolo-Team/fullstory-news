'use client';

// TYPES //
import type { ChangeEvent } from 'react';

// SERVICES //
import { uploadImageAction } from '@/app/actions/media.actions';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// LIBRARIES //
import { useRef, useState } from 'react';

interface ImageUploadFieldProps {
  id: string;
  /** Form field the resulting URL is submitted under. */
  name: string;
  defaultValue?: string;
}

/**
 * A hero image field that accepts either a pasted URL or an uploaded file.
 *
 * The text input stays the field the surrounding form submits (so the server
 * action's contract is unchanged) - a chosen file is uploaded immediately and
 * the returned Storage URL is written into that same input.
 */
export function ImageUploadField({ id, name, defaultValue = '' }: ImageUploadFieldProps) {
  // Define Context
  const { showToast } = useToast();

  // Define Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Define States
  const [url, setUrl] = useState<string>(defaultValue);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  /**
   * Uploads the chosen file and fills the URL field with the stored result.
   */
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImageAction(formData);

    setIsUploading(false);

    if (result.errorMessage || !result.url) {
      showToast({
        title: 'Upload failed',
        description: result.errorMessage ?? 'The image could not be uploaded.',
        tone: 'error',
      });
      return;
    }

    setUrl(result.url);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          name={name}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://... or upload a file"
          value={url}
        />
        <Button
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          type="button"
          variant="outline"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>

      <input
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        ref={fileInputRef}
        type="file"
      />

      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of an arbitrary external or Storage URL, not a site asset Next can optimise.
        <img
          alt=""
          className="h-28 w-auto rounded-md border border-rule object-cover"
          src={url}
        />
      ) : null}
    </div>
  );
}
