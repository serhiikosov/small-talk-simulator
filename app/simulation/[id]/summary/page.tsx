import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters";
import SummaryClient from "./SummaryClient";

type Props = { params: Promise<{ id: string }> };

export default async function SummaryPage({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);
  if (!character) notFound();

  return (
    <SummaryClient
      characterId={character.id}
      characterName={character.name}
      characterAvatar={character.avatar}
    />
  );
}
