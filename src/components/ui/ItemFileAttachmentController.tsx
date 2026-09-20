import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import { CartItem } from "../../types";
import { Paperclip, Upload, HardDrive, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { IconBadge } from "./IconBadge";

interface ItemFileAttachmentControllerProps {
  item: CartItem;
  updateItemSpecs: (id: string, specs: Partial<CartItem>) => void;
}

export const ItemFileAttachmentController: React.FC<ItemFileAttachmentControllerProps> = ({
  item,
  updateItemSpecs,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);
    setError(null);

    // Create unique path in Firebase Storage
    const storageRef = ref(storage, `designs/${item.id}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(pct);
      },
      (err) => {
        console.error("Firebase Storage Upload Error:", err);
        setError("Error al subir el archivo. Intente nuevamente.");
        setIsUploading(false);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          updateItemSpecs(item.id, {
            fileAttachment: {
              name: file.name,
              driveUrl: downloadUrl,
              sizeBytes: file.size,
            },
          });
        } catch (err) {
          console.error("Error obtaining Firebase Storage URL:", err);
          setError("Error al recuperar el archivo.");
        } finally {
          setIsUploading(false);
        }
      }
    );
  };

  const handleDriveLinkAttach = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return;

    let fileName = "Enlace Google Drive";
    try {
      const parsedUrl = new URL(trimmed);
      if (parsedUrl.hostname.includes("drive.google.com")) {
        fileName = "Carpeta/Archivo Google Drive";
      } else {
        fileName = `Enlace externo: ${parsedUrl.hostname}`;
      }
    } catch (err) {}

    updateItemSpecs(item.id, {
      fileAttachment: {
        name: fileName,
        driveUrl: trimmed,
        sizeBytes: 0,
      },
    });
  };

  return (
    <div className="mt-2.5">
      {!item.fileAttachment ? (
        <div className="p-2.5 rounded-[10px] bg-[var(--bg-surface-subtle)] border border-dashed border-[var(--border-subtle)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-primary" /> Adjuntar Archivo de Impresión
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {/* LOCAL FILE UPLOAD */}
            <div>
              <label className="block relative cursor-pointer bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-lg py-1.5 px-2.5 text-center transition-colors">
                {isUploading ? (
                  <span className="text-[11px] font-medium text-[var(--text-primary)] flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    Subiendo archivo... {progress}%
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-[var(--text-primary)] flex items-center justify-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-primary" /> Subir archivo a Firebase
                  </span>
                )}
                <input
                  type="file"
                  accept=".pdf,.tif,.tiff,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
              {error && (
                <p className="text-[10px] text-red-500 font-medium mt-1 text-center">
                  {error}
                </p>
              )}
            </div>

            {/* DRIVE LINK INPUT */}
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                placeholder="O pegar link de Drive/Carpeta..."
                disabled={isUploading}
                className="flex-1 px-2 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs focus:ring-1 focus:ring-primary focus:outline-none placeholder-[var(--text-muted)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleDriveLinkAttach(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleDriveLinkAttach(input.value);
                  input.value = "";
                }}
                className="px-2 py-1 bg-primary hover:bg-[var(--color-primary-hover)] text-white text-[11px] font-semibold rounded cursor-pointer shrink-0 transition-colors disabled:opacity-50"
              >
                Adjuntar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-[10px] bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between text-[11px] gap-2">
          <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium truncate">
            <IconBadge
              icon={HardDrive}
              size="compact"
              variant="info"
              containerStyle="subtle"
            />
            <span className="truncate">{item.fileAttachment.name}</span>
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {item.fileAttachment.driveUrl ? (
              <a
                href={item.fileAttachment.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-0.5 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded"
              >
                <span>Ver</span>
                <ExternalLink className="w-3 h-3" strokeWidth={1.85} />
              </a>
            ) : (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono">
                Adjunto
              </span>
            )}
            <button
              type="button"
              onClick={() => updateItemSpecs(item.id, { fileAttachment: undefined })}
              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
              title="Eliminar archivo adjunto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
