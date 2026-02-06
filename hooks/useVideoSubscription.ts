'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

type VideoStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type Video = {
  id: string
  brand_name: string
  status: VideoStatus
  video_url: string | null
  thumbnail_url: string | null
  created_at: string
  error_message: string | null
  aspect_ratio: 'landscape' | 'portrait'
}

interface UseVideoSubscriptionOptions {
  userId: string
  initialVideos: Video[]
  onVideoUpdate?: (video: Video) => void
}

export function useVideoSubscription({
  userId,
  initialVideos,
  onVideoUpdate,
}: UseVideoSubscriptionOptions) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      // Subscribe to video updates for this user
      channel = supabase
        .channel('video_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'videos',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const updatedVideo = payload.new as Video

            // Update the video in the list
            setVideos((prevVideos) =>
              prevVideos.map((video) =>
                video.id === updatedVideo.id ? updatedVideo : video
              )
            )

            // Call optional callback for additional handling (e.g., toast notifications)
            if (onVideoUpdate) {
              onVideoUpdate(updatedVideo)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'videos',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newVideo = payload.new as Video

            // Add the new video to the beginning of the list
            setVideos((prevVideos) => [newVideo, ...prevVideos])

            // Call optional callback
            if (onVideoUpdate) {
              onVideoUpdate(newVideo)
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'videos',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const deletedVideoId = payload.old.id

            // Remove the video from the list
            setVideos((prevVideos) =>
              prevVideos.filter((video) => video.id !== deletedVideoId)
            )
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setIsConnected(false)
          }
        })
    }

    setupSubscription()

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [userId, onVideoUpdate, supabase])

  return {
    videos,
    isConnected,
  }
}
