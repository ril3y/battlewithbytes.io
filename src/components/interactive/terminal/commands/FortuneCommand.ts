import { Command } from './Command'

const FORTUNES = [
  'The quieter you become, the more you are able to hear. – Kali Linux',
  'There is no patch for human stupidity. – Kevin Mitnick',
  'Hack the planet!',
  'With great power comes great responsibility.',
  'Security is not a product, but a process. – Bruce Schneier',
  'grep life /dev/urandom',
  'To err is human, to really foul things up you need a computer.',
  'rm -rf /fear',
  'Stay paranoid, stay safe.',
  '0xCAFEBABE',
  'root@battlewithbytes:~#',
  'There are only two types of companies: those that have been hacked, and those that will be. – Robert Mueller',
];

export class FortuneCommand extends Command {
  name = 'fortune';
  description = 'Print a random hacker/cybersecurity fortune';
  usage = 'fortune';

  execute(): string {
    const idx = Math.floor(Math.random() * FORTUNES.length);
    return FORTUNES[idx];
  }
}
