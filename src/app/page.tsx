import DashboardClient from "@/components/DashboardClient";
import { INITIAL_PRODUCTS, INITIAL_SHOPS } from "@/lib/mock-data";

export default function HomePage() {
  return (
    <DashboardClient
      initialProducts={INITIAL_PRODUCTS}
      initialShops={INITIAL_SHOPS}
    />
  );
}
