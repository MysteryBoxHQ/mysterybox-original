import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Eye, Check, Copy, ExternalLink, Lock, Unlock, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface FairnessProof {
  id: number;
  userId: number;
  boxId: number;
  serverSeed: string;
  clientSeed: string;
  nonce: number;
  combinedHash: string;
  resultHash: string;
  itemId: number;
  revealed: boolean;
  createdAt: string;
  boxName?: string;
  itemName?: string;
}

export default function Fairness() {
  const { toast } = useToast();
  const [selectedProof, setSelectedProof] = useState<FairnessProof | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [verificationInput, setVerificationInput] = useState({
    serverSeed: '',
    clientSeed: '',
    nonce: '',
    combinedHash: '',
    resultHash: ''
  });

  const { data: userProofs, isLoading } = useQuery<FairnessProof[]>({
    queryKey: ["/api/fairness/my-proofs"],
  });

  const fairnessTabs = [
    { id: 'info', label: 'How it Works', icon: Shield },
    { id: 'cases', label: 'Case Opening', icon: Package },
    { id: 'battles', label: 'Case Battles', icon: ExternalLink },
    { id: 'verification', label: 'Verify Proof', icon: Check },
    { id: 'history', label: 'My Proofs', icon: Eye }
  ];

  const revealProof = async (proofId: number) => {
    try {
      const response = await apiRequest("POST", `/api/fairness/reveal/${proofId}`);
      const revealedProof = await response.json();
      setSelectedProof(revealedProof);
      toast({
        title: "Proof Revealed",
        description: "You can now verify the fairness of this box opening.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reveal proof. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Hash copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const verifyManualProof = async () => {
    try {
      const response = await apiRequest("POST", "/api/fairness/verify-manual", verificationInput);
      const result = await response.json();
      
      if (result.valid) {
        toast({
          title: "Verification Successful",
          description: "The proof is valid and fair!",
        });
      } else {
        toast({
          title: "Verification Failed",
          description: "The proof could not be verified.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify proof. Please check your inputs.",
        variant: "destructive",
      });
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  How Provably Fair Works
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Understanding our cryptographic fairness system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Server Seed</h3>
                    <p className="text-gray-400 text-sm">
                      Generated before you play and kept secret until after the game
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Unlock className="w-6 h-6 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Client Seed</h3>
                    <p className="text-gray-400 text-sm">
                      You can provide your own seed or use our randomly generated one
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Verification</h3>
                    <p className="text-gray-400 text-sm">
                      After the game, verify the result using both seeds and the nonce
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">The Process:</h4>
                  <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                    <li>We generate a server seed and create its hash (visible to you)</li>
                    <li>You provide or we generate a client seed</li>
                    <li>We combine both seeds with a nonce to determine the outcome</li>
                    <li>After the game, we reveal the server seed for verification</li>
                    <li>You can verify the outcome was fair using our verification tool</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'cases':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Case Opening Fairness
                </CardTitle>
                <CardDescription className="text-gray-400">
                  How we ensure fair case opening results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Case Opening Algorithm:</h4>
                  <div className="text-gray-300 text-sm space-y-2">
                    <p><strong>1. Item Selection:</strong> Each case contains items with specific drop rates</p>
                    <p><strong>2. Random Generation:</strong> Combined seed creates a random number</p>
                    <p><strong>3. Weight Calculation:</strong> Number maps to item based on drop rates</p>
                    <p><strong>4. Result Verification:</strong> You can verify the math independently</p>
                  </div>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">Example Verification:</h4>
                  <div className="font-mono text-xs text-gray-300 space-y-1">
                    <p>Server Seed: a1b2c3d4e5f6...</p>
                    <p>Client Seed: user_provided_seed</p>
                    <p>Nonce: 1</p>
                    <p>Combined Hash: SHA256(server:client:nonce)</p>
                    <p>Result: Hash % total_weight = item_index</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'battles':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Case Battle Fairness
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Fair competition in multiplayer case battles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Battle Fairness Rules:</h4>
                  <div className="text-gray-300 text-sm space-y-2">
                    <p><strong>1. Synchronized Seeds:</strong> All players use the same server seed</p>
                    <p><strong>2. Unique Nonces:</strong> Each player gets a unique nonce value</p>
                    <p><strong>3. Equal Opportunity:</strong> Same drop rates apply to all participants</p>
                    <p><strong>4. Transparent Results:</strong> All opening results are verifiable</p>
                  </div>
                </div>
                
                <div className="bg-orange-900/20 border border-orange-500/30 p-4 rounded-lg">
                  <h4 className="text-orange-300 font-medium mb-2">Battle Algorithm:</h4>
                  <div className="font-mono text-xs text-gray-300 space-y-1">
                    <p>Battle Seed: battle_server_seed</p>
                    <p>Player 1: SHA256(battle_seed:player1_seed:1)</p>
                    <p>Player 2: SHA256(battle_seed:player2_seed:2)</p>
                    <p>Each result independently calculated and verifiable</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'verification':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  Manual Verification Tool
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Verify any game result independently
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="serverSeed" className="text-white">Server Seed</Label>
                    <Input
                      id="serverSeed"
                      value={verificationInput.serverSeed}
                      onChange={(e) => setVerificationInput(prev => ({ ...prev, serverSeed: e.target.value }))}
                      placeholder="Enter server seed (revealed after game)"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="clientSeed" className="text-white">Client Seed</Label>
                    <Input
                      id="clientSeed"
                      value={verificationInput.clientSeed}
                      onChange={(e) => setVerificationInput(prev => ({ ...prev, clientSeed: e.target.value }))}
                      placeholder="Enter client seed"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="nonce" className="text-white">Nonce</Label>
                    <Input
                      id="nonce"
                      value={verificationInput.nonce}
                      onChange={(e) => setVerificationInput(prev => ({ ...prev, nonce: e.target.value }))}
                      placeholder="Enter nonce (game number)"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  
                  <Button onClick={verifyManualProof} className="w-full bg-green-600 hover:bg-green-700">
                    Verify Result
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 'history':
        return (
          <div className="space-y-6">
            <Card className="cases-card border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  My Fairness Proofs
                </CardTitle>
                <CardDescription className="text-gray-400">
                  View and verify your game history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your proofs...</p>
                  </div>
                ) : userProofs && userProofs.length > 0 ? (
                  <div className="space-y-4">
                    {userProofs.map((proof) => (
                      <div key={proof.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-medium">{proof.boxName || `Box #${proof.boxId}`}</h4>
                            <p className="text-gray-400 text-sm">
                              Item: {proof.itemName || `Item #${proof.itemId}`}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(proof.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={proof.revealed ? "default" : "secondary"}>
                            {proof.revealed ? "Revealed" : "Hidden"}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Client Seed:</span>
                            <span className="text-white font-mono">{proof.clientSeed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Nonce:</span>
                            <span className="text-white font-mono">{proof.nonce}</span>
                          </div>
                          {proof.revealed && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Server Seed:</span>
                              <span className="text-white font-mono text-xs">{proof.serverSeed}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {!proof.revealed && (
                            <Button 
                              size="sm" 
                              onClick={() => revealProof(proof.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Reveal Proof
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedProof(proof)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No fairness proofs found</p>
                    <p className="text-gray-500 text-sm">Open some cases to see your proofs here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen cases-bg py-4 md:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Provably Fair</h1>
              <p className="text-gray-400 text-sm md:text-base">Verify the fairness of all game results</p>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="bg-gray-800/50 rounded-lg p-1 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-1">
              {fairnessTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-20 md:mb-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}