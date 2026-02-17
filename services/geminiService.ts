
import { GoogleGenAI, Type } from "@google/genai";

// Fixed: Correctly initialize GoogleGenAI with the apiKey named parameter using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateJavaImplementation = async (topic: string): Promise<string> => {
  const prompt = `Generate a high-quality Java 21+ code snippet for a "High-Throughput Fan-Out Engine" focusing on the following aspect: ${topic}. 
  The implementation must use modern best practices like:
  - Virtual Threads (Thread.ofVirtual())
  - Strategy Pattern for transformations
  - BlockingQueues for backpressure
  - Robust error handling with retries (max 3)
  - Config-driven design
  - Streaming file I/O for 100GB+ files
  Provide only the relevant Java code with brief comments.`;

  try {
    // Fixed: Use correct model name 'gemini-3-pro-preview' for complex coding tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 2048 }
      }
    });
    // Fixed: response.text is a property, not a method
    return response.text || "Failed to generate code.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error generating code: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export const getArchitectureExplanation = async (): Promise<string> => {
  const prompt = `Explain the architecture of a high-throughput Java data fan-out engine that processes 100GB files, fans out to 4 different sinks (REST, gRPC, MQ, DB), handles backpressure, and ensures zero data loss. Mention specific design patterns like Strategy, Factory, and Observer.`;
  
  try {
    // Fixed: Use 'gemini-3-flash-preview' for general text generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Fixed: response.text is a property, not a method
    return response.text || "No explanation available.";
  } catch (error) {
    return "Failed to fetch architecture overview.";
  }
};
