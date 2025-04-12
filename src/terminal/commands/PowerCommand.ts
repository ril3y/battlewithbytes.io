import { Command } from './Command'

export class PowerCommand extends Command {
  name = 'power'
  description = 'Calculate power using Ohm’s Law (P = V * I)'
  usage = 'power <voltage> <current>'

  execute(args: string[]): string {
    if (args.length !== 2) {
      return `Invalid args.\nUsage: ${this.usage}`
    }

    const voltage = parseFloat(args[0])
    const current = parseFloat(args[1])

    if (isNaN(voltage) || isNaN(current)) {
      return 'Error: voltage and current must be numbers.'
    }

    const power = voltage * current
    return `Power = ${power.toFixed(2)} watts`
  }
}
