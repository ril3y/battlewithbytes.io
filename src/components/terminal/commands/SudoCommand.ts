import { Command } from './Command'

export class SudoCommand extends Command {
  name = 'sudo'
  description = 'Try to execute a command as root (for fun)'
  usage = 'sudo [command]'

  execute(args: string[]): string {
    return 'Permission denied: You are not root!';
  }
}
