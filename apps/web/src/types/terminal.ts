// Terminal and command-related types

export interface Command {
  name: string;
  description: string;
  usage: string;
  execute(args: string[], context: CommandContext): CommandResult;
}

export interface CommandContext {
  setPrompt?: (prompt: string) => void;
  getHistory?: () => string[];
  clearHistory?: () => void;
  currentDirectory?: string;
  environmentVariables?: Record<string, string>;
}

export interface CommandResult {
  output: string | React.ReactNode;
  success: boolean;
  clearScreen?: boolean;
  newPrompt?: string;
}

export interface TerminalState {
  history: string[];
  currentCommand: string;
  isProcessing: boolean;
  prompt: string;
}

export interface TerminalCommand {
  command: string;
  output: string | React.ReactNode;
  timestamp: Date;
  success: boolean;
}