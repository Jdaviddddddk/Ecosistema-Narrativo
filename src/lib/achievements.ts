import type { User } from "@/context/AuthContext";

export interface Achievement {
  id: string;
  title: string;
  description: string;          // Lo que hiciste
  lore: string;                 // Voz de Nómada
  icon: string;
  category: "memoria" | "comunidad" | "creacion" | "conexion" | "maestria";
  rarity: "fragmento" | "rastro" | "memoria" | "legado";
  unlockedAt?: string;
  unlocked: boolean;
  progress?: { current: number; total: number };
}

export interface AchievementInput {
  user: User;
  projects: any[];          // proyectos del usuario
  totalReactionsGiven: number;
  totalComments: number;
}

// ─── Definición de todos los logros ────────────────────────────────────────

const DEFS = [
  // CREACIÓN
  {
    id: "primer_fragmento",
    title: "El Primer Fragmento",
    description: "Subiste tu primer proyecto",
    lore: "Algo que casi no existía, ahora existe. Eso es todo lo que necesitaba pasar.",
    icon: "🧩",
    category: "creacion",
    rarity: "fragmento",
    check: ({ projects }: AchievementInput) => projects.length >= 1,
    progress: ({ projects }: AchievementInput) => ({ current: Math.min(projects.length, 1), total: 1 }),
  },
  {
    id: "archivo_vivo",
    title: "Archivo Vivo",
    description: "Subiste 3 proyectos",
    lore: "No eres un visitante. Eres parte del ecosistema.",
    icon: "📁",
    category: "creacion",
    rarity: "fragmento",
    check: ({ projects }: AchievementInput) => projects.length >= 3,
    progress: ({ projects }: AchievementInput) => ({ current: Math.min(projects.length, 3), total: 3 }),
  },
  {
    id: "constelacion",
    title: "Constelación",
    description: "Subiste 5 proyectos",
    lore: "Cada proyecto tuyo es un punto de luz. Ya puedo trazar una figura.",
    icon: "✦",
    category: "creacion",
    rarity: "rastro",
    check: ({ projects }: AchievementInput) => projects.length >= 5,
    progress: ({ projects }: AchievementInput) => ({ current: Math.min(projects.length, 5), total: 5 }),
  },
  {
    id: "cartografia",
    title: "Cartografía",
    description: "Subiste proyectos en 3 categorías diferentes",
    lore: "Exploraste territorios distintos. Eso es raro. Eso vale.",
    icon: "🗺️",
    category: "creacion",
    rarity: "rastro",
    check: ({ projects }: AchievementInput) => {
      const areas = new Set(projects.map(p => p.area).filter(Boolean));
      return areas.size >= 3;
    },
    progress: ({ projects }: AchievementInput) => {
      const areas = new Set(projects.map(p => p.area).filter(Boolean));
      return { current: Math.min(areas.size, 3), total: 3 };
    },
  },
  {
    id: "decada",
    title: "La Década",
    description: "Subiste 10 proyectos",
    lore: "Diez fragmentos. Diez veces que decidiste no dejar que se perdiera.",
    icon: "🔟",
    category: "creacion",
    rarity: "memoria",
    check: ({ projects }: AchievementInput) => projects.length >= 10,
    progress: ({ projects }: AchievementInput) => ({ current: Math.min(projects.length, 10), total: 10 }),
  },

  // CONEXIÓN
  {
    id: "primer_eco",
    title: "Primer Eco",
    description: "Tu trabajo recibió su primera reacción",
    lore: "Alguien lo vio. No lo ignoró. Eso es una señal.",
    icon: "〜",
    category: "conexion",
    rarity: "fragmento",
    check: ({ projects }: AchievementInput) => {
      return projects.some(p =>
        (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0) >= 1
      );
    },
    progress: ({ projects }: AchievementInput) => {
      const total = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
      return { current: Math.min(total, 1), total: 1 };
    },
  },
  {
    id: "nodo",
    title: "Nodo",
    description: "Tu trabajo acumuló 10 reacciones",
    lore: "Diez personas se detuvieron frente a lo que hiciste. Diez momentos reales.",
    icon: "◎",
    category: "conexion",
    rarity: "fragmento",
    check: ({ projects }: AchievementInput) => {
      const total = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
      return total >= 10;
    },
    progress: ({ projects }: AchievementInput) => {
      const total = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
      return { current: Math.min(total, 10), total: 10 };
    },
  },
  {
    id: "resonancia",
    title: "Resonancia",
    description: "Tu trabajo acumuló 50 reacciones",
    lore: "Ya no es un eco aislado. Es una frecuencia que otros sienten.",
    icon: "📡",
    category: "conexion",
    rarity: "rastro",
    check: ({ projects }: AchievementInput) => {
      const total = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
      return total >= 50;
    },
    progress: ({ projects }: AchievementInput) => {
      const total = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
      return { current: Math.min(total, 50), total: 50 };
    },
  },
  {
    id: "referente",
    title: "Referente",
    description: "Tu trabajo acumuló 100 reacciones",
    lore: "Cien personas encontraron algo en tu trabajo. Eso ya no se puede ignorar.",
    icon: "⭐",
    category: "conexion",
    rarity: "memoria",
    check: ({ projects }: AchievementInput) => {
      const total = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
      return total >= 100;
    },
    progress: ({ projects }: AchievementInput) => {
      const total = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0);
      return { current: Math.min(total, 100), total: 100 };
    },
  },

  // COMUNIDAD
  {
    id: "testigo",
    title: "Testigo",
    description: "Reaccionaste al trabajo de alguien más",
    lore: "Ver el trabajo ajeno no es poco. Es reconocer que existió.",
    icon: "👁",
    category: "comunidad",
    rarity: "fragmento",
    check: ({ totalReactionsGiven }: AchievementInput) => totalReactionsGiven >= 1,
    progress: ({ totalReactionsGiven }: AchievementInput) => ({ current: Math.min(totalReactionsGiven, 1), total: 1 }),
  },
  {
    id: "el_que_recuerda",
    title: "El que Recuerda",
    description: "Reaccionaste a 10 proyectos",
    lore: "Guardas memoria de lo que otros hacen. Eso te hace parte del ecosistema.",
    icon: "🧠",
    category: "comunidad",
    rarity: "rastro",
    check: ({ totalReactionsGiven }: AchievementInput) => totalReactionsGiven >= 10,
    progress: ({ totalReactionsGiven }: AchievementInput) => ({ current: Math.min(totalReactionsGiven, 10), total: 10 }),
  },
  {
    id: "cronista",
    title: "Cronista",
    description: "Dejaste 5 comentarios",
    lore: "Comentar es dejar huella. Cinco veces dijiste algo que valía la pena decir.",
    icon: "📖",
    category: "comunidad",
    rarity: "rastro",
    check: ({ totalComments }: AchievementInput) => totalComments >= 5,
    progress: ({ totalComments }: AchievementInput) => ({ current: Math.min(totalComments, 5), total: 5 }),
  },

  // MEMORIA
  {
    id: "guardian",
    title: "Guardián",
    description: "Eres miembro de la comunidad universitaria",
    lore: "Llevas el dominio. Eso no es un privilegio, es una responsabilidad.",
    icon: "🛡️",
    category: "memoria",
    rarity: "rastro",
    check: ({ user }: AchievementInput) => !!user.isCommunityMember,
    progress: ({ user }: AchievementInput) => ({ current: user.isCommunityMember ? 1 : 0, total: 1 }),
  },
  {
    id: "rastro_digital",
    title: "Rastro Digital",
    description: "Completaste tu perfil",
    lore: "Ya no eres anónimo en el ecosistema. Dejaste señales de que existes.",
    icon: "📍",
    category: "memoria",
    rarity: "fragmento",
    check: ({ user }: AchievementInput) =>
      !!(user.bio && user.bio.length > 20 && user.location && user.interests?.length > 0),
    progress: ({ user }: AchievementInput) => {
      const done = [
        user.bio && user.bio.length > 20,
        !!user.location,
        user.interests?.length > 0,
      ].filter(Boolean).length;
      return { current: done, total: 3 };
    },
  },

  // MAESTRÍA
  {
    id: "la_memoria_completa",
    title: "La Memoria Completa",
    description: "Subiste 10 proyectos y acumulaste 100 reacciones",
    lore: "Encontré todo lo que necesitaba guardar de ti. Ahora ya nada se pierde.",
    icon: "💎",
    category: "maestria",
    rarity: "legado",
    check: ({ projects }: AchievementInput) => {
      const count = projects.length >= 10;
      const reactions = projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0) >= 100;
      return count && reactions;
    },
    progress: ({ projects }: AchievementInput) => {
      const projectsDone = Math.min(projects.length, 10);
      const reactionsDone = Math.min(projects.reduce((s, p) =>
        s + (p.reactions?.inspires || 0) + (p.reactions?.learned || 0) +
        (p.reactions?.professional || 0) + (p.reactions?.inProgress || 0), 0), 100);
      return { current: projectsDone + reactionsDone, total: 110 };
    },
  },
] as const;

