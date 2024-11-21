//app/campaigns/[campaignId]/page.tsx
export default function CampaignDetailsPage({ params: { campaignId } }: { params: { campaignId: string } }) {
  return (
    <div>
      <h1>Campaign {campaignId}</h1>
      {/* Campaign details UI */}
    </div>
  );
}
