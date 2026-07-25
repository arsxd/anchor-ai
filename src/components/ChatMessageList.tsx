import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/types";

interface ChatMessageListProps {
  messages: ChatMessage[];
  streamingText: string;
  isLoading: boolean;
  onSpeakMessage: (text: string) => void;
}

export function ChatMessageList({
  messages,
  streamingText,
  isLoading,
  onSpeakMessage,
}: ChatMessageListProps) {
  return (
    <>
      {messages.length === 0 && !streamingText && (
        <div className="text-center text-muted-foreground py-12">
          <p className="text-lg font-medium mb-2">Hello. I&apos;m AnchorAI.</p>
          <p className="text-sm">Your recovery companion. Talk, type, or use voice — I&apos;m here 24/7.</p>
          <p className="text-xs mt-4">Try saying: &quot;I&apos;m feeling anxious about tonight&quot;</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <Card
            className={`max-w-[80%] p-3 ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            {msg.role === "assistant" && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-6 text-xs"
                onClick={() => onSpeakMessage(msg.content)}
                aria-label="Read message aloud"
              >
                🔊 Read Aloud
              </Button>
            )}
          </Card>
        </div>
      ))}

      {streamingText && (
        <div className="flex justify-start">
          <Card className="max-w-[80%] p-3 bg-muted">
            <p className="text-sm whitespace-pre-wrap">{streamingText}</p>
            <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" aria-hidden="true" />
          </Card>
        </div>
      )}

      {isLoading && !streamingText && (
        <div className="flex justify-start">
          <Card className="p-3 bg-muted">
            <div className="flex gap-1" aria-label="AI is thinking">
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
