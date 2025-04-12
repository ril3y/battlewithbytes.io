import { PowerCommand } from './commands/PowerCommand'
import { HelpCommand } from  './commands/HelpCommand'
import { ExitCommand } from './commands/ExitCommand'
import { Command } from './commands/Command'

export const loadCommands = (): Record<string, Command> => {
  const commands: Command[] = [
    new HelpCommand(),
    new PowerCommand(), 
    new ExitCommand(),
  ]

  const commandMap: Record<string, Command> = {}

  commands.forEach(cmd => {
    commandMap[cmd.name] = cmd
  })

  return commandMap
}
