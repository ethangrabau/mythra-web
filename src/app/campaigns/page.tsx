// app/campaigns/page.tsx

import { getCampaigns } from './actions';

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  return (
    <div>
      {campaigns.map((campaign: any) => (
        <div key={campaign._id}>{campaign.name}</div>
      ))}
    </div>
  );
}