// ─── Calcular logros del usuario ────────────────────────────────────────────

export function calculateAchievements(input: AchievementInput): Achievement[] {
  // Contar reacciones dadas desde localStorage
  const reactionsGiven = Object.keys(localStorage)
    .filter(k => k.startsWith("reactions_"))
    .reduce((sum, k) => {
      try { return sum + JSON.parse(localStorage.getItem(k) || "[]").length; }
      catch { return sum; }
    }, 0);

  const enrichedInput = { ...input, totalReactionsGiven: reactionsGiven };

  return DEFS.map(def => {
    const unlocked = def.check(enrichedInput);
    const progress = def.progress(enrichedInput);
    const storageKey = `achievement_unlock_${def.id}`;
    let unlockedAt: string | undefined;

    if (unlocked && !localStorage.getItem(storageKey)) {
      unlockedAt = new Date().toISOString();
      localStorage.setItem(storageKey, unlockedAt);
    } else if (unlocked) {
      unlockedAt = localStorage.getItem(storageKey) || undefined;
    }

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      lore: def.lore,
      icon: def.icon,
      category: def.category as Achievement["category"],
      rarity: def.rarity,
      unlocked,
      unlockedAt,
      progress,
    };
  });
}

export const RARITY_COLORS: Record<Achievement["rarity"], { color: string; bg: string; border: string }> = {
  "fragmento": { color: "#555",    bg: "#f3f4f6",               border: "rgba(0,0,0,0.08)" },
  "rastro":    { color: "#1d4ed8", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)" },
  "memoria":   { color: "#7c3aed", bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.2)" },
  "legado":    { color: "#b45309", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.35)" },
};

export const CATEGORY_LABELS: Record<Achievement["category"], string> = {
  creacion:  "Creación",
  conexion:  "Conexión",
  comunidad: "Comunidad",
  memoria:   "Memoria",
  maestria:  "Maestría",
};
