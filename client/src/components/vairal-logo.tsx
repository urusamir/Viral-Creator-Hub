import logoSrc from "@assets/Untitled_design_1770845033922.png";

export function VairalLogo({ className = "h-8" }: { className?: string }) {
  return (
    <img
      src={logoSrc}
      alt="Vairal"
      className={`${className} w-auto dark:brightness-0 dark:invert`}
    />
  );
}
