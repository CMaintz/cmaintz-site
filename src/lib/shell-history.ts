/** The homepage shell's line editing: Up/Down history recall and Tab completion, kept free of the DOM. */
export class ShellHistory {
  #past: string[] = [];
  /** Index into the history; its length means the line still being typed. */
  #cursor = 0;
  #draft = '';

  /** Stores a submitted line (blank lines and repeats of the last one are skipped) and resets recall. */
  remember(line: string) {
    const cmd = line.trim();
    if (cmd && cmd !== this.#past.at(-1)) this.#past.push(cmd);
    this.#cursor = this.#past.length;
    this.#draft = '';
  }

  /**
   * Moves `step` through the history (-1 older, +1 newer) and returns the line to show, or
   * undefined at either end. Leaving the line being typed keeps it aside; coming back restores it.
   */
  recall(step: number, current: string): string | undefined {
    const next = Math.min(Math.max(this.#cursor + step, 0), this.#past.length);
    if (next === this.#cursor) return undefined;
    if (this.#cursor === this.#past.length) this.#draft = current;
    this.#cursor = next;
    return next === this.#past.length ? this.#draft : this.#past[next];
  }
}

/** Commands that start with what has been typed, ignoring case and surrounding spaces. */
export const completions = (typed: string, commands: readonly string[]) =>
  commands.filter((c) => c.startsWith(typed.trim().toLowerCase()));
