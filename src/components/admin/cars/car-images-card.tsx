import { useRef } from "react"
import { Image as ImageIcon, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  images: string[]
  uploading: boolean
  deletingUrl: string | null
  onUpload: (files: FileList) => void
  onDelete: (url: string) => void
}

function ImageTile({ url, deleting, onDelete }: { url: string; deleting: boolean; onDelete: () => void }) {
  return (
    <div className="relative group aspect-video rounded-lg overflow-hidden border border-light-gray">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Car" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity bg-danger text-white rounded-lg p-1.5 hover:bg-danger/90"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {deleting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}

export function CarImagesCard({ images, uploading, deletingUrl, onUpload, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const trigger = () => fileInputRef.current?.click()

  return (
    <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-navy text-sm flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-royal" /> Car Images
          <span className="text-xs text-muted-foreground font-normal">({images.length} photos)</span>
        </h2>
        <Button
          type="button"
          size="sm"
          onClick={trigger}
          disabled={uploading}
          className="bg-navy hover:bg-royal gap-1.5 h-8 text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading..." : "Upload Images"}
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-light-gray rounded-xl p-8 text-center cursor-pointer hover:border-royal transition-colors"
          onClick={trigger}
        >
          <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No images yet. Click to upload.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url) => (
            <ImageTile
              key={url}
              url={url}
              deleting={deletingUrl === url}
              onDelete={() => onDelete(url)}
            />
          ))}
          <div
            className="aspect-video rounded-lg border-2 border-dashed border-light-gray flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-royal transition-colors"
            onClick={trigger}
          >
            <Upload className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Add more</p>
          </div>
        </div>
      )}
    </div>
  )
}
