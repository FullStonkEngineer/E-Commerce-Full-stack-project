import { useEffect, useState } from "react";
import { BarChart, PlusCircle, ShoppingBasket } from "lucide-react";

import { useProductStore } from "../stores/useProductStore";

import PageContainer from "../components/ui/PageContainer.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";
import AdminTabs from "../components/admin/AdminTabs.jsx";

import CreateProductTab from "../components/admin/CreateProductTab.jsx";
import ProductsListTab from "../components/admin/ProductsListTab.jsx";
import AnalyticsTab from "../components/admin/analytics/AnalyticsTab.jsx";

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const { fetchAllProducts } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);
  return (
    <PageContainer>
      <AdminLayout title='Admin Dashboard'>
        <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "create" && <CreateProductTab />}
        {activeTab === "products" && <ProductsListTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </AdminLayout>
    </PageContainer>
  );
};

export default AdminPage;
