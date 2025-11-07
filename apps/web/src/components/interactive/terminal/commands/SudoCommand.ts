import { Command } from './Command'

export class SudoCommand extends Command {
  name = 'sudo'
  description = 'Try to execute a command as root (for fun)'
  usage = 'sudo [command]'

  execute(args: string[]): string { // eslint-disable-line @typescript-eslint/no-unused-vars
    return 'Permission denied: You are not root!';
  }
}
