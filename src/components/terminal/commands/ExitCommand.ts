import { Command } from './Command'

export class ExitCommand extends Command {
  name = 'exit'
  description = 'Close the terminal and clear history'
  usage = 'exit'

  execute(): string {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('quake-exit', { detail: { clear: true } })
      window.dispatchEvent(event)
    }

    return 'Closing terminal...'
  }
}
