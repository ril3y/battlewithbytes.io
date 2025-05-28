import { Command } from './Command';

export class BannerCommand extends Command {
  name = 'banner';
  description = 'Display a cyberpunk ASCII art banner';
  usage = 'banner';

  execute(): string {
    // ASCII art styled for the Battle With Bytes theme
    return [
      '',
      '\x1b[38;2;0;255;157m',
      '  ____        _   _     _      _     _ _     _     _           _       _           _         ',
      ' |  _ \\      | | | |   | |    | |   | | |   | |   | |         | |     | |         | |        ',
      ' | |_) | __ _| |_| |__ | |__  | |__ | | | __| | __| | ___  ___| |_ ___| |__   __ _| |_ __ _  ',
      " |  _ < / _` | __| '_ \\| '_ \\ | '_ \\| | |/ _` |/ _` |/ _ \\/ __| __/ __| '_ \\ / _` | __/ _` |",
      ' | |_) | (_| | |_| | | | |_) | | |_) | | | (_| | (_| |  __/ (__| || (__| | | | (_| | || (_| |',
      ' |____/ \\__,_|\\__|_| |_|_.__/ |_.__/|_|_|\\__,_|\\__,_|\\___|\\___|\\__\\___|_| |_|\\__,_|\\__\\__,_|',
      '\x1b[0m',
      ''
    ].join('\n');
  }
}
