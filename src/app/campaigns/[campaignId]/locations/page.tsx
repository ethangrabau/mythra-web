// /campaigns/:campaignId/locations/page.tsx

import { getCampaignLocations } from './actions';
import { notFound } from 'next/navigation';
import { LocationList } from './components/LocationList';

type LocationsPageProps = {
  params: Promise<{ campaignId: string }> | { campaignId: string };
};

export default async function LocationsPage({ params: paramsPromise }: LocationsPageProps) {
  const params = await paramsPromise;
  const locations = await getCampaignLocations(params.campaignId);

  if (!locations) return notFound();

  return (
    <div className='p-6 space-y-6'>
      <div>
        <h2 className='text-2xl font-bold text-gray-900'>Locations</h2>
      </div>

      <LocationList locations={locations} />
    </div>
  );
}
