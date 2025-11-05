'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, DollarSign, Lock, Heart, MessageCircle, Send, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { usePostInteractions } from '@/hooks/usePostInteractions'
import { useTipModal } from '@/hooks/useTipModal'
import { TipModal } from './TipModal'
import { toast } from 'sonner'

interface Media {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnailUrl: string
  isLocked: boolean
  price?: number
  isVip?: boolean
  caption?: string
  likesCount?: number
  commentsCount?: number
  isLiked?: boolean
}

type CommentType = 'comment' | 'tip'

interface Comment {
  id: string
  type?: CommentType // 'comment' ou 'tip'
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: Date
  isCreator?: boolean
  // Champs spécifiques aux Tips
  tipAmount?: number // Montant en euros
  tipMessage?: string // Message optionnel
}

interface MediaModalProps {
  medias: Media[]
  initialIndex: number
  onClose: () => void
  creator?: {
    id: string
    name: string
    username: string
    avatar: string
  }
  comments?: Comment[]
}

export function MediaModal({
  medias,
  initialIndex,
  onClose,
  creator = { id: 'default', name: 'Jon Kelly', username: 'jon-kelly', avatar: '' },
  comments = []
}: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [commentText, setCommentText] = useState('')
  const currentMedia = medias[currentIndex]

  // 🔧 VERSION LOCALE - Commentaires de test (sans API)
  const [localComments, setLocalComments] = useState<Comment[]>([
    {
      id: '1',
      type: 'tip',
      userId: '2',
      userName: 'Tavon Moore',
      userAvatar: '/avatars/avatar2.jpg',
      content: 'Merci pour le contenu !',
      createdAt: new Date(Date.now() - 300000), // Il y a 5min
      tipAmount: 10,
      tipMessage: 'Merci pour le contenu !',
      isCreator: false
    },
    {
      id: '2',
      userId: '1',
      userName: 'Emma Taafe',
      userAvatar: '/avatars/avatar1.jpg',
      content: 'Super post ! 🔥',
      createdAt: new Date(Date.now() - 3600000), // Il y a 1h
      isCreator: false
    },
    {
      id: '3',
      userId: '2',
      userName: 'Tavon Moore',
      userAvatar: '/avatars/avatar2.jpg',
      content: '😍😍😍',
      createdAt: new Date(Date.now() - 7200000), // Il y a 2h
      isCreator: false
    },
  ])
  const [isCommenting, setIsCommenting] = useState(false)

  // Hooks for interactions
  const {
    isLiked,
    likesCount,
    handleLike,
    isLiking
  } = usePostInteractions({
    postId: currentMedia.id,
    initialLiked: currentMedia.isLiked || false,
    initialLikesCount: currentMedia.likesCount || 0
  })

  const tipModal = useTipModal()

  // 🔧 Debug logs
  useEffect(() => {
    console.log('💬 [MediaModal Debug] commentText:', commentText)
    console.log('⏳ [MediaModal Debug] isCommenting:', isCommenting)
  }, [commentText, isCommenting])

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : medias.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < medias.length - 1 ? prev + 1 : 0))
  }

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || isCommenting) return

    setIsCommenting(true)

    try {
      // 🔧 VERSION LOCALE (sans API) pour tester l'UI
      const newComment: Comment = {
        id: `local-${Date.now()}`,
        userId: 'current-user',
        userName: 'Moi', // Remplacer par currentUser.name quand API OK
        userAvatar: '/avatars/default.jpg',
        content: commentText.trim(),
        createdAt: new Date(),
        isCreator: false
      }

      // Ajouter EN HAUT de la liste (récent en premier)
      setLocalComments([newComment, ...localComments])

      // Vider textarea
      setCommentText('')

      // Toast success
      toast.success('Commentaire ajouté !')

      // VERSION API (à décommenter quand l'API marche)
      // await handleComment(commentText)

    } catch (error) {
      console.error('Error:', error)
      toast.error('Erreur lors de l\'ajout du commentaire')
    } finally {
      setIsCommenting(false)
    }
  }

  // Handler pour les tips (mode simulation)
  const handleTipSuccess = (tipComment: Comment) => {
    // Ajouter le tip EN HAUT des commentaires
    setLocalComments([tipComment, ...localComments])
  }

  const handleTipClick = () => {
    if (!currentMedia.isLocked && creator.id) {
      tipModal.openTipModal(creator.id)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Aperçu du média</DialogTitle>
        </VisuallyHidden>
        <div className="flex h-full">

          {/* ══════════════════════════════════════ */}
          {/* GAUCHE : IMAGE/VIDEO VIEWER */}
          {/* ══════════════════════════════════════ */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            {/* Navigation buttons */}
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {currentIndex < medias.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 z-10"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Media display */}
            {currentMedia.isLocked ? (
              // Média verrouillé
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={currentMedia.thumbnailUrl}
                  alt=""
                  className="max-w-full max-h-full object-contain blur-lg"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                  <Lock className="h-16 w-16 text-[#00B8A9]" />
                  <p className="text-white text-3xl font-bold">€{currentMedia.price}</p>
                  {currentMedia.isVip && (
                    <Badge className="bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] text-white border-none text-lg px-4 py-2">
                      VIP Exclusif
                    </Badge>
                  )}
                  <Button size="lg" className="mt-4 bg-gradient-to-r from-[#00B8A9] to-[#00D4C4] hover:from-[#009B8E] hover:to-[#00B8A9] text-white">
                    <Lock className="mr-2" />
                    Déverrouiller
                  </Button>
                </div>
              </div>
            ) : currentMedia.type === 'video' ? (
              // Vidéo
              <video
                src={currentMedia.url}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              // Image
              <img
                src={currentMedia.url}
                alt={currentMedia.caption}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {medias.length}
            </div>
          </div>

          {/* ══════════════════════════════════════ */}
          {/* DROITE : SIDEBAR INFO (style Instagram) */}
          {/* ══════════════════════════════════════ */}
          <div className="w-96 bg-card flex flex-col border-l">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={creator.avatar} />
                <AvatarFallback>{creator.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{creator.name}</p>
                <p className="text-xs text-muted-foreground">@{creator.username}</p>
              </div>
            </div>

            {/* Titre du post */}
            <div className="p-4 border-b border-gray-200">
              {currentMedia.caption && (
                <h3 className="font-semibold text-gray-900 mb-2">{currentMedia.caption}</h3>
              )}

              {/* Stats : Likes + Comments */}
              {!currentMedia.isLocked && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-1.5 transition-colors ${
                      isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span>{likesCount} likes</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-5 h-5" />
                    <span>{currentMedia.commentsCount || 0} commentaires</span>
                  </div>
                </div>
              )}
            </div>

            {/* ========== Liste Commentaires (RÉCENT EN HAUT) ========== */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {localComments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Aucun commentaire pour le moment</p>
                    <p className="text-xs mt-1">Soyez le premier à commenter !</p>
                  </div>
                ) : (
                  // Tri : RÉCENT EN HAUT → ANCIEN EN BAS ✅
                  [...localComments]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((comment) => {
                      const isTip = comment.type === 'tip'

                      return (
                        <div
                          key={comment.id}
                          className={`flex gap-3 p-3 rounded-lg transition-all ${
                            isTip
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {/* Avatar */}
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={comment.userAvatar} />
                            <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                          </Avatar>

                          {/* Comment content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm text-gray-900">
                                {comment.userName}
                              </p>
                              {comment.isCreator && (
                                <span className="px-2 py-0.5 bg-[#00B8A9] text-white text-xs rounded-full">
                                  Créateur
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                            </div>

                            {/* Contenu selon type */}
                            {isTip ? (
                              <div className="space-y-1">
                                {/* Montant du tip */}
                                <p className="text-sm font-bold text-orange-600 flex items-center gap-1">
                                  <Sparkles className="w-4 h-4" />
                                  A envoyé un tip de {comment.tipAmount}€
                                </p>

                                {/* Message optionnel */}
                                {comment.tipMessage && (
                                  <p className="text-sm text-gray-700 italic">
                                    "{comment.tipMessage}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-700 break-words">
                                {comment.content}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                )}
              </div>
            </ScrollArea>

            {/* ========== Input Nouveau Commentaire - EN BAS ✅ ========== */}
            <div className="p-4 border-t border-gray-200">
              <div className="relative">
                <Textarea
                  value={commentText}
                  onChange={(e) => {
                    console.log('✍️ [MediaModal] onChange triggered:', e.target.value)
                    setCommentText(e.target.value)
                  }}
                  placeholder="Écrivez un commentaire..."
                  className="min-h-[80px] resize-none pr-12 focus:border-[#00B8A9] focus:ring-[#00B8A9] focus:ring-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleCommentSubmit()
                    }
                  }}
                  disabled={isCommenting}
                  maxLength={500}
                />

                {/* Send button (inside textarea) */}
                <button
                  onClick={handleCommentSubmit}
                  disabled={!commentText.trim() || isCommenting}
                  className="absolute bottom-2 right-2 p-2 bg-[#00B8A9] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#009B8E] transition-colors shadow-md"
                >
                  {isCommenting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* ========== Bouton Tip - TOUT EN BAS ✅ ========== */}
            <div className="p-4 border-t border-gray-200">
              <Button
                onClick={handleTipClick}
                variant="outline"
                className="w-full border-[#00B8A9] text-[#00B8A9] hover:bg-[#00B8A9] hover:text-white transition-colors"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Envoyer un Tip
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>

      {/* TipModal */}
      {tipModal.isOpen && tipModal.recipientId && (
        <TipModal
          isOpen={tipModal.isOpen}
          onClose={tipModal.closeTipModal}
          recipientId={tipModal.recipientId}
          recipientName={creator.name}
          onTipSuccess={handleTipSuccess}
        />
      )}
    </Dialog>
  )
}

// Helper function
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "À l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`

  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}
