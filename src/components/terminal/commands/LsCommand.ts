import { Command } from './Command'

interface BlogPost {
  slug: string;
  metadata: {
    title: string;
    date: string;
    tags: string[];
    excerpt: string;
    author: string;
    [key: string]: string | string[] | number | boolean | undefined;
  };
}

export class LsCommand extends Command {
  name = 'ls'
  description = 'List blog posts'
  usage = 'ls [blogs]'

  async execute(args: string[]): Promise<string> {
    // If no arguments or first argument is 'blogs', list blog posts
    if (args.length === 0 || args[0] === 'blogs') {
      return this.listBlogs();
    } else {
      return `Unknown argument: ${args[0]}\nUsage: ${this.usage}`;
    }
  }

  private async listBlogs(): Promise<string> {
    try {
      // Fetch blog data from the generated JSON file
      const response = await fetch('/blog-data.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch blog data: ${response.statusText}`);
      }
      
      const posts: BlogPost[] = await response.json();
      
      if (!posts || posts.length === 0) {
        return 'No blog posts found.';
      }
      
      // Sort posts by date (newest first)
      posts.sort((a, b) => {
        const dateA = new Date(a.metadata.date || '');
        const dateB = new Date(b.metadata.date || '');
        return dateB.getTime() - dateA.getTime();
      });
      
      // Format the output
      let output = 'BATTLE WITH BYTES - Blog Posts\n\n';
      output += 'SLUG                      DATE            TAGS\n';
      output += '------------------------------------------------------\n';
      
      // Display the posts in a simple format
      posts.forEach((post) => {
        const slug = post.slug.padEnd(25);
        const date = (post.metadata.date || 'N/A').padEnd(15);
        const tags = Array.isArray(post.metadata.tags) 
          ? post.metadata.tags.map(tag => `#${tag}`).join(' ')
          : 'No tags';
        
        output += `${slug} ${date} ${tags}\n`;
      });
      
      output += `\nTotal: ${posts.length} blog posts`;
      
      return output;
    } catch (error) {
      return `ERROR: ${(error as Error).message}`;
    }
  }
}
