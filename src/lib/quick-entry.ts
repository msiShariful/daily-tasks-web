/**
 * Quick entry for the new-task dialog.
 *
 * You paste one string - "52640 - Yazan Al Masri" - and we split it into the
 * ticket number and the client name, so neither has to be typed separately.
 *
 * The separator is a dash surrounded by whitespace (" - "), which keeps codes
 * that contain their own dash intact: "6AM-1234 - Acme Foods" splits once,
 * after "6AM-1234". En and em dashes are accepted because they are what you
 * get when a value is copied out of a document.
 */

/** A dash with whitespace on both sides, i.e. the separator - not a dash inside a code. */
const SEPARATOR = /\s+[-–—]\s+/;

export interface QuickEntry {
  /** Text before the separator, e.g. "52640". Empty when none was given. */
  taskCode: string;
  /** Text after the separator, e.g. "Yazan Al Masri". Empty when none was given. */
  clientName: string;
}

export function parseQuickEntry(input: string): QuickEntry {
  const value = input.trim();
  if (value === "") return { taskCode: "", clientName: "" };

  const match = SEPARATOR.exec(value);
  if (match) {
    return {
      taskCode: value.slice(0, match.index).trim(),
      clientName: value.slice(match.index + match[0].length).trim(),
    };
  }

  // No separator yet. A single word is a ticket number being typed; anything
  // with a space is a client name.
  return /\s/.test(value) ? { taskCode: "", clientName: value } : { taskCode: value, clientName: "" };
}

/** Case-insensitive, whitespace-tolerant name match - the same rule the API uses. */
export function sameClientName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
