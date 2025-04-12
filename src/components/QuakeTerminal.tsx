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
      fn: (...args: string[]) => cmd.execute(args),
    },
  ])
)

// Fixed ASCII banner for battlewithbytes.
const asciiArt = `
█▄▄ ▄▀█ ▀█▀ ▀█▀ █    █▀▀   █ █ █ █ ▀█▀ █ █   █▄▄ █▄█ ▀█▀ █▀▀ █▀
█▄█ █▀█  █   █  █▄▄ ██▄   ▀▄▀▄▀ █  █  █▀█   █▄█  █   █  ██▄ ▄█

Ask me about little data.
`

export default function QuakeTerminal() {
  const [open, setOpen] = useState(false)

  // Listener to toggle the terminal with tilde/backquote.
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

    const handleExit = () => {
      setOpen(false)
      // Clear the input field.
      const input = document.querySelector(
        'input[name="react-console-emulator__input"]'
      ) as HTMLInputElement | null
      if (input) {
        input.value = ""
      }
      // Do not manipulate innerHTML of output to avoid conflicts with React.
    }

    document.addEventListener("keydown", handleKeyDown, { capture: true })
    window.addEventListener("quake-exit", handleExit as EventListener)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true })
      window.removeEventListener("quake-exit", handleExit as EventListener)
    }
  }, [])

  // When terminal opens, focus its input field.
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
        fixed top-0 left-0 w-full bg-gray-900 text-green-300 z-50 shadow-2xl
        transition-transform duration-500 ease-in-out
        max-h-[33vh] overflow-hidden
        ${open ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <Console
        autoFocus={true}
        commands={commands}
        welcomeMessage={asciiArt}
        promptLabel="> "
        noDefaults={true}
      />
    </div>
  )
}
