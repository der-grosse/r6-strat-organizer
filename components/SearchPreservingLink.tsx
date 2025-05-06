import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface SearchPreservingLinkProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Link>, "href"> {
  href?: string;
}

export default function SearchPreservingLink(props: SearchPreservingLinkProps) {
  const { href, ...rest } = props;
  const searchParams = useSearchParams();
  return (
    <Link
      {...rest}
      href={{
        pathname: href,
        query: Object.fromEntries(searchParams.entries()),
      }}
    />
  );
}
