import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AIModel, ChatMessage } from "@shared/schema";

export function useAIChat() {
  const queryClient = useQueryClient();

  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ["/api/chat/history"],
    refetchInterval: 5000,
  });

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; model: AIModel }) => {
      const response = await apiRequest("/api/chat", {
        method: "POST", 
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/history"] });
    },
  });

  const instructionMutation = useMutation({
    mutationFn: async (data: { instruction: string; model: AIModel }) => {
      const response = await apiRequest("/api/instruction", {
        method: "POST",
        body: JSON.stringify(data)
      });
      return response.json();
    },
  });

  return {
    chatHistory: chatHistory as ChatMessage[],
    isLoading,
    sendMessage: chatMutation.mutate,
    sendInstruction: instructionMutation.mutate,
    isProcessing: chatMutation.isPending || instructionMutation.isPending,
  };
}
