const MAX_TITLE_LENGTH = 50;

export function truncateTitle(title: string, maxLength = MAX_TITLE_LENGTH): string {
  if (title.length <= maxLength) {
    return title;
  }

  return `${title.slice(0, maxLength - 1)}…`;
}
