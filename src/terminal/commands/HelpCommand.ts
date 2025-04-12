import { Command } from './Command'
import { loadCommands } from '../CommandRegistry'

export class HelpCommand extends Command {
  name = 'help'
  description = 'List available commands'
  usage = 'help'

  execute(): string {
    const registry = loadCommands()

    let output = 'Available Commands:\n'

    Object.values(registry).forEach((cmd) => {
      output += `- ${cmd.name}: ${cmd.description}\n`
    })

    return output
  }
}
