"use client"

import { useState, useEffect } from 'react'
import Console from 'react-console-emulator'
import { loadCommands } from '@/terminal/CommandRegistry'

const registry = loadCommands()

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

export default function QuakeTerminal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '~' || e.code === 'Backquote') {
        e.preventDefault();
        e.stopImmediatePropagation();
  
        // Use the functional state update so we can check the previous open state.
        setOpen((prev) => {
          // If the terminal is currently open, blur the input field to help prevent text insertion.
          if (prev) {
            const input = document.querySelector(
              'input[name="react-console-emulator__input"]'
            ) as HTMLInputElement | null;
            input?.blur();
          }
          return !prev;
        });
  
        // In a timeout, clear any stray tilde characters from the input field.
        setTimeout(() => {
          const input = document.querySelector(
            'input[name="react-console-emulator__input"]'
          ) as HTMLInputElement | null;
          if (input) {
            input.value = input.value.replace(/~/g, '');
          }
        }, 0);
      }
    };
  
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);
  

  return (
    <div
      className={`
        fixed top-0 left-0 w-full bg-gray-900 text-green-300 z-50 shadow-2xl
        transition-transform duration-500 ease-in-out
        max-h-[33vh] overflow-hidden
        ${open ? 'translate-y-0' : '-translate-y-full'}
      `}
    >
      <Console
        commands={commands}
        welcomeMessage="Welcome to Battle With Bytes Terminal"
        promptLabel="> "
        noDefaults={true}
      />
    </div>
  )
}
