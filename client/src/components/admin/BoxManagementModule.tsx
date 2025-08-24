import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Package, Tags } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency, getRarityClass } from "@/lib/utils";
import ImageUpload from "@/components/ImageUpload";
import type { Box, Item } from "@shared/schema";

export default function BoxManagementModule() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Use state-based tab management instead of route-based
  const [activeTab, setActiveTab] = useState('boxes');

  // State for box product management
  const [boxProductsDialogOpen, setBoxProductsDialogOpen] = useState(false);
  const [selectedBoxForProducts, setSelectedBoxForProducts] = useState<Box | null>(null);
  const [boxProductsTab, setBoxProductsTab] = useState('assigned');

  // Data queries
  const { data: boxes = [], isLoading: boxesLoading } = useQuery({
    queryKey: ["/api/admin/boxes"],
  });

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["/api/admin/items"],
  });

  // Query for box-specific products
  const { data: boxProducts = [], isLoading: boxProductsLoading } = useQuery({
    queryKey: ["/api/admin/boxes", selectedBoxForProducts?.id, "items"],
    enabled: !!selectedBoxForProducts?.id,
  });

  // Mutations for boxes
  const createBoxMutation = useMutation({
    mutationFn: (boxData: any) => apiRequest("POST", "/api/admin/boxes", boxData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boxes"] });
      toast({ title: "Box created successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create box", variant: "destructive" });
    },
  });

  const updateBoxMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/admin/boxes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boxes"] });
      toast({ title: "Box updated successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update box", variant: "destructive" });
    },
  });

  const deleteBoxMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/boxes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boxes"] });
      toast({ title: "Box deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete box", variant: "destructive" });
    },
  });

  // Mutations for products
  const createProductMutation = useMutation({
    mutationFn: (productData: any) => apiRequest("POST", "/api/admin/items", productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({ title: "Product created successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create product", variant: "destructive" });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest("PUT", `/api/admin/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({ title: "Product updated successfully" });
      setDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to update product", variant: "destructive" });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({ title: "Product deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete product", variant: "destructive" });
    },
  });

  // Mutations for box product assignments
  const addProductToBoxMutation = useMutation({
    mutationFn: ({ boxId, itemId }: { boxId: number; itemId: number }) => 
      apiRequest("POST", `/api/admin/boxes/${boxId}/items`, { itemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boxes", selectedBoxForProducts?.id, "items"] });
      toast({ title: "Product added to box successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add product to box", variant: "destructive" });
    },
  });

  const removeProductFromBoxMutation = useMutation({
    mutationFn: ({ boxId, itemId }: { boxId: number; itemId: number }) => 
      apiRequest("DELETE", `/api/admin/boxes/${boxId}/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boxes", selectedBoxForProducts?.id, "items"] });
      toast({ title: "Product removed from box successfully" });
    },
    onError: () => {
      toast({ title: "Failed to remove product from box", variant: "destructive" });
    },
  });

  // Mutation for updating drop chance
  const updateDropChanceMutation = useMutation({
    mutationFn: ({ boxId, itemId, dropChance }: { boxId: number; itemId: number; dropChance: number }) => 
      apiRequest("PUT", `/api/admin/boxes/${boxId}/items/${itemId}`, { dropChance }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/boxes", selectedBoxForProducts?.id, "items"] });
      toast({ title: "Drop chance updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update drop chance", variant: "destructive" });
    },
  });

  const getCurrentData = () => {
    switch (activeTab) {
      case "boxes": return boxes || [];
      case "products": return items || [];
      default: return [];
    }
  };

  const filteredData = getCurrentData().filter((item: any) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (formData: FormData) => {
    if (activeTab === "boxes") {
      const boxData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: formData.get("price") as string,
        rarity: formData.get("rarity") as string,
        imageUrl: formData.get("imageUrl") as string,
        backgroundUrl: formData.get("backgroundUrl") as string,
      };

      if (selectedItem) {
        updateBoxMutation.mutate({ id: selectedItem.id, ...boxData });
      } else {
        createBoxMutation.mutate(boxData);
      }
    } else if (activeTab === "products") {
      const productData = {
        name: formData.get("name") as string,
        rarity: formData.get("rarity") as string,
        dropChance: parseInt(formData.get("dropChance") as string),
        imageUrl: formData.get("imageUrl") as string,
        caseId: parseInt(formData.get("caseId") as string),
      };

      if (selectedItem) {
        updateProductMutation.mutate({ id: selectedItem.id, ...productData });
      } else {
        createProductMutation.mutate(productData);
      }
    }
  };

  const renderBoxForm = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Box Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={selectedItem?.name || ""}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            defaultValue={selectedItem?.price || ""}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={selectedItem?.description || ""}
          className="bg-gray-700 border-gray-600"
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="rarity">Rarity</Label>
        <Select name="rarity" defaultValue={selectedItem?.rarity || "common"}>
          <SelectTrigger className="bg-gray-700 border-gray-600">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-700">
            <SelectItem value="common">Common</SelectItem>
            <SelectItem value="rare">Rare</SelectItem>
            <SelectItem value="epic">Epic</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="mythical">Mythical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="imageUrl">Box Image</Label>
          <div className="space-y-2">
            <ImageUpload
              currentImage={selectedItem?.imageUrl}
              onImageUpload={(imageUrl) => {
                const imageInput = document.getElementById('imageUrl') as HTMLInputElement;
                if (imageInput) imageInput.value = imageUrl;
              }}
            />
            <Input
              id="imageUrl"
              name="imageUrl"
              defaultValue={selectedItem?.imageUrl || ""}
              className="bg-gray-700 border-gray-600"
              placeholder="Or enter image URL directly"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="backgroundUrl">Background Image</Label>
          <div className="space-y-2">
            <ImageUpload
              currentImage={selectedItem?.backgroundUrl}
              onImageUpload={(imageUrl) => {
                const backgroundInput = document.getElementById('backgroundUrl') as HTMLInputElement;
                if (backgroundInput) backgroundInput.value = imageUrl;
              }}
            />
            <Input
              id="backgroundUrl"
              name="backgroundUrl"
              defaultValue={selectedItem?.backgroundUrl || ""}
              className="bg-gray-700 border-gray-600"
              placeholder="Or enter background URL directly"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
          {selectedItem ? "Update" : "Create"} Box
        </Button>
      </div>
    </form>
  );

  const renderProductForm = () => (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(new FormData(e.currentTarget));
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={selectedItem?.name || ""}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>
        <div>
          <Label htmlFor="caseId">Box</Label>
          <Select name="caseId" defaultValue={selectedItem?.caseId?.toString() || ""}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select a box" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700">
              {boxes.map((box: Box) => (
                <SelectItem key={box.id} value={box.id.toString()}>
                  {box.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="rarity">Rarity</Label>
          <Select name="rarity" defaultValue={selectedItem?.rarity || "common"}>
            <SelectTrigger className="bg-gray-700 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700">
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="epic">Epic</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
              <SelectItem value="mythical">Mythical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dropChance">Drop Chance (1-10000)</Label>
          <Input
            id="dropChance"
            name="dropChance"
            type="number"
            min="1"
            max="10000"
            defaultValue={selectedItem?.dropChance || "100"}
            className="bg-gray-700 border-gray-600"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="imageUrl">Product Image</Label>
        <div className="space-y-2">
          <ImageUpload
            currentImage={selectedItem?.imageUrl}
            onImageUpload={(imageUrl) => {
              const imageInput = document.getElementById('imageUrl') as HTMLInputElement;
              if (imageInput) imageInput.value = imageUrl;
            }}
          />
          <Input
            id="imageUrl"
            name="imageUrl"
            defaultValue={selectedItem?.imageUrl || ""}
            className="bg-gray-700 border-gray-600"
            placeholder="Or enter image URL directly"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
          {selectedItem ? "Update" : "Create"} Product
        </Button>
      </div>
    </form>
  );

  const renderTable = () => {
    if (activeTab === "boxes") {
      return (
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Price (USD)</TableHead>
                <TableHead className="text-gray-300">Rarity</TableHead>
                <TableHead className="text-gray-300">Image</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((box: Box) => (
                <TableRow key={box.id} className="border-gray-700">
                  <TableCell className="font-medium text-white">{box.name}</TableCell>
                  <TableCell className="text-gray-300">{formatCurrency(parseFloat(box.price))}</TableCell>
                  <TableCell>
                    <Badge className={getRarityClass(box.rarity)}>
                      {box.rarity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <img src={box.imageUrl} alt={box.name} className="w-10 h-10 object-cover rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(box);
                          setDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedBoxForProducts(box);
                          setBoxProductsDialogOpen(true);
                        }}
                        className="text-green-400 hover:text-green-300 hover:bg-gray-700"
                      >
                        <Package className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Box</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              Are you sure you want to delete "{box.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteBoxMutation.mutate(box.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    } else if (activeTab === "products") {
      return (
        <div className="rounded-md border border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Name</TableHead>
                <TableHead className="text-gray-300">Box</TableHead>
                <TableHead className="text-gray-300">Rarity</TableHead>
                <TableHead className="text-gray-300">Drop Chance</TableHead>
                <TableHead className="text-gray-300">Image</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item: Item) => (
                <TableRow key={item.id} className="border-gray-700">
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell className="text-gray-300">
                    {boxes.find((box: Box) => box.id === item.caseId)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge className={getRarityClass(item.rarity)}>
                      {item.rarity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{item.dropChance}</TableCell>
                  <TableCell>
                    <img src={item.imageUrl} alt={item.name} className="w-10 h-10 object-cover rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setDialogOpen(true);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-800 border-gray-700">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Delete Product</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              Are you sure you want to delete "{item.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProductMutation.mutate(item.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return null;
  };

  const getFormComponent = () => {
    switch (activeTab) {
      case "boxes": return renderBoxForm();
      case "products": return renderProductForm();
      default: return null;
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "boxes": return "Box";
      case "products": return "Products";
      default: return "Management";
    }
  };

  const canCreate = true; // Allow create for all sections

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{getTabTitle()} Management</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Boxes</CardTitle>
            <Package className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{boxes.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Products</CardTitle>
            <Tags className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{items.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Box Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="boxes" className="data-[state=active]:bg-orange-600">
                <Package className="w-4 h-4 mr-2" />
                Boxes
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-orange-600">
                <Tags className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-white">{getTabTitle()}</CardTitle>
                    </div>
                    {canCreate && (
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => setSelectedItem(null)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add {getTabTitle()}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-white">
                              {selectedItem ? "Edit" : "Create"} {getTabTitle()}
                            </DialogTitle>
                          </DialogHeader>
                          {getFormComponent()}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Input
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  {renderTable()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Box Products Management Dialog */}
      <Dialog open={boxProductsDialogOpen} onOpenChange={setBoxProductsDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              Manage Products for {selectedBoxForProducts?.name}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={boxProductsTab} onValueChange={setBoxProductsTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="assigned" className="data-[state=active]:bg-orange-600">
                Assigned Products
              </TabsTrigger>
              <TabsTrigger value="available" className="data-[state=active]:bg-orange-600">
                Available Products
              </TabsTrigger>
            </TabsList>

            <TabsContent value="assigned" className="space-y-4">
              <div className="rounded-md border border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Rarity</TableHead>
                      <TableHead className="text-gray-300">Drop Chance</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boxProducts.map((product: any) => (
                      <TableRow key={product.id} className="border-gray-700">
                        <TableCell className="font-medium text-white">{product.name}</TableCell>
                        <TableCell>
                          <Badge className={getRarityClass(product.rarity)}>
                            {product.rarity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            max="10000"
                            defaultValue={product.dropChance}
                            className="w-20 bg-gray-700 border-gray-600 text-white"
                            onBlur={(e) => {
                              const newDropChance = parseInt(e.target.value);
                              if (newDropChance !== product.dropChance) {
                                updateDropChanceMutation.mutate({
                                  boxId: selectedBoxForProducts!.id,
                                  itemId: product.id,
                                  dropChance: newDropChance
                                });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              removeProductFromBoxMutation.mutate({
                                boxId: selectedBoxForProducts!.id,
                                itemId: product.id
                              });
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="available" className="space-y-4">
              <div className="rounded-md border border-gray-700">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Rarity</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.filter((item: Item) => 
                      !boxProducts.some((bp: any) => bp.id === item.id)
                    ).map((item: Item) => (
                      <TableRow key={item.id} className="border-gray-700">
                        <TableCell className="font-medium text-white">{item.name}</TableCell>
                        <TableCell>
                          <Badge className={getRarityClass(item.rarity)}>
                            {item.rarity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              addProductToBoxMutation.mutate({
                                boxId: selectedBoxForProducts!.id,
                                itemId: item.id
                              });
                            }}
                            className="text-green-400 hover:text-green-300 hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}