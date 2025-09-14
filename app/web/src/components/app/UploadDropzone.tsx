"use client"
import React from "react"
export function UploadDropzone({ onFiles }: { onFiles: (files: FileList) => void }) {
  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files)
  }
  return (
    <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop}
      className="rounded-md border-2 border-dashed border-border p-6 text-center text-sm text-slate-600">
      Glissez vos fichiers ici ou cliquez pour sélectionner.
      <input className="hidden" type="file" multiple onChange={(e) => e.target.files && onFiles(e.target.files)} />
    </div>
  )
}
