import ClientLayoutWrapper from "@/components/shop/ClientLayoutWrapper";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
