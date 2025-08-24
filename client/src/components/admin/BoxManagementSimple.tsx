import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BoxManagementSimple() {
  const [activeTab, setActiveTab] = useState('boxes');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Box Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="boxes" className="data-[state=active]:bg-blue-600">
            Boxes
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-blue-600">
            Products
          </TabsTrigger>
          <TabsTrigger value="brands" className="data-[state=active]:bg-blue-600">
            Brands
          </TabsTrigger>
        </TabsList>

        <TabsContent value="boxes">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Manage Boxes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Box management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Manage Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Product management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Manage Brands</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">Brand management functionality will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}