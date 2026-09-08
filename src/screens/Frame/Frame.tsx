import { useEffect, useRef, useState } from "react";
import { images } from "../../assets/images";

const content = {
  title: "Ящик балтики не пей",
  personName: "Илюха Жопич (Мэддисон)",
};

type Point = {
  x: number;
  y: number;
};

type BeerPosition = Point & {
  angle: number;
};

const BEER_SIZE = { width: 270, height: 180 };
const CURSOR_RADIUS = 125;

export const Frame = (): JSX.Element => {
  const sceneRef = useRef<HTMLElement>(null);
  const beerRef = useRef<BeerPosition>({ x: 120, y: 220, angle: -4 });
  const velocityRef = useRef<Point>({ x: 3.12, y: 2.16 });
  const pointerRef = useRef<Point>({ x: -500, y: -500 });
  const cursorPositionRef = useRef<Point>({ x: -500, y: -500 });
  const cursorRef = useRef<HTMLElement>(null);
  const [beer, setBeer] = useState<BeerPosition>(beerRef.current);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent): void => {
      const scene = sceneRef.current;
      if (!scene) return;

      const bounds = scene.getBoundingClientRect();
      const nextPointer = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };
      pointerRef.current = nextPointer;
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  useEffect(() => {
    let animationFrame = 0;
    let lastTime = performance.now();

    const animate = (time: number): void => {
      const elapsed = Math.min(time - lastTime, 32);
      lastTime = time;
      const scale = elapsed / 16.67;
      const scene = sceneRef.current;

      const cursor = cursorRef.current;
      if (cursor) {
        const cursorPosition = cursorPositionRef.current;
        const target = pointerRef.current;
        const smoothing = 1 - Math.pow(0.78, scale);
        cursorPosition.x += (target.x - cursorPosition.x) * smoothing;
        cursorPosition.y += (target.y - cursorPosition.y) * smoothing;
        cursor.style.transform = `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0) translate(-50%, -50%) rotate(-5deg)`;
      }

      if (scene) {
        const bounds = scene.getBoundingClientRect();
        const beerPosition = beerRef.current;
        const velocity = velocityRef.current;
        const pointerPosition = pointerRef.current;
        const beerCenter = {
          x: beerPosition.x + BEER_SIZE.width / 2,
          y: beerPosition.y + BEER_SIZE.height / 2,
        };
        const distance = Math.hypot(
          beerCenter.x - pointerPosition.x,
          beerCenter.y - pointerPosition.y,
        );

        if (distance < CURSOR_RADIUS) {
          const awayX = beerCenter.x - pointerPosition.x;
          const awayY = beerCenter.y - pointerPosition.y;
          const length = Math.max(Math.hypot(awayX, awayY), 1);
          velocity.x += (awayX / length) * 0.6 * scale;
          velocity.y += (awayY / length) * 0.6 * scale;
        }

        const speed = Math.hypot(velocity.x, velocity.y);
        if (speed > 6.6) {
          velocity.x = (velocity.x / speed) * 6.6;
          velocity.y = (velocity.y / speed) * 6.6;
        }

        let nextX = beerPosition.x + velocity.x * scale;
        let nextY = beerPosition.y + velocity.y * scale;
        let nextAngle = beerPosition.angle + velocity.x * 0.09 * scale;

        if (nextX <= 24 || nextX >= bounds.width - BEER_SIZE.width - 24) {
          velocity.x *= -1;
          nextX = Math.max(24, Math.min(nextX, bounds.width - BEER_SIZE.width - 24));
          nextAngle *= -1;
        }
        if (nextY <= 24 || nextY >= bounds.height - BEER_SIZE.height - 24) {
          velocity.y *= -1;
          nextY = Math.max(24, Math.min(nextY, bounds.height - BEER_SIZE.height - 24));
          nextAngle *= -1;
        }

        beerRef.current = { x: nextX, y: nextY, angle: nextAngle };
        setBeer(beerRef.current);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <main
      ref={sceneRef}
      className="scene relative min-h-screen w-full overflow-hidden bg-[#070707] text-white"
    >
      <div className="grain pointer-events-none absolute inset-0" />
      <div className="absolute left-6 top-6 z-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/45 sm:left-10 sm:top-10">
        <span className="h-2 w-2 rounded-full bg-[#e8a12f] shadow-[0_0_16px_#e8a12f]" />
        <span>Легендарная битва с алкоголизмом</span>
      </div>
      <div className="absolute bottom-6 left-6 z-10 text-[10px] uppercase tracking-[0.25em] text-white/35 sm:bottom-10 sm:left-10">
        Двигай мышью
      </div>

      <h1 className="absolute left-1/2 top-1/2 z-[1] w-full -translate-x-1/2 -translate-y-1/2 px-5 text-center font-sans text-[clamp(2.7rem,8vw,8rem)] font-black uppercase leading-[0.88] tracking-[-0.06em] text-white transition-transform duration-500 hover:scale-[1.015]">
        {content.title}
      </h1>

      <figure
        className="pointer-events-none absolute z-[3] will-change-transform"
        style={{
          left: beer.x,
          top: beer.y,
          width: BEER_SIZE.width,
          transform: `rotate(${beer.angle}deg)`,
        }}
      >
        <div className="relative overflow-hidden rounded-[3px] border border-white/25 bg-[#1a1109] p-2 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <img
            className="block h-auto w-full object-cover brightness-90 saturate-[0.85]"
            alt="Ящик с бутылками пива"
            src={images.beerCrate}
          />
          <span className="absolute bottom-3 left-3 bg-black/75 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-[#f2c26b]">
            Не поймаешь
          </span>
        </div>
      </figure>

      <figure
        ref={cursorRef}
        className="pointer-events-none fixed left-0 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 will-change-transform"
        style={{ transform: "translate3d(-500px, -500px, 0) translate(-50%, -50%) rotate(-5deg)" }}
      >
        <div className="relative h-[108px] w-[82px] rotate-[-5deg] overflow-hidden rounded-sm border border-white/60 bg-[#191919] shadow-[0_8px_28px_rgba(0,0,0,0.65)] sm:h-[140px] sm:w-[104px]">
          <img
            className="h-full w-full object-cover grayscale-[0.2]"
            alt="Портрет Илюхи Жопича"
            src={images.portrait}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </div>
        <figcaption className="whitespace-nowrap rounded-full border border-white/25 bg-black/80 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-white shadow-xl sm:text-[10px]">
          {content.personName}
        </figcaption>
      </figure>
    </main>
  );
};
