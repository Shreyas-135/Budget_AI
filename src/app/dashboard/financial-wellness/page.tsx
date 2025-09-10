
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { wellnessCounselor } from "@/ai/flows/wellness-counselor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Send, Sparkles } from "lucide-react";
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

export default function FinancialWellnessPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      prompt: "",
    },
  });

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
      const result = await wellnessCounselor({ history, prompt: data.prompt });
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: result.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error with AI wellness counselor:", error);
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
         <h1 className="text-2xl font-bold font-headline tracking-tight">Financial Wellness Counselor</h1>
         <p className="text-muted-foreground">A safe space to talk about your relationship with money. This is not a replacement for therapy.</p>
       </div>
      <div className="flex-grow p-4 sm:px-6 overflow-hidden">
        <Card className="h-full flex flex-col">
            <CardContent className="p-0 flex-grow flex flex-col">
                <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                    <div className="space-y-6">
                         <div className="flex items-start gap-4">
                            <Avatar>
                                <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-3 bg-muted">
                                <p className="text-sm">Hello. I'm here to listen. How are you feeling about your finances today?</p>
                            </div>
                        </div>
                        {messages.map((message, index) => (
                            <div key={index} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                                {message.role === 'assistant' && (
                                    <Avatar>
                                        <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
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
                                    <AvatarFallback><Sparkles className="w-4 h-4" /></AvatarFallback>
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
                                        <Input placeholder="Share what's on your mind..." {...field} autoComplete="off"/>
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
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
