'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Play, Plus, Clock, Users, Map } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface Campaign {
  id: string;
  name: string;
  description: string;
  created: number;
  lastPlayed: number;
  sessions: any[];
}

interface CampaignSelectorProps {
  onSelectCampaign: (campaignId: string, campaignName: string) => void;
  onClose: () => void;
}

export default function CampaignSelector({ onSelectCampaign, onClose }: CampaignSelectorProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns');
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async () => {
    if (!newCampaignName.trim()) return;
    
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newCampaignName, 
          description: newCampaignDescription 
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await loadCampaigns();
        setNewCampaignName('');
        setNewCampaignDescription('');
        setShowNewForm(false);
        // Auto-select the new campaign
        onSelectCampaign(data.id, newCampaignName);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadCampaigns();
      }
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">Select Campaign</CardTitle>
          <Button variant="ghost" onClick={onClose}>✕</Button>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          {/* New Campaign Form */}
          {showNewForm ? (
            <div className="mb-4 p-4 border rounded-lg space-y-3">
              <Input
                placeholder="Campaign Name (e.g., Dragon of Icespire Peak)"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createCampaign()}
                autoFocus
              />
              <Input
                placeholder="Description (optional)"
                value={newCampaignDescription}
                onChange={(e) => setNewCampaignDescription(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createCampaign()}
              />
              <div className="flex gap-2">
                <Button onClick={createCampaign} disabled={!newCampaignName.trim()}>
                  Create Campaign
                </Button>
                <Button variant="outline" onClick={() => {
                  setShowNewForm(false);
                  setNewCampaignName('');
                  setNewCampaignDescription('');
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              onClick={() => setShowNewForm(true)} 
              className="mb-4 w-full"
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          )}

          {/* Campaign List */}
          {loading ? (
            <div className="text-center py-8">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Map className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No campaigns yet</p>
              <p className="text-sm mt-2">Create your first campaign to get started!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {campaigns.map((campaign) => (
                  <Card 
                    key={campaign.id} 
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1" onClick={() => onSelectCampaign(campaign.id, campaign.name)}>
                          <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          {campaign.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {campaign.description}
                            </p>
                          )}
                          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {campaign.lastPlayed 
                                ? `Last played ${formatDistanceToNow(campaign.lastPlayed, { addSuffix: true })}`
                                : 'Never played'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {campaign.sessions?.length || 0} sessions
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCampaign(campaign.id, campaign.name);
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCampaign(campaign.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}