import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Gift, 
  Users, 
  Calendar, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Award,
  Target,
  Clock,
  Coins
} from "lucide-react";

interface DailyReward {
  id: number;
  day: number;
  coins: number;
  gems: number;
  bonus?: string;
  active: boolean;
}

interface PromoCode {
  id: number;
  code: string;
  type: 'coins' | 'gems' | 'items' | 'discount';
  value: number;
  maxUses: number;
  currentUses: number;
  expiresAt: string;
  active: boolean;
  description: string;
}

interface SpecialEvent {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  rewards: any;
  active: boolean;
  eventType: 'double_rewards' | 'bonus_coins' | 'special_boxes' | 'limited_items';
}

export default function PromotionsModule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("daily-rewards");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Daily Rewards Management
  const { data: dailyRewards = [] } = useQuery({
    queryKey: ['/api/admin/daily-rewards'],
  });

  const updateDailyRewardMutation = useMutation({
    mutationFn: async (reward: Partial<DailyReward>) => {
      await apiRequest("PUT", `/api/admin/daily-rewards/${reward.id}`, reward);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/daily-rewards'] });
      toast({ title: "Daily reward updated successfully" });
    },
  });

  // Promo Codes Management
  const { data: promoCodes = [] } = useQuery({
    queryKey: ['/api/admin/promo-codes'],
  });

  const createPromoCodeMutation = useMutation({
    mutationFn: async (promoCode: Omit<PromoCode, 'id' | 'currentUses'>) => {
      await apiRequest("POST", "/api/admin/promo-codes", promoCode);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      toast({ title: "Promo code created successfully" });
      setShowCreateModal(false);
    },
  });

  const deletePromoCodeMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/promo-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/promo-codes'] });
      toast({ title: "Promo code deleted successfully" });
    },
  });

  // Special Events Management
  const { data: specialEvents = [] } = useQuery({
    queryKey: ['/api/admin/special-events'],
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: Omit<SpecialEvent, 'id'>) => {
      await apiRequest("POST", "/api/admin/special-events", event);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/special-events'] });
      toast({ title: "Special event created successfully" });
      setShowCreateModal(false);
    },
  });

  // Referral System Settings
  const { data: referralSettings } = useQuery({
    queryKey: ['/api/admin/referral-settings'],
  });

  const updateReferralSettingsMutation = useMutation({
    mutationFn: async (settings: any) => {
      await apiRequest("PUT", "/api/admin/referral-settings", settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/referral-settings'] });
      toast({ title: "Referral settings updated successfully" });
    },
  });

  const renderDailyRewards = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Daily Login Rewards</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Day
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dailyRewards.map((reward: DailyReward) => (
          <Card key={reward.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-sm">Day {reward.day}</CardTitle>
                <Switch 
                  checked={reward.active}
                  onCheckedChange={(active) => 
                    updateDailyRewardMutation.mutate({ ...reward, active })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 flex items-center">
                    <Coins className="w-4 h-4 mr-1" />
                    Coins
                  </span>
                  <Input
                    type="number"
                    value={reward.coins}
                    onChange={(e) => 
                      updateDailyRewardMutation.mutate({ 
                        ...reward, 
                        coins: parseInt(e.target.value) 
                      })
                    }
                    className="w-20 h-8 bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    Gems
                  </span>
                  <Input
                    type="number"
                    value={reward.gems}
                    onChange={(e) => 
                      updateDailyRewardMutation.mutate({ 
                        ...reward, 
                        gems: parseInt(e.target.value) 
                      })
                    }
                    className="w-20 h-8 bg-gray-700 border-gray-600"
                  />
                </div>
                {reward.bonus && (
                  <Badge variant="secondary" className="text-xs">
                    Bonus: {reward.bonus}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderPromoCodes = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Promotional Codes</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Promo Code
        </Button>
      </div>

      <div className="grid gap-4">
        {promoCodes.map((promo: PromoCode) => (
          <Card key={promo.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white font-mono">{promo.code}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {promo.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={promo.active ? "default" : "secondary"}>
                    {promo.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={() => setEditingItem(promo)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deletePromoCodeMutation.mutate(promo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Type:</span>
                  <p className="text-white capitalize">{promo.type}</p>
                </div>
                <div>
                  <span className="text-gray-400">Value:</span>
                  <p className="text-white">{promo.value}</p>
                </div>
                <div>
                  <span className="text-gray-400">Uses:</span>
                  <p className="text-white">{promo.currentUses}/{promo.maxUses}</p>
                </div>
                <div>
                  <span className="text-gray-400">Expires:</span>
                  <p className="text-white">{new Date(promo.expiresAt).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSpecialEvents = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Special Events</h3>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </Button>
      </div>

      <div className="grid gap-4">
        {specialEvents.map((event: SpecialEvent) => (
          <Card key={event.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{event.name}</CardTitle>
                  <CardDescription className="text-gray-400">
                    {event.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant={event.active ? "default" : "secondary"}>
                    {event.active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {event.eventType.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Start Date:
                  </span>
                  <p className="text-white">{new Date(event.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    End Date:
                  </span>
                  <p className="text-white">{new Date(event.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderReferralSettings = () => (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Referral System Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Configure referral rewards and requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">Referrer Reward (Coins)</Label>
            <Input
              type="number"
              defaultValue={referralSettings?.referrerCoins || 100}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Referee Reward (Coins)</Label>
            <Input
              type="number"
              defaultValue={referralSettings?.refereeCoins || 50}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Minimum Level Required</Label>
            <Input
              type="number"
              defaultValue={referralSettings?.minLevel || 1}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label className="text-white">Max Referrals per User</Label>
            <Input
              type="number"
              defaultValue={referralSettings?.maxReferrals || 10}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>
        <Button className="w-full">
          Update Referral Settings
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Gift className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Promotions & Rewards</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
          <TabsTrigger value="daily-rewards" className="data-[state=active]:bg-blue-600">
            Daily Rewards
          </TabsTrigger>
          <TabsTrigger value="promo-codes" className="data-[state=active]:bg-blue-600">
            Promo Codes
          </TabsTrigger>
          <TabsTrigger value="special-events" className="data-[state=active]:bg-blue-600">
            Special Events
          </TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:bg-blue-600">
            Referrals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-rewards" className="space-y-4">
          {renderDailyRewards()}
        </TabsContent>

        <TabsContent value="promo-codes" className="space-y-4">
          {renderPromoCodes()}
        </TabsContent>

        <TabsContent value="special-events" className="space-y-4">
          {renderSpecialEvents()}
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          {renderReferralSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
}