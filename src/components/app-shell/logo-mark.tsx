import Image from "next/image";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="UCP"
      width={64}
      height={64}
      className={className}
      priority
    />
  );
}
