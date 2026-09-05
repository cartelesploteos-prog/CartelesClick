import React, { useState } from "react";
import { Folder, Link as LinkIcon, CheckCircle2, ExternalLink, HardDrive, FileText, AlertCircle } from "lucide-react";

interface GoogleDriveAttachmentProps {
  initialDriveUrl?: string;
  onAttachDriveUrl: (data: {
    driveUrl: string;
    name: string;
    isDriveFolder: boolean;
  }) => void;
  onClearDriveUrl?: () => void;
}

export const GoogleDriveAttachment: React.FC<GoogleDriveAttachmentProps> = ({
  initialDriveUrl = "",
  onAttachDriveUrl,
  onClearDriveUrl,
}) => {
  const [inputUrl, setInputUrl] = useState(initialDriveUrl);
  const [attachedData, setAttachedData] = useState<{
    driveUrl: string;
    name: string;
    isFolder: boolean;
  } | null>(
    initialDriveUrl
      ? {
          driveUrl: initialDriveUrl,
          name: parseDriveName(initialDriveUrl),
          isFolder: initialDriveUrl.includes("/folders/"),
        }
      : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function parseDriveName(url: string): string {
    if (url.includes("/folders/")) {
      const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      const folderId = match ? match[1] : "Drive";
      return `Carpeta Google Drive (${folderId.slice(0, 8)}...)`;
    }
    if (url.includes("/file/d/")) {
      const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      const fileId = match ? match[1] : "Archivo";
      return `Archivo Google Drive (${fileId.slice(0, 8)}...)`;
    }
    return "Enlace Google Drive";
  }

  const handleApplyLink = () => {
    setErrorMsg(null);
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setErrorMsg("Ingresá o pegá un enlace válido de Google Drive.");
      return;
    }

    if (!trimmed.includes("drive.google.com") && !trimmed.includes("docs.google.com")) {
      setErrorMsg("El enlace ingresado debe pertenecer a Google Drive.");
      return;
    }

    const isFolder = trimmed.includes("/folders/");
    const name = parseDriveName(trimmed);

    const result = {
      driveUrl: trimmed,
      name,
      isFolder,
    };

    setAttachedData(result);
    onAttachDriveUrl({
      driveUrl: trimmed,
      name,
      isDriveFolder: isFolder,
    });
  };

  const handleClear = () => {
    setInputUrl("");
    setAttachedData(null);
    setErrorMsg(null);
    if (onClearDriveUrl) {
      onClearDriveUrl();
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-black border border-[var(--border-subtle)] space-y-4 text-left shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <HardDrive className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
            <span>Google Drive (Carpeta u Originales)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-bold">
              Google Workspace
            </span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Pegá el enlace a tu carpeta de Drive con los archivos de imprenta (TIFF, PDF, AI, CDR).
          </p>
        </div>
      </div>

      {!attachedData ? (
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Ej: https://drive.google.com/drive/folders/16tym66aJOZSc2Ds9tRWazmE..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-subtle)] text-xs text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyLink}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Vincular Drive</span>
            </button>
          </div>

          {errorMsg && (
            <p className="text-[11px] text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          {/* SUGGESTION / SAMPLE DEFAULT */}
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
            <span className="truncate pr-2">
              Carpeta compartida de ejemplo disponible
            </span>
            <button
              type="button"
              onClick={() => {
                const sample = "https://drive.google.com/drive/folders/16tym66aJOZSc2Ds9tRWazmE-se-GB88s";
                setInputUrl(sample);
              }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0 cursor-pointer"
            >
              Usar carpeta compartida
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {attachedData.isFolder ? (
              <Folder className="w-5 h-5 text-blue-600 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-bold text-[var(--text-primary)] truncate">
                {attachedData.name}
              </p>
              <a
                href={attachedData.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 truncate max-w-xs"
              >
                <span>Ver carpeta en Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-[var(--text-secondary)] hover:text-red-500 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            Cambiar
          </button>
        </div>
      )}
    </div>
  );
};
