import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { likePost, unlikePost, createComment } from '@/lib/api/posts'

interface UsePostInteractionsProps {
  postId: string
  initialLiked: boolean
  initialLikesCount: number
}

export function usePostInteractions({
  postId,
  initialLiked,
  initialLikesCount
}: UsePostInteractionsProps) {
  const queryClient = useQueryClient()
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)

  // ========== Like/Unlike Mutation ==========
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return unlikePost(postId)
      } else {
        return likePost(postId)
      }
    },
    onMutate: () => {
      // Optimistic update
      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
    },
    onError: (error: any) => {
      // Rollback on error
      setIsLiked(!isLiked)
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1)

      // Afficher message d'erreur spécifique
      const message = error.response?.data?.message || error.message || 'Erreur lors du like'
      toast.error(message)
      console.error(error)
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    }
  })

  // ========== Comment Mutation ==========
  const commentMutation = useMutation({
    mutationFn: (content: string) => createComment({ postId, content }),
    onSuccess: () => {
      toast.success('Commentaire ajouté !')
      queryClient.invalidateQueries({ queryKey: ['post', postId, 'comments'] })
    },
    onError: (error: any) => {
      // Messages d'erreur personnalisés
      const message = error.response?.data?.message || error.message

      if (message?.includes('déjà commenté') || message?.includes('already commented')) {
        toast.error('Vous avez déjà commenté ce post aujourd\'hui. Revenez demain ! 😊')
      } else {
        toast.error(message || 'Erreur lors de l\'envoi du commentaire')
      }
      console.error(error)
    }
  })

  return {
    // Like
    isLiked,
    likesCount,
    handleLike: () => likeMutation.mutate(),
    isLiking: likeMutation.isPending,

    // Comment
    handleComment: (content: string) => commentMutation.mutate(content),
    isCommenting: commentMutation.isPending,
  }
}
