import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Layout,
  Megaphone,
  Target,
  Gift,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ImageUpload from "@/components/ImageUpload";

interface Slider {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  active: boolean;
  order: number;
}

interface Banner {
  id: number;
  title: string;
  content: string;
  image: string;
  type: 'promotional' | 'announcement' | 'warning';
  active: boolean;
  startDate: string;
  endDate: string;
}

interface LandingBannerItem {
  id: number;
  name: string;
  image: string;
  position: number;
  active: boolean;
}

interface LandingBannerConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  items: LandingBannerItem[];
}

interface Mission {
  id: number;
  title: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  isActive: boolean;
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  published: boolean;
  publishedAt: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  active: boolean;
}

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  logo: string;
  favicon: string;
  contactEmail: string;
  supportEmail: string;
  socialLinks: {
    twitter: string;
    discord: string;
    telegram: string;
  };
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

export default function ContentManagementModule() {
  const { toast } = useToast();
  const [location] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);

  // Determine active section based on current route
  const getActiveSectionFromRoute = () => {
    const path = location || window.location.pathname;
    if (path.includes('/admin/terms')) return 'legal-content';
    if (path.includes('/admin/privacy-statement')) return 'legal-content';
    if (path.includes('/admin/cookie-policy')) return 'legal-content';
    if (path.includes('/admin/aml-policy')) return 'legal-content';
    if (path.includes('/admin/sliders')) return 'sliders';
    if (path.includes('/admin/blogs')) return 'blogs';
    if (path.includes('/admin/faq')) return 'faqs';
    if (path.includes('/admin/contact-us')) return 'contact';
    if (path.includes('/admin/contact-page')) return 'contact-page';
    if (path.includes('/admin/footer-logo')) return 'footer-assets';
    if (path.includes('/admin/footer-icons')) return 'footer-assets';
    return 'landing-banner';
  };

  const [activeSection, setActiveSection] = useState(getActiveSectionFromRoute());

  // Data queries
  const { data: sliders = [], isLoading: slidersLoading } = useQuery({
    queryKey: ["/api/admin/sliders"],
  });

  const { data: banners = [], isLoading: bannersLoading } = useQuery({
    queryKey: ["/api/admin/banners"],
  });

  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ["/api/admin/missions"],
  });

  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ["/api/admin/blogs"],
  });

  const { data: faqs = [], isLoading: faqsLoading } = useQuery({
    queryKey: ["/api/admin/faqs"],
  });

  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/admin/settings"],
  });

  // Legal content query
  const { data: legalPages = [], isLoading: legalLoading, error: legalError } = useQuery({
    queryKey: ["/api/legal-pages"],
  });

  console.log("Legal pages data:", legalPages);
  console.log("Legal pages loading:", legalLoading);
  console.log("Legal pages error:", legalError);

  // Mutations
  const createSliderMutation = useMutation({
    mutationFn: async (data: Partial<Slider>) => {
      const response = await apiRequest("POST", "/api/admin/sliders", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      toast({ title: "Slider created successfully" });
      setDialogOpen(false);
    },
  });

  const updateSliderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Slider> }) => {
      const response = await apiRequest("PUT", `/api/admin/sliders/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      toast({ title: "Slider updated successfully" });
      setDialogOpen(false);
    },
  });

  const deleteSliderMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/sliders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sliders"] });
      toast({ title: "Slider deleted successfully" });
    },
  });

  const createMissionMutation = useMutation({
    mutationFn: async (data: Partial<Mission>) => {
      const response = await apiRequest("POST", "/api/admin/missions", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/missions"] });
      toast({ title: "Mission created successfully" });
      setDialogOpen(false);
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      const response = await apiRequest("PUT", "/api/admin/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Settings updated successfully" });
    },
  });

  const handleCreateSlider = (data: Partial<Slider>) => {
    createSliderMutation.mutate(data);
  };

  const handleUpdateSlider = (data: Partial<Slider>) => {
    if (selectedItem?.id) {
      updateSliderMutation.mutate({ id: selectedItem.id, data });
    }
  };

  const handleDeleteSlider = (id: number) => {
    deleteSliderMutation.mutate(id);
  };

  // Landing Banner Management
  const { data: landingBanner = null } = useQuery({
    queryKey: ["/api/admin/landing-banner"],
  });

  const updateLandingBannerMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PUT", "/api/admin/landing-banner", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-banner"] });
      toast({ title: "Landing banner updated successfully" });
    },
  });

  const renderLandingBannerSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Landing Page Banner Management</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner Content */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Banner Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Title</Label>
              <Input
                placeholder="OPEN CASES"
                defaultValue={landingBanner?.title || "OPEN CASES"}
                className="bg-slate-800 border-slate-600 text-white"
                onChange={(e) => {
                  updateLandingBannerMutation.mutate({
                    ...landingBanner,
                    title: e.target.value
                  });
                }}
              />
            </div>
            <div>
              <Label className="text-slate-300">Subtitle</Label>
              <Input
                placeholder="WIN LUXURY ITEMS"
                defaultValue={landingBanner?.subtitle || "WIN LUXURY ITEMS"}
                className="bg-slate-800 border-slate-600 text-white"
                onChange={(e) => {
                  updateLandingBannerMutation.mutate({
                    ...landingBanner,
                    subtitle: e.target.value
                  });
                }}
              />
            </div>
            <div>
              <Label className="text-slate-300">Description</Label>
              <Textarea
                placeholder="Open premium cases and win real luxury items..."
                defaultValue={landingBanner?.description || "Open premium cases and win real luxury items including Supreme streetwear, Louis Vuitton accessories, designer watches, and supercars"}
                className="bg-slate-800 border-slate-600 text-white"
                onChange={(e) => {
                  updateLandingBannerMutation.mutate({
                    ...landingBanner,
                    description: e.target.value
                  });
                }}
              />
            </div>
            <div>
              <Label className="text-slate-300">Button Text</Label>
              <Input
                placeholder="Start Opening Cases"
                defaultValue={landingBanner?.buttonText || "Start Opening Cases"}
                className="bg-slate-800 border-slate-600 text-white"
                onChange={(e) => {
                  updateLandingBannerMutation.mutate({
                    ...landingBanner,
                    buttonText: e.target.value
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product Grid Management */}
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Product Grid (3x3)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }, (_, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-square bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
                    {landingBanner?.items?.[index]?.image ? (
                      <img 
                        src={landingBanner.items[index].image} 
                        alt={landingBanner.items[index].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Input
                      placeholder="Item name"
                      defaultValue={landingBanner?.items?.[index]?.name || ""}
                      className="bg-slate-800 border-slate-600 text-white text-xs"
                      onChange={(e) => {
                        const items = [...(landingBanner?.items || Array(9).fill({}))];
                        items[index] = { ...items[index], name: e.target.value };
                        updateLandingBannerMutation.mutate({
                          ...landingBanner,
                          items
                        });
                      }}
                    />
                    <Input
                      placeholder="Image URL"
                      defaultValue={landingBanner?.items?.[index]?.image || ""}
                      className="bg-slate-800 border-slate-600 text-white text-xs"
                      onChange={(e) => {
                        const items = [...(landingBanner?.items || Array(9).fill({}))];
                        items[index] = { ...items[index], image: e.target.value };
                        updateLandingBannerMutation.mutate({
                          ...landingBanner,
                          items
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-indigo-900/30 rounded-3xl p-6 border border-blue-500/20">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-4xl font-black text-white mb-2">
                  {landingBanner?.title || "OPEN CASES"}
                </h3>
                <h4 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
                  {landingBanner?.subtitle || "WIN LUXURY ITEMS"}
                </h4>
                <p className="text-slate-300 mb-4">
                  {landingBanner?.description || "Open premium cases and win real luxury items"}
                </p>
                <Button className="bg-gradient-to-r from-orange-600 to-red-600">
                  {landingBanner?.buttonText || "Start Opening Cases"}
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }, (_, index) => (
                  <div key={index} className="aspect-square bg-gray-700/50 rounded-xl border border-gray-600/30 overflow-hidden">
                    {landingBanner?.items?.[index]?.image ? (
                      <img 
                        src={landingBanner.items[index].image} 
                        alt={landingBanner.items[index].name || `Item ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSlidersSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Homepage Sliders</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedItem(null); setEditMode(false); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Slider
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editMode ? 'Edit Slider' : 'Create New Slider'}
              </DialogTitle>
            </DialogHeader>
            <SliderForm 
              slider={selectedItem}
              onSubmit={editMode ? handleUpdateSlider : handleCreateSlider}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Image</TableHead>
                <TableHead className="text-slate-300">Title</TableHead>
                <TableHead className="text-slate-300">Subtitle</TableHead>
                <TableHead className="text-slate-300">Link</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Order</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sliders.map((slider: Slider) => (
                <TableRow key={slider.id} className="border-slate-800">
                  <TableCell>
                    <img 
                      src={slider.image} 
                      alt={slider.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="text-white">{slider.title}</TableCell>
                  <TableCell className="text-slate-300">{slider.subtitle}</TableCell>
                  <TableCell className="text-slate-300">{slider.link}</TableCell>
                  <TableCell>
                    <Badge variant={slider.active ? "default" : "secondary"}>
                      {slider.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">{slider.order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(slider);
                          setEditMode(true);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteSlider(slider.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderMissionsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">User Missions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedItem(null); setEditMode(false); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Mission
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editMode ? 'Edit Mission' : 'Create New Mission'}
              </DialogTitle>
            </DialogHeader>
            <MissionForm 
              mission={selectedItem}
              onSubmit={editMode ? (data) => {} : (data) => createMissionMutation.mutate(data)}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Title</TableHead>
                <TableHead className="text-slate-300">Type</TableHead>
                <TableHead className="text-slate-300">Target</TableHead>
                <TableHead className="text-slate-300">Reward</TableHead>
                <TableHead className="text-slate-300">Status</TableHead>
                <TableHead className="text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {missions.map((mission: Mission) => (
                <TableRow key={mission.id} className="border-slate-800">
                  <TableCell className="text-white">{mission.title}</TableCell>
                  <TableCell className="text-slate-300">{mission.type}</TableCell>
                  <TableCell className="text-slate-300">${mission.target}</TableCell>
                  <TableCell className="text-slate-300">${mission.reward}</TableCell>
                  <TableCell>
                    <Badge variant={mission.isActive ? "default" : "secondary"}>
                      {mission.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedItem(mission);
                          setEditMode(true);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {}}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Site Settings</h2>
      
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Site Name</Label>
              <Input 
                defaultValue={siteSettings?.siteName || "RollingDrop"}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300">Contact Email</Label>
              <Input 
                defaultValue={siteSettings?.contactEmail || ""}
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-slate-300">Site Description</Label>
            <Textarea 
              defaultValue={siteSettings?.siteDescription || ""}
              className="bg-slate-800 border-slate-600 text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={siteSettings?.maintenanceMode || false}
            />
            <Label className="text-slate-300">Maintenance Mode</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              checked={siteSettings?.registrationEnabled !== false}
            />
            <Label className="text-slate-300">Registration Enabled</Label>
          </div>

          <Button 
            onClick={() => updateSettingsMutation.mutate({})}
            className="mt-4"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderLegalContentSection = () => {
    if (legalLoading) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Legal Content Management</h2>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400">Loading legal pages...</p>
          </div>
        </div>
      );
    }

    if (legalError) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Legal Content Management</h2>
          <div className="text-center py-8">
            <p className="text-red-400">Error loading legal pages: {legalError?.message || 'Unknown error'}</p>
          </div>
        </div>
      );
    }

    if (!legalPages || legalPages.length === 0) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Legal Content Management</h2>
          <div className="text-center py-8">
            <p className="text-slate-400">No legal pages found. They may need to be created first.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Legal Content Management</h2>
        
        <div className="grid gap-4">
          {legalPages.map((page: any) => (
            <Card key={page.id} className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{page.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Title</Label>
                  <Input 
                    defaultValue={page.title}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-slate-300">Meta Description</Label>
                  <Input 
                    defaultValue={page.metaDescription || ""}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-slate-300">Content</Label>
                  <Textarea 
                    defaultValue={page.content}
                    className="bg-slate-800 border-slate-600 text-white min-h-[200px]"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    Last updated: {new Date(page.updatedAt).toLocaleDateString()}
                  </span>
                  <Button 
                    onClick={() => {
                      toast({ title: "Legal content updated successfully" });
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };



  return (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="landing-banner" className="data-[state=active]:bg-slate-700">
            <Gift className="w-4 h-4 mr-2" />
            Landing Banner
          </TabsTrigger>
          <TabsTrigger value="sliders" className="data-[state=active]:bg-slate-700">
            <Layout className="w-4 h-4 mr-2" />
            Sliders
          </TabsTrigger>
          <TabsTrigger value="banners" className="data-[state=active]:bg-slate-700">
            <Megaphone className="w-4 h-4 mr-2" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="missions" className="data-[state=active]:bg-slate-700">
            <Target className="w-4 h-4 mr-2" />
            Missions
          </TabsTrigger>
          <TabsTrigger value="blogs" className="data-[state=active]:bg-slate-700">
            <FileText className="w-4 h-4 mr-2" />
            Blogs
          </TabsTrigger>
          <TabsTrigger value="faq" className="data-[state=active]:bg-slate-700">
            <FileText className="w-4 h-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="legal-content" className="data-[state=active]:bg-slate-700">
            <FileText className="w-4 h-4 mr-2" />
            Legal Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing-banner">
          {renderLandingBannerSection()}
        </TabsContent>

        <TabsContent value="sliders">
          {renderSlidersSection()}
        </TabsContent>

        <TabsContent value="missions">
          {renderMissionsSection()}
        </TabsContent>

        <TabsContent value="legal-content">
          {renderLegalContentSection()}
        </TabsContent>

        <TabsContent value="settings">
          {renderSettingsSection()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Form Components
function SliderForm({ slider, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: slider?.title || '',
    subtitle: slider?.subtitle || '',
    image: slider?.image || '',
    link: slider?.link || '',
    active: slider?.active ?? true,
    order: slider?.order || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-slate-300">Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-slate-800 border-slate-600 text-white"
          placeholder="Slider title"
        />
      </div>

      <div>
        <Label className="text-slate-300">Subtitle</Label>
        <Input
          value={formData.subtitle}
          onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
          className="bg-slate-800 border-slate-600 text-white"
          placeholder="Slider subtitle"
        />
      </div>

      <div>
        <Label className="text-slate-300">Image</Label>
        <ImageUpload
          onImageChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
          currentImage={formData.image}
        />
      </div>

      <div>
        <Label className="text-slate-300">Link URL</Label>
        <Input
          value={formData.link}
          onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
          className="bg-slate-800 border-slate-600 text-white"
          placeholder="https://..."
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
        />
        <Label className="text-slate-300">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function MissionForm({ mission, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    title: mission?.title || '',
    description: mission?.description || '',
    type: mission?.type || 'deposit',
    target: mission?.target || 0,
    reward: mission?.reward || 0,
    isActive: mission?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-slate-300">Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="bg-slate-800 border-slate-600 text-white"
          placeholder="Mission title"
        />
      </div>

      <div>
        <Label className="text-slate-300">Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="bg-slate-800 border-slate-600 text-white"
          placeholder="Mission description"
        />
      </div>

      <div>
        <Label className="text-slate-300">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
          <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="spend">Spend</SelectItem>
            <SelectItem value="open_cases">Open Cases</SelectItem>
            <SelectItem value="win_battles">Win Battles</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-slate-300">Target Amount</Label>
          <Input
            type="number"
            value={formData.target}
            onChange={(e) => setFormData(prev => ({ ...prev, target: Number(e.target.value) }))}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
        <div>
          <Label className="text-slate-300">Reward Amount</Label>
          <Input
            type="number"
            value={formData.reward}
            onChange={(e) => setFormData(prev => ({ ...prev, reward: Number(e.target.value) }))}
            className="bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label className="text-slate-300">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}