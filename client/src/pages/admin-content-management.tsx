import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { FileImage, Save, Eye, Upload, Trash2, Edit3, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface WhitelabelPage {
  id: number;
  whitelabelId: string;
  pageType: string;
  pageName: string;
  title: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  content: any;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface ContentSection {
  id: number;
  pageId: number;
  sectionType: string;
  sectionName: string;
  content: any;
  displayOrder: number;
  isVisible: boolean;
  styling: any;
}

interface MediaFile {
  id: number;
  whitelabelId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  filePath: string;
  altText?: string;
  caption?: string;
}

export default function AdminContentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWhitelabel, setSelectedWhitelabel] = useState<string>("rollingdrop-demo");
  const [selectedPage, setSelectedPage] = useState<WhitelabelPage | null>(null);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [activeTab, setActiveTab] = useState("pages");

  // Fetch whitelabels
  const { data: whitelabels } = useQuery({
    queryKey: ["/api/admin/whitelabels"],
  });

  // Auto-select first page when pages load
  useEffect(() => {
    if (pages && pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0]);
    }
  }, [pages, selectedPage]);

  // Fetch pages for selected whitelabel
  const { data: pages, isLoading: pagesLoading } = useQuery({
    queryKey: ["/api/admin/content/pages", selectedWhitelabel],
    queryFn: () => apiRequest("GET", `/api/admin/content/pages?whitelabelId=${selectedWhitelabel}`),
    enabled: !!selectedWhitelabel,
  });

  // Fetch sections for selected page
  const { data: sections } = useQuery({
    queryKey: ["/api/admin/content/sections", selectedPage?.id],
    enabled: !!selectedPage?.id,
  });

  // Fetch media library
  const { data: mediaFiles } = useQuery({
    queryKey: ["/api/admin/content/media", selectedWhitelabel],
    enabled: !!selectedWhitelabel,
  });

  // Update page mutation
  const updatePageMutation = useMutation({
    mutationFn: async (data: Partial<WhitelabelPage>) => {
      return apiRequest("PATCH", `/api/admin/content/pages/${selectedPage?.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Page updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/pages"] });
    },
    onError: (error) => {
      toast({ title: "Failed to update page", description: error.message, variant: "destructive" });
    },
  });

  // Update section mutation
  const updateSectionMutation = useMutation({
    mutationFn: async (data: Partial<ContentSection>) => {
      return apiRequest("PATCH", `/api/admin/content/sections/${editingSection?.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Section updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/sections"] });
      setEditingSection(null);
    },
    onError: (error) => {
      toast({ title: "Failed to update section", description: error.message, variant: "destructive" });
    },
  });

  // Create new page mutation
  const createPageMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/admin/content/pages", data);
    },
    onSuccess: () => {
      toast({ title: "Page created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/pages"] });
    },
    onError: (error) => {
      toast({ title: "Failed to create page", description: error.message, variant: "destructive" });
    },
  });

  // Upload media mutation
  const uploadMediaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("POST", "/api/admin/content/media/upload", formData);
    },
    onSuccess: () => {
      toast({ title: "Media uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/media"] });
    },
    onError: (error) => {
      toast({ title: "Failed to upload media", description: error.message, variant: "destructive" });
    },
  });

  // Import content mutation
  const importContentMutation = useMutation({
    mutationFn: async (whitelabelId: string) => {
      return apiRequest("POST", `/api/admin/content/import/${whitelabelId}`, {});
    },
    onSuccess: () => {
      toast({ title: "Content imported successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/pages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/content/sections"] });
    },
    onError: (error) => {
      toast({ title: "Failed to import content", description: error.message, variant: "destructive" });
    },
  });

  const handleSavePage = () => {
    if (!selectedPage) return;
    updatePageMutation.mutate({
      title: selectedPage.title,
      metaDescription: selectedPage.metaDescription,
      metaKeywords: selectedPage.metaKeywords,
      ogTitle: selectedPage.ogTitle,
      ogDescription: selectedPage.ogDescription,
      ogImage: selectedPage.ogImage,
      content: selectedPage.content,
      isActive: selectedPage.isActive,
    });
  };

  const handleSaveSection = () => {
    if (!editingSection) return;
    updateSectionMutation.mutate({
      content: editingSection.content,
      isVisible: editingSection.isVisible,
      styling: editingSection.styling,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedWhitelabel) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('whitelabelId', selectedWhitelabel);
    uploadMediaMutation.mutate(formData);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedWhitelabel} onValueChange={setSelectedWhitelabel}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Whitelabel" />
            </SelectTrigger>
            <SelectContent>
              {whitelabels?.map((wl: any) => (
                <SelectItem key={wl.whitelabelId} value={wl.whitelabelId}>
                  {wl.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedWhitelabel ? (
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">Select a Whitelabel</h3>
            <p className="text-gray-600">Choose a whitelabel instance to manage its content.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pages">Pages</TabsTrigger>
            <TabsTrigger value="media">Media Library</TabsTrigger>
            <TabsTrigger value="seo">SEO Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pages List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Pages
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => importContentMutation.mutate(selectedWhitelabel)}
                        disabled={importContentMutation.isPending}
                      >
                        Import Content
                      </Button>
                      <Button size="sm" onClick={() => {}}>
                        <Plus className="w-4 h-4 mr-1" />
                        New Page
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pagesLoading ? (
                    <div className="text-center py-4">Loading pages...</div>
                  ) : (
                    pages?.map((page: WhitelabelPage) => (
                      <div
                        key={page.id}
                        className={`p-3 rounded border cursor-pointer hover:bg-gray-50 ${
                          selectedPage?.id === page.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => setSelectedPage(page)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{page.pageName}</h4>
                            <p className="text-sm text-gray-500">{page.pageType}</p>
                          </div>
                          <Badge variant={page.isActive ? "default" : "secondary"}>
                            {page.isActive ? "Active" : "Draft"}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Page Editor */}
              {selectedPage && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Edit Page: {selectedPage.pageName}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" onClick={handleSavePage} disabled={updatePageMutation.isPending}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Basic Settings */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="page-title">Page Title</Label>
                        <Input
                          id="page-title"
                          value={selectedPage.title}
                          onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                          placeholder="Enter page title"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="page-active">Page Active</Label>
                        <Switch
                          id="page-active"
                          checked={selectedPage.isActive}
                          onCheckedChange={(checked) => setSelectedPage({ ...selectedPage, isActive: checked })}
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* SEO Settings */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">SEO Settings</h4>
                      <div>
                        <Label htmlFor="meta-description">Meta Description</Label>
                        <Textarea
                          id="meta-description"
                          value={selectedPage.metaDescription || ""}
                          onChange={(e) => setSelectedPage({ ...selectedPage, metaDescription: e.target.value })}
                          placeholder="Enter meta description (150-160 characters)"
                          maxLength={160}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(selectedPage.metaDescription || "").length}/160 characters
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="meta-keywords">Meta Keywords</Label>
                        <Input
                          id="meta-keywords"
                          value={selectedPage.metaKeywords || ""}
                          onChange={(e) => setSelectedPage({ ...selectedPage, metaKeywords: e.target.value })}
                          placeholder="Enter comma-separated keywords"
                        />
                      </div>
                      <div>
                        <Label htmlFor="og-title">Open Graph Title</Label>
                        <Input
                          id="og-title"
                          value={selectedPage.ogTitle || ""}
                          onChange={(e) => setSelectedPage({ ...selectedPage, ogTitle: e.target.value })}
                          placeholder="Enter Open Graph title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="og-description">Open Graph Description</Label>
                        <Textarea
                          id="og-description"
                          value={selectedPage.ogDescription || ""}
                          onChange={(e) => setSelectedPage({ ...selectedPage, ogDescription: e.target.value })}
                          placeholder="Enter Open Graph description"
                        />
                      </div>
                      <div>
                        <Label htmlFor="og-image">Open Graph Image URL</Label>
                        <Input
                          id="og-image"
                          value={selectedPage.ogImage || ""}
                          onChange={(e) => setSelectedPage({ ...selectedPage, ogImage: e.target.value })}
                          placeholder="Enter image URL for social media sharing"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Content Sections */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Content Sections</h4>
                      {sections?.map((section: ContentSection) => (
                        <Card key={section.id} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{section.sectionName}</h5>
                                <p className="text-sm text-gray-500">{section.sectionType}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={section.isVisible}
                                  onCheckedChange={(checked) => {
                                    // Update section visibility
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingSection(section)}
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {Object.entries(section.content || {}).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="truncate max-w-xs">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Media Library
                  <div className="flex gap-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                    />
                    <Button
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={uploadMediaMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {mediaFiles?.map((file: MediaFile) => (
                    <Card key={file.id} className="relative group">
                      <CardContent className="p-2">
                        {file.fileType === 'image' ? (
                          <img
                            src={file.filePath}
                            alt={file.altText || file.originalName}
                            className="w-full h-24 object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-24 bg-gray-100 rounded flex items-center justify-center">
                            <FileImage className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <p className="text-xs mt-2 truncate" title={file.originalName}>
                          {file.originalName}
                        </p>
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="destructive" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Meta Description Template</Label>
                  <Textarea
                    placeholder="Default template for meta descriptions"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Default Open Graph Image</Label>
                  <Input
                    placeholder="Default image URL for social media sharing"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Site Verification Codes</Label>
                  <div className="space-y-2 mt-1">
                    <Input placeholder="Google Search Console verification code" />
                    <Input placeholder="Bing Webmaster Tools verification code" />
                    <Input placeholder="Facebook Domain Verification code" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Section Editor Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Edit Section: {editingSection.sectionName}
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Section Content (JSON)</Label>
                <Textarea
                  value={JSON.stringify(editingSection.content, null, 2)}
                  onChange={(e) => {
                    try {
                      const content = JSON.parse(e.target.value);
                      setEditingSection({ ...editingSection, content });
                    } catch (error) {
                      // Invalid JSON, don't update
                    }
                  }}
                  className="font-mono text-sm h-64"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Section Visible</Label>
                <Switch
                  checked={editingSection.isVisible}
                  onCheckedChange={(checked) => setEditingSection({ ...editingSection, isVisible: checked })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSection(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSection} disabled={updateSectionMutation.isPending}>
                  Save Section
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}