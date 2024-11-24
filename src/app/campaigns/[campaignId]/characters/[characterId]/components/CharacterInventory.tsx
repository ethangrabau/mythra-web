import { Badge } from '@/components/ui/badge';

type InventoryItem = {
  item: string;
  quantity: number;
  equipped: boolean;
  attuned: boolean;
};

type CharacterInventoryProps = {
  inventory: InventoryItem[];
};

export function CharacterInventory({ inventory }: CharacterInventoryProps) {
  return (
    <div className='space-y-4'>
      {inventory.map((item, index) => (
        <div key={index} className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'>
          <div className='flex items-center gap-3'>
            <span className='font-medium text-gray-900'>{item.item}</span>
            {item.quantity > 1 && <span className='text-sm text-gray-500'>×{item.quantity}</span>}
          </div>
          <div className='flex gap-2'>
            {item.equipped && <Badge variant='secondary'>Equipped</Badge>}
            {item.attuned && <Badge variant='outline'>Attuned</Badge>}
          </div>
        </div>
      ))}
      {inventory.length === 0 && <p className='text-gray-500 text-sm'>No items in inventory.</p>}
    </div>
  );
}
