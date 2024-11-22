'use server';

import { isValidObjectId } from 'mongoose';
import { Character } from '@/lib/models';
import { Types } from 'mongoose';
import { ICharacter } from '@/lib/models/Character';

type CharacterWithId = Omit<ICharacter, keyof Document> & {
  _id: Types.ObjectId;
};

export async function getCharacter(characterId: string) {
  try {
    if (!isValidObjectId(characterId)) {
      throw new Error('Invalid character ID');
    }

    const character = await Character.findById(characterId).lean();

    if (!character) {
      throw new Error('Character not found');
    }

    return JSON.parse(JSON.stringify(character));
  } catch (error: any) {
    console.error('Error fetching character: ', error.message);
    throw error;
  }
}

export type { CharacterWithId };
