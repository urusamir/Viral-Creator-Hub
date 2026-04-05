/**
 * Shared platform icons, colors, and PlatformIcon component.
 * Used consistently by Calendar, Payments, and other dashboard pages.
 *
 * NOTE: The Discover page has its own PlatformIcon with a different API (size prop).
 * Do NOT import this there — the Discover page is intentionally isolated.
 */
import { SiInstagram, SiYoutube, SiTiktok, SiLinkedin } from "react-icons/si";
import { SiX as SiXIcon } from "react-icons/si";

export const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: SiInstagram,
  YouTube: SiYoutube,
  TikTok: SiTiktok,
  "Twitter/X": SiXIcon,
  LinkedIn: SiLinkedin,
};

export const platformColors: Record<string, string> = {
  Instagram: "text-pink-500",
  YouTube: "text-red-500",
  TikTok: "text-foreground",
  "Twitter/X": "text-foreground",
  LinkedIn: "text-blue-600",
};

export function PlatformIcon({
  platform,
  className = "w-3.5 h-3.5",
}: {
  platform: string;
  className?: string;
}) {
  const Icon = platformIcons[platform];
  if (!Icon) return null;
  return <Icon className={`${className} ${platformColors[platform] || ""}`} />;
}
