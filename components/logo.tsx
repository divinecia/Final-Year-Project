import Image from 'next/image';
import icon from '@/components/icons/icon.png';

export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={icon}
      alt="Househelp Logo"
      width={100}
      height={100}
      className={className}
      priority
    />
  );
}

export function LogoWithName() {
  return (
    <div className="flex items-center gap-2">
      <Logo className="h-8 w-8" />
      <span className="font-headline text-xl font-bold tracking-tight text-foreground">
        Househelp
      </span>
    </div>
  );
}
