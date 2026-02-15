'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, Send, Loader2, Edit3, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Message, Option } from '@/lib/validations/ai-schema'
import { parseAIResponse } from '@/lib/ai/streaming'
import { questionTemplates } from '@/lib/ai/prompts/creative-direction-system'

interface CreativeDirectionAIDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (text: string) => void
  brandName: string
  stylePreset: string
  aspectRatio: 'landscape' | 'portrait'
}

interface ConversationState {
  messages: Message[]
  currentPhase: 1 | 2 | 3 | 4 | 5
  questionCount: number
  clarificationCount: number
  isStreaming: boolean
  showOptions: boolean
  showCustomInput: boolean
  generatedDirection: string | null
  currentOptions: Option[] | null
}

export function CreativeDirectionAIDialog({
  open,
  onOpenChange,
  onComplete,
  brandName,
  stylePreset,
  aspectRatio,
}: CreativeDirectionAIDialogProps) {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    currentPhase: 1,
    questionCount: 0,
    clarificationCount: 0,
    isStreaming: false,
    showOptions: false,
    showCustomInput: false,
    generatedDirection: null,
    currentOptions: null,
  })

  const [userInput, setUserInput] = useState('')
  const [selectedOtherOption, setSelectedOtherOption] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize conversation when dialog opens
  useEffect(() => {
    if (open && state.messages.length === 0) {
      initializeConversation()
    }
  }, [open])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [state.messages, state.isStreaming])

  const initializeConversation = async () => {
    setState((prev) => ({ ...prev, isStreaming: true }))

    try {
      const response = await fetch('/api/ai/creative-direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: 1,
          questionCount: 0,
          clarificationCount: 0,
          conversationHistory: [],
          brandContext: {
            brandName,
            stylePreset,
            aspectRatio,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to initialize conversation')
      }

      const text = await response.text()
      const { question, options } = parseAIResponse(text)

      setState((prev) => ({
        ...prev,
        messages: [
          {
            role: 'assistant',
            content: question,
            options: options || undefined,
            timestamp: Date.now(),
          },
        ],
        currentOptions: options,
        showOptions: !!options,
        isStreaming: false,
      }))
    } catch (error) {
      console.error('Initialization error:', error)
      toast.error('Failed to start AI assistant')
      setState((prev) => ({ ...prev, isStreaming: false }))
    }
  }

  const handleOptionSelect = async (option: Option) => {
    if (option.isOther) {
      // Show custom input textarea
      setSelectedOtherOption(true)
      setState((prev) => ({ ...prev, showOptions: false }))
    } else {
      // Send option selection directly
      await sendMessage({ selectedOption: option.letter })
      setState((prev) => ({ ...prev, showOptions: false }))
    }
  }

  const handleSendCustomInput = async () => {
    if (!userInput.trim()) return

    const isClarifyingQuestion =
      userInput.includes('?') || /what|how|why|when|can you/i.test(userInput)

    await sendMessage({
      userInput: userInput,
      isClarifyingQuestion,
    })

    setUserInput('')
    setSelectedOtherOption(false)
  }

  const sendMessage = async ({
    selectedOption,
    userInput: customInput,
    isClarifyingQuestion = false,
  }: {
    selectedOption?: string
    userInput?: string
    isClarifyingQuestion?: boolean
  }) => {
    // Add user message to conversation
    const userMessageContent = selectedOption
      ? `Selected: ${state.currentOptions?.find((o) => o.letter === selectedOption)?.text}`
      : customInput || ''

    const newUserMessage: Message = {
      role: 'user',
      content: userMessageContent,
      isClarification: isClarifyingQuestion,
      timestamp: Date.now(),
    }

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, newUserMessage],
      isStreaming: true,
      showOptions: false,
    }))

    try {
      // Determine if we should advance phase and question count
      const shouldAdvanceQuestion = !isClarifyingQuestion
      const newQuestionCount = shouldAdvanceQuestion
        ? state.questionCount + 1
        : state.questionCount
      const newClarificationCount = isClarifyingQuestion
        ? state.clarificationCount + 1
        : state.clarificationCount
      const newPhase =
        newQuestionCount >= 4 ? 5 : ((newQuestionCount + 1) as 1 | 2 | 3 | 4 | 5)

      const response = await fetch('/api/ai/creative-direction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: newPhase,
          questionCount: newQuestionCount,
          clarificationCount: newClarificationCount,
          selectedOption,
          userInput: customInput,
          isClarifyingQuestion,
          conversationHistory: [...state.messages, newUserMessage],
          brandContext: {
            brandName,
            stylePreset,
            aspectRatio,
          },
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Try again in an hour.')
          onOpenChange(false)
          return
        }
        throw new Error('AI request failed')
      }

      // Stream the response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          aiResponse += chunk

          // Update the last AI message with streamed content
          setState((prev) => {
            const messages = [...prev.messages]
            const lastMessage = messages[messages.length - 1]

            if (lastMessage?.role === 'assistant') {
              messages[messages.length - 1] = {
                ...lastMessage,
                content: aiResponse,
              }
            } else {
              messages.push({
                role: 'assistant',
                content: aiResponse,
                timestamp: Date.now(),
              })
            }

            return { ...prev, messages }
          })
        }
      }

      // Parse final response for options
      const { question, options } = parseAIResponse(aiResponse)

      // Check if this is the final generation (phase 5)
      const isFinalGeneration = newPhase === 5 && !options

      setState((prev) => ({
        ...prev,
        currentPhase: newPhase,
        questionCount: newQuestionCount,
        clarificationCount: newClarificationCount,
        currentOptions: options,
        showOptions: !!options,
        isStreaming: false,
        generatedDirection: isFinalGeneration ? aiResponse : null,
      }))
    } catch (error) {
      console.error('Send message error:', error)
      toast.error('Something went wrong. Please try again.')
      setState((prev) => ({ ...prev, isStreaming: false }))
    }
  }

  const handleUseDirection = () => {
    if (state.generatedDirection) {
      onComplete(state.generatedDirection)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Creative Direction AI Assistant
          </DialogTitle>
          <DialogDescription>
            Answer a few questions to generate a professional creative brief
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`h-2 flex-1 rounded-full transition-colors ${
                step <= state.currentPhase
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4">
            {state.messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}

            {state.isStreaming && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="space-y-3 pt-4 border-t">
          {/* Option Buttons */}
          {state.showOptions && state.currentOptions && (
            <div className="space-y-2">
              {state.currentOptions.map((option) => (
                <Button
                  key={option.letter}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 hover:bg-primary/10 hover:border-primary"
                  onClick={() => handleOptionSelect(option)}
                  disabled={state.isStreaming}
                >
                  <div className="flex items-start gap-3 w-full">
                    <span className="font-bold text-primary min-w-[1.5rem]">
                      {option.letter}.
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {option.isOther && (
                      <Edit3 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Custom Input */}
          {(selectedOtherOption || (!state.showOptions && !state.generatedDirection)) && (
            <div className="flex gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={
                  selectedOtherOption
                    ? 'Describe your custom creative direction...'
                    : 'Type your answer or ask a question...'
                }
                disabled={state.isStreaming}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendCustomInput()
                  }
                }}
                className="resize-none"
                rows={3}
              />
              <Button
                onClick={handleSendCustomInput}
                disabled={state.isStreaming || !userInput.trim()}
                size="icon"
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Use Direction Button */}
          {state.generatedDirection && (
            <Button
              onClick={handleUseDirection}
              className="w-full"
              size="lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Use This Creative Direction
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
