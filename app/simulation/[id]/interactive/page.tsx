import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/characters";
import InteractiveScene from "@/components/InteractiveScene";
import { PhoneTopBar } from "./PhoneTopBar";

type Props = { params: Promise<{ id: string }> };

export default async function InteractivePage({ params }: Props) {
  const { id } = await params;
  const character = getCharacter(id);
  if (!character) notFound();

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <PhoneTopBar id={id} shortDescription={character.shortDescription} />
      <InteractiveScene character={character} />
    </div>
  );
}
