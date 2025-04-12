export abstract class Command {
    abstract name: string
    abstract description: string
    abstract usage: string
  
    abstract execute(args: string[]): string | Promise<string>
  
    help(): string {
      return `${this.name} - ${this.description}\nUsage: ${this.usage}`
    }
  }
  