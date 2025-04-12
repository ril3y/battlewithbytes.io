"use client"

import { useState, useEffect } from "react"
import Console from "react-console-emulator"
import { loadCommands } from "@/terminal/CommandRegistry"

const registry = loadCommands()

// Map command instances to the format expected by react-console-emulator.
// Note: `execute` expects an array of strings.
const commands = Object.fromEntries(
  Object.entries(registry).map(([name, cmd]) => [
    name,
    {
      description: cmd.description,
      usage: cmd.usage,
      // Pass the arguments as an array and handle both sync and async results
      fn: async (...args: string[]) => {
        const result = cmd.execute(args);
        // Handle both synchronous and asynchronous results
        return result instanceof Promise ? await result : result;
      },
    },
  ])
)

// Custom welcome component for the terminal
const TerminalWelcome = () => (
  <div className="terminal-welcome">
    <div className="ascii-art">BATTLE WITH BYTES</div>
    <p className="terminal-tagline">Ask me about little data.</p>
    <p className="terminal-help">Type &apos;help&apos; to see available commands</p>
  </div>
)

export default function QuakeTerminal() {
  const [open, setOpen] = useState(false)

  // Handle closing the terminal
  const handleExit = () => {
    setOpen(false)
    const input = document.querySelector(
      'input[name="react-console-emulator__input"]'
    ) as HTMLInputElement | null
    if (input) {
      input.value = ""
    }
    const output = document.querySelector(
      '[name="react-console-emulator__content"]'
    )
    if (output) {
      output.innerHTML = ""
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "~" || event.code === "Backquote") {
        event.preventDefault()
        event.stopImmediatePropagation()
        setOpen((prev) => !prev)
        // Clear any stray tilde characters from the input after toggling.
        setTimeout(() => {
          const input = document.querySelector(
            'input[name="react-console-emulator__input"]'
          ) as HTMLInputElement | null
          if (input) {
            input.value = input.value.replace(/~/g, "")
          }
        }, 0)
      }
    }
    
    document.addEventListener("keydown", handleKeyDown, { capture: true })
    window.addEventListener("quake-exit", handleExit as EventListener)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true })
      window.removeEventListener("quake-exit", handleExit as EventListener)
    }
  }, [])

  // Focus the terminal input when the terminal is opened.
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const input = document.querySelector(
          'input[name="react-console-emulator__input"]'
        ) as HTMLInputElement | null
        input?.focus()
      }, 0)
    }
  }, [open])

  return (
    <div
      className={`
        fixed top-0 left-0 w-full bg-black/95 text-green-400 z-50 
        shadow-[0_0_15px_rgba(0,255,157,0.3)] border-b border-green-400/30
        transition-all duration-500 ease-in-out
        max-h-[40vh] overflow-hidden
        backdrop-blur-sm
        ${open ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400/0 via-green-400 to-green-400/0"></div>
      <div className="absolute top-1 right-4 flex space-x-2 p-2">
        <button 
          onClick={handleExit}
          className="text-xs text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded px-2 py-1 font-mono"
        >
          close [~]
        </button>
      </div>
      
      {/* Add custom CSS for terminal styling */}
      <style jsx global>{`
        .terminal-welcome {
          padding: 1rem 0;
        }
        
        .ascii-art {
          color: #00ff9d;
          font-weight: bold;
          margin: 0 0 12px 0;
          font-size: 1.8rem;
          letter-spacing: 2px;
          font-family: var(--font-geist-mono), monospace;
          text-shadow: 0 0 5px rgba(0, 255, 157, 0.5);
        }
        
        .terminal-tagline {
          color: #ffffff;
          margin: 0 0 4px 0;
        }
        
        .terminal-help {
          color: #888888;
          margin: 0 0 12px 0;
        }
        
        .react-console-emulator {
          background: transparent !important;
        }
        
        .react-console-emulator__prompt {
          color: #00ff9d !important;
          font-weight: bold !important;
        }
        
        .react-console-emulator__input {
          caret-color: #00ff9d !important;
          color: white !important;
        }
      `}</style>
      
      <Console
        autoFocus={true}
        commands={commands}
        welcomeMessage={<TerminalWelcome />}
        promptLabel="> "
        noDefaults={true}
        style={{
          minHeight: "250px",
          maxHeight: "40vh",
          overflow: "auto",
          padding: "2rem 1rem 1rem 1rem",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "0.9rem",
          lineHeight: "1.5",
          backgroundColor: "transparent",
        }}
        contentStyle={{
          padding: "1rem",
          color: "#ededed",
        }}
        inputStyle={{
          color: "#ededed",
          caretColor: "#00ff9d",
          fontFamily: "var(--font-geist-mono), monospace",
        }}
        messageStyle={{
          color: "#00ff9d",
          fontWeight: "bold",
        }}
      />
    </div>
  )
}
