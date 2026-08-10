"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";

import {
  ACCEPTED_TYPES,
  ImageResizeError,
  resizeImage,
} from "@/lib/image-resize";
import { withCount } from "@/lib/plural";

const MAX_IMAGES = 12;

type ImageUploaderProps = {
  images: string[];
  heroImage: string;
  slug: string;
  disabled?: boolean;
  onChange: (images: string[], heroImage: string) => void;
};

export default function ImageUploader({
  images,
  heroImage,
  slug,
  disabled = false,
  onChange,
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadingCount, setUploadingCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isBusy = uploadingCount > 0;
  const remainingSlots = MAX_IMAGES - images.length;

  function apply(nextImages: string[], nextHero?: string) {
    const hero =
      nextHero && nextImages.includes(nextHero)
        ? nextHero
        : (nextImages.includes(heroImage) ? heroImage : nextImages[0]) ?? "";
    onChange(nextImages, hero);
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList).slice(0, Math.max(0, remainingSlots));
    if (files.length < fileList.length) {
      setError(
        `Galerie pojme nejvýš ${MAX_IMAGES} fotek. Nahrál jsem jen ${withCount(files.length, ["fotku", "fotky", "fotek"])}.`,
      );
    }
    if (files.length === 0) return;

    setUploadingCount(files.length);
    const uploaded: string[] = [];

    try {
      for (const file of files) {
        const resized = await resizeImage(file);

        const payload = new FormData();
        payload.append("file", new File([resized], "photo.jpg", { type: "image/jpeg" }));
        payload.append("slug", slug);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: payload,
        });

        const data = (await response.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };

        if (!response.ok || !data.url) {
          throw new Error(data.error ?? "Nahrání se nezdařilo.");
        }

        uploaded.push(data.url);
        setUploadingCount((count) => count - 1);
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof ImageResizeError || uploadError instanceof Error
          ? uploadError.message
          : "Nahrání se nezdařilo. Zkontrolujte připojení a zkuste to znovu.",
      );
    } finally {
      setUploadingCount(0);
      if (inputRef.current) inputRef.current.value = "";
    }

    if (uploaded.length > 0) {
      apply([...images, ...uploaded]);
    }
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    apply(next);
  }

  function remove(index: number) {
    apply(images.filter((_, position) => position !== index));
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-[#F0EDE8]">Fotky</span>
        <span className="text-xs text-[#666]">
          {images.length === 0
            ? `Až ${MAX_IMAGES} fotek`
            : `${withCount(images.length, ["fotka", "fotky", "fotek"])} z ${MAX_IMAGES}`}
        </span>
      </div>

      {images.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => {
            const isHero = image === heroImage;

            return (
              <li
                key={image}
                className={`overflow-hidden rounded-sm border ${isHero ? "border-[#C8A028]" : "border-white/10"}`}
              >
                <div className="relative aspect-[3/4] bg-[#1C1C1C]">
                  <Image
                    src={image}
                    alt={`Fotka ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-cover"
                  />
                  {isHero && (
                    <span className="absolute left-0 top-0 bg-[#C8A028] px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.15em] text-[#0A0A0A]">
                      Hlavní
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-1 bg-[#141414] px-1 py-1">
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={disabled || isBusy || index === 0}
                      aria-label={`Posunout fotku ${index + 1} dopředu`}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-xs text-[#A09C97] hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] disabled:opacity-25"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={disabled || isBusy || index === images.length - 1}
                      aria-label={`Posunout fotku ${index + 1} dozadu`}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-xs text-[#A09C97] hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] disabled:opacity-25"
                    >
                      →
                    </button>
                  </div>

                  <div className="flex">
                    {!isHero && (
                      <button
                        type="button"
                        onClick={() => apply(images, image)}
                        disabled={disabled || isBusy}
                        title="Použít jako hlavní fotku na kartě v kolekci"
                        className="flex h-7 items-center rounded-sm px-2 text-[0.7rem] text-[#A09C97] hover:text-[#C8A028] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A028] disabled:opacity-40"
                      >
                        Hlavní
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      disabled={disabled || isBusy}
                      aria-label={`Odebrat fotku ${index + 1}`}
                      className="flex h-7 w-7 items-center justify-center rounded-sm text-[#A09C97] hover:text-[#E5847B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5847B] disabled:opacity-40"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled && !isBusy) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          if (!disabled && !isBusy) void handleFiles(event.dataTransfer.files);
        }}
        className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed px-6 py-8 text-center transition-colors duration-200 focus-within:border-[#C8A028] ${
          isDragOver ? "border-[#C8A028] bg-[#C8A028]/5" : "border-white/15"
        } ${disabled || isBusy || remainingSlots <= 0 ? "pointer-events-none opacity-50" : "hover:border-[#C8A028]/60"}`}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple
          disabled={disabled || isBusy || remainingSlots <= 0}
          onChange={(event) => void handleFiles(event.target.files)}
          className="sr-only"
        />
        <span className="text-sm text-[#F0EDE8]">
          {isBusy
            ? `Nahrávám ${withCount(uploadingCount, ["fotku", "fotky", "fotek"])}…`
            : remainingSlots <= 0
              ? "Galerie je plná"
              : "Přetáhněte fotky sem nebo klikněte pro výběr"}
        </span>
        <span className="mt-1 text-xs text-[#666]">
          JPG, PNG nebo WebP. Fotky se před nahráním automaticky zmenší.
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-2 text-sm text-[#E5847B]">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <p className="mt-2 text-xs leading-relaxed text-[#666]">
          Hlavní fotka se ukazuje na kartě v kolekci — měla by být celá postava
          včetně obličeje. Pořadí fotek určuje pořadí v galerii detailu.
          Odebraná fotka zmizí z webu, ale zůstane v úložišti.
        </p>
      )}
    </div>
  );
}
