'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface PostFormProps {
  onSaveDraft: () => void
  onPublish: () => void
}

export function PostForm({ onSaveDraft, onPublish }: PostFormProps) {
  const [caption, setCaption] = useState('')
  const [isPaidContent, setIsPaidContent] = useState(false)
  const [addToCatalog, setAddToCatalog] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState('€5')
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Fitness', 'Lifestyle'])

  const maxCaptionLength = 150

  return (
    <div className="space-y-6">
      {/* Caption */}
      <div>
        <label className="block text-sm font-medium mb-2">Caption</label>
        <div className="relative">
          <textarea
            placeholder="Add comment"
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, maxCaptionLength))}
            className="w-full min-h-[100px] px-3 py-2 bg-background border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {caption.length}/{maxCaptionLength}
          </div>
        </div>
      </div>

      {/* Mark as paid content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaidContent(!isPaidContent)}
            className={`
              relative w-11 h-6 rounded-full transition-colors
              ${isPaidContent ? 'bg-primary' : 'bg-muted'}
            `}
          >
            <div
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${isPaidContent ? 'left-5' : 'left-0.5'}
              `}
            />
          </button>
          <span className="text-sm font-medium">Mark as paid content</span>
        </div>

        {isPaidContent && (
          <div className="relative">
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option>€5</option>
              <option>€10</option>
              <option>€20</option>
              <option>€50</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {/* Add to catalog */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAddToCatalog(!addToCatalog)}
            className={`
              relative w-11 h-6 rounded-full transition-colors
              ${addToCatalog ? 'bg-primary' : 'bg-muted'}
            `}
          >
            <div
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                ${addToCatalog ? 'left-5' : 'left-0.5'}
              `}
            />
          </button>
          <span className="text-sm font-medium">Add to catalog</span>
        </div>

        {addToCatalog && (
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-1.5 bg-background border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
            >
              <option>All Categories</option>
              <option>Fitness</option>
              <option>Lifestyle</option>
              <option>Fashion</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        )}
      </div>

      {/* Select categories */}
      <div>
        <label className="block text-sm font-medium mb-3">Select categories</label>
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <span
              key={category}
              className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full"
            >
              {category}
            </span>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Preview</span>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="preview-type"
                defaultChecked
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              Hipplay
            </label>
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input
                type="radio"
                name="preview-type"
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              Pubis dsaccesstui
            </label>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 text-center text-sm text-muted-foreground">
          <p>Here's how your post will appear</p>
          <p className="text-xs mt-1">to fans</p>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <button className="hover:text-primary transition-colors">Unlock €X</button>
        </div>
      </div>

      {/* Payment Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <input
            type="radio"
            name="payment-option"
            defaultChecked
            className="w-4 h-4 text-primary focus:ring-primary"
          />
          <span className="text-sm">Pays as a droirt</span>
        </label>
        <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
          <input
            type="radio"
            name="payment-option"
            className="w-4 h-4 text-primary focus:ring-primary"
          />
          <span className="text-sm">1 reco as argl 'c*</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onSaveDraft}
          className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
        >
          Save as Draft
        </button>
        <button
          onClick={onPublish}
          className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Publish Post
        </button>
      </div>
    </div>
  )
}
