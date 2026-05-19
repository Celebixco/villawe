const DEMO_TITLE_PREFIX = "[Demo]";

export function parseDemoVillaTitle(title: string) {
  const normalizedTitle = title.trim();
  const isDemo = normalizedTitle.startsWith(DEMO_TITLE_PREFIX);
  const displayTitle = isDemo
    ? normalizedTitle.replace(/^\[Demo\]\s*/u, "").trim()
    : normalizedTitle;

  return {
    isDemo,
    displayTitle: displayTitle || normalizedTitle,
    demoBadgeLabel: DEMO_TITLE_PREFIX,
  };
}
