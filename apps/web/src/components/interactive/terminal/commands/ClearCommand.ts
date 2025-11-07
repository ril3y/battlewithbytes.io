import { Command } from './Command';

export class ClearCommand extends Command {
  name = 'clear';
  description = 'Clear the terminal screen';
  usage = 'clear';

  execute(): string {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('quake-clear', { detail: {} });
      window.dispatchEvent(event);
    }
    return '';
  }
}
