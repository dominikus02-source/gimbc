import { lazy, Suspense, useEffect, useRef } from "react";
import { Overlay } from "./Overlay";
import { World } from "./sim";
import { unlockAudio } from "./audio";

const GameCanvas = lazy(() => import("./scene").then((m) => ({ default: m.GameCanvas })));

export default function GameApp() {
  const worldRef = useRef<World | null>(null);
  if (!worldRef.current) worldRef.current = new World();
  const world = worldRef.current;

  useEffect(() => {
    world.mount();
    return () => world.unmount();
  }, [world]);

  return (
    <div
      className="game-root bg-bg"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        unlockAudio();
        if (world.phase !== "playing") return;
        if ((e.target as HTMLElement).closest("button, [data-ui]")) return;
        if (e.button === 0) world.input.pointerAttack = true;
      }}
    >
      <Suspense fallback={null}><GameCanvas world={world} /></Suspense>
      <Overlay world={world} />
    </div>
  );
}
