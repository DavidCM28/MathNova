export type MathNumbersSlug =
  | "cofre-bienvenida"
  | "radar-supervivencia"
  | "ascensor-bunker";

export type MathNumbersResultSlug =
  | "completada"
  | "casi-lo-logras"
  | "vuelve-a-intentarlo"
  | "pista";

export type MathNumbersActivityInfo = {
  slug: MathNumbersSlug;
  title: string;
  shortTitle: string;
  topic: string;
  total: number;
  time: string;
  progress: number;
  next?: MathNumbersSlug;
  hint: string;
};

export const mathNumbersActivities: Record<MathNumbersSlug, MathNumbersActivityInfo> = {
  "cofre-bienvenida": {
    slug: "cofre-bienvenida",
    title: "1. El Cofre de Bienvenida",
    shortTitle: "El Cofre de Bienvenida",
    topic: "Fracciones y decimales",
    total: 2,
    time: "05:00",
    progress: 18,
    next: "radar-supervivencia",
    hint:
      "Convierte la fracción en decimal dividiendo el numerador entre el denominador. Por ejemplo, 1 ÷ 2 = 0.5.",
  },
  "radar-supervivencia": {
    slug: "radar-supervivencia",
    title: "2. El Radar de Supervivencia",
    shortTitle: "El Radar de Supervivencia",
    topic: "Positivos y negativos",
    total: 4,
    time: "10:00",
    progress: 34,
    next: "ascensor-bunker",
    hint:
      "En la recta numérica, los números negativos van a la izquierda del cero y los positivos a la derecha.",
  },
  "ascensor-bunker": {
    slug: "ascensor-bunker",
    title: "3. El Ascensor del Búnker",
    shortTitle: "El Ascensor del Búnker",
    topic: "Ordenamiento de enteros",
    total: 5,
    time: "12:00",
    progress: 52,
    hint:
      "Ordena de menor a mayor: primero los negativos más pequeños, luego el cero y después los positivos.",
  },
};

export const mathNumbersActivityList = Object.values(mathNumbersActivities);

export function getMathNumbersActivity(slug: string | null | undefined) {
  if (!slug) return mathNumbersActivities["cofre-bienvenida"];
  return mathNumbersActivities[slug as MathNumbersSlug] || mathNumbersActivities["cofre-bienvenida"];
}

export function isMathNumbersResultSlug(slug: string): slug is MathNumbersResultSlug {
  return ["completada", "casi-lo-logras", "vuelve-a-intentarlo", "pista"].includes(slug);
}
