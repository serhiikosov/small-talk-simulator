import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters";
import { CharacterCoverClient } from "./CharacterCoverClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CharacterPage({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);
  if (!character) notFound();
  return <CharacterCoverClient character={character} />;
}
