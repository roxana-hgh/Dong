import Link from "next/link";

type AuthHeaderProps = {
  prompt: string;
  linkLabel: string;
  href: string;
};

export function AuthHeader({ prompt, linkLabel, href }: AuthHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <Link href="/" className="text-3xl font-semibold tracking-tight text-primary">
        dong
      </Link>
      <p className="text-right text-xs text-muted-foreground">
        {prompt}
        <br />
        <Link href={href} className="font-medium text-primary hover:underline">
          {linkLabel}
        </Link>
      </p>
    </div>
  );
}