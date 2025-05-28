import { PowerCommand } from './commands/PowerCommand'
import { HelpCommand } from  './commands/HelpCommand'
import { ExitCommand } from './commands/ExitCommand'
import { LsCommand } from './commands/LsCommand'
import { Command } from './commands/Command'
import { BannerCommand } from './commands/BannerCommand'
import { SudoCommand } from './commands/SudoCommand'
import { FortuneCommand } from './commands/FortuneCommand'
import { ClearCommand } from './commands/ClearCommand'

export const loadCommands = (): Record<string, Command> => {
  const commands: Command[] = [
    new HelpCommand(),
    new PowerCommand(), 
    new ExitCommand(),
    new LsCommand(),
    new BannerCommand(),
    new SudoCommand(),
    new FortuneCommand(),
    new ClearCommand(),
  ]

  const commandMap: Record<string, Command> = {}

  commands.forEach(cmd => {
    commandMap[cmd.name] = cmd
  })

  return commandMap
}
