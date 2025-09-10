
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { personalAssistant } from "@/ai/flows/personal-assistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Mic, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

const chatSchema = z.object({
  prompt: z.string().min(1, "Message is required."),
});

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const form = useForm({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const handleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Browser not supported",
        description: "Your browser does not support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onstart = () => {
      setIsRecording(true);
    };

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      form.setValue('prompt', transcript);
      form.handleSubmit(onSubmit)(); // Automatically submit after getting result
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      toast({
        title: "Voice Error",
        description: `An error occurred during voice recognition: ${event.error}`,
        variant: "destructive",
      });
    };
    
    recognitionRef.current.onend = () => {
        setIsRecording(false);
    }

    recognitionRef.current.start();
  };

  const onSubmit = async (data: z.infer<typeof chatSchema>) => {
    setLoading(true);
    const userMessage: ChatMessage = { role: "user", content: data.prompt };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();

    try {
      const history = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          content: [{text: msg.content}]
      }));
      const result = await personalAssistant({ history, prompt: data.prompt });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error with AI assistant:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
       setMessages(messages => messages.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  return (
    <div className="h-[calc(100vh-theme(spacing.16))] flex flex-col">
       <div className="p-4 sm:px-6 border-b">
         <h1 className="text-2xl font-bold font-headline tracking-tight">AI Assistant</h1>
         <p className="text-muted-foreground">Ask questions, add transactions with your voice, and more.</p>
       </div>
      <div className="flex-grow p-4 sm:px-6 overflow-hidden">
        <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-grow flex flex-col">
                <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                    <div className="space-y-6">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                                {message.role === 'assistant' && (
                                    <Avatar>
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg p-3 max-w-2xl", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                    <ReactMarkdown className="prose dark:prose-invert">
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                                {message.role === 'user' && (
                                     <Avatar>
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {loading && (
                            <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarFallback>AI</AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg p-3 bg-muted flex items-center">
                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                </div>
                            </div>
                         )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                             <FormField
                                control={form.control}
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                    <FormControl>
                                        <Input placeholder="e.g., 'I spent $15 on lunch' or ask a question" {...field} autoComplete="off"/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                             <Button type="button" variant={isRecording ? "destructive" : "outline"} size="icon" onClick={handleVoiceRecording} disabled={loading}>
                                <Mic className="h-4 w-4"/>
                                <span className="sr-only">Record voice</span>
                             </Button>
                            <Button type="submit" disabled={loading} size="icon">
                                <Send className="h-4 w-4"/>
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </Form>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
