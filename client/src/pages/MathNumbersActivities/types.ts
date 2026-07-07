import type { ReactNode } from "react";

export type ShellProps = {
  crumb: string;
  title: string;
  subtitle: string;
  progress?: string;
  progressValue?: number;
  heroImage?: string;
  heroAlt?: string;
  rewardTitle?: string;
  rewardText?: string;
  children: ReactNode;
};

export type ToastState = {
  text: string;
  error?: boolean;
};

export type StatItem = {
  label: string;
  value: string;
  note?: string;
  icon: string;
};

export type ResultKind = "completed" | "almost" | "retry" | "hint";

export type ResultAction = {
  label: string;
  action: string;
  primary?: boolean;
  icon: ReactNode;
};

export type ResultScreenData = {
  title: string;
  subtitle: string;
  messageTitle: string;
  message: string;
  progressText: string;
  hero: string;
  heroAlt: string;
  planet: string;
  milestone: string;
  stats: StatItem[];
  actions: ResultAction[];
};
