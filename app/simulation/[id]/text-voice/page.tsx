import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters";
import TextVoiceChat from "@/components/TextVoiceChat";

type Props = { params: Promise<{ id: string }> };

export default async function TextVoicePage({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);
  if (!character) notFound();
  return <TextVoiceChat character={character} />;
}
