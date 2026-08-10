/**
 * Zmenšení fotky v prohlížeči před nahráním.
 *
 * Fotky z telefonu mívají 3–5 MB a 4000 px na šířku. Na web stačí zlomek —
 * bez téhle komprese by se web načítal pomalu a úložiště zbytečně rostlo.
 */

const MAX_EDGE_PX = 1600;
const JPEG_QUALITY = 0.82;

export type ResizeError = "unsupported" | "decode-failed" | "encode-failed";

export class ImageResizeError extends Error {
  constructor(public readonly reason: ResizeError) {
    super(
      reason === "unsupported"
        ? "Tenhle formát neumíme zpracovat. Použijte JPG, PNG nebo WebP."
        : "Fotku se nepodařilo zpracovat. Zkuste jinou.",
    );
    this.name = "ImageResizeError";
  }
}

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function loadImage(file: File): Promise<ImageBitmap> {
  // createImageBitmap respektuje EXIF orientaci, takže fotky z mobilu
  // neskončí otočené na bok.
  return createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => {
    throw new ImageResizeError("decode-failed");
  });
}

export async function resizeImage(file: File): Promise<Blob> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new ImageResizeError("unsupported");
  }

  const bitmap = await loadImage(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new ImageResizeError("encode-failed");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );

  if (!blob) throw new ImageResizeError("encode-failed");
  return blob;
}
