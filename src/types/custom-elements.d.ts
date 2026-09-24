/**
 * 原型 Web Components 的 JSX 类型声明。
 *
 * 这些元素由 public/components/*.js 注册（customElements.define），
 * 不属于 React 组件，需要在此声明才能在 TSX 中使用。
 *
 * 布尔属性在组件里用 hasAttribute() 读取，因此 JSX 中写空字符串（如 glow=""）
 * 而不是 {true}，避免 React 把 true 渲染成属性字符串时产生歧义。
 */

import type { HTMLAttributes, ReactNode } from "react";

interface PrototypeElementAttributes extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

type Booleanish = "" | undefined;

interface DiaDockAttributes extends PrototypeElementAttributes {
  scale?: string;
  distance?: string;
}

interface DiaTextRevealAttributes extends PrototypeElementAttributes {
  text?: string;
  colors?: string;
  "text-color"?:string;
  trigger?: "hover" | "view";
  duration?: string;
  delay?: string;
  stack?: Booleanish;
  "start-on-view"?: "true" | "false";
}

interface DiaDotPatternAttributes extends PrototypeElementAttributes {
  spacing?: string;
  radius?: string;
  glow?: Booleanish;
}

interface DiaLogoParticlesAttributes extends PrototypeElementAttributes {
  src?: string;
}

interface DiaTerminalAttributes extends PrototypeElementAttributes {
  speed?: string;
  shine?: Booleanish;
  "shine-duration"?: string;
}

interface DiaBlurFadeAttributes extends PrototypeElementAttributes {
  "in-view"?: Booleanish;
  delay?: string;
}

interface DiaIconCloudAttributes extends PrototypeElementAttributes {
  size?: string;
  speed?: string;
}

interface DiaAnimatedListAttributes extends PrototypeElementAttributes {
  delay?: string;
  duration?: string;
  "start-on-view"?: Booleanish;
}

interface DiaMarqueeAttributes extends PrototypeElementAttributes {
  repeat?: string;
  "pause-on-hover"?: Booleanish;
  reverse?: Booleanish;
  vertical?: Booleanish;
}

interface ThreeuiAttributes extends PrototypeElementAttributes {
  variant?: string;
  mode?: string;
  speed?: string;
  scale?: string;
  opacity?: string;
  hue?: string;
  saturation?: string;
  brightness?: string;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "dia-dock": DiaDockAttributes;
      "dia-text-reveal": DiaTextRevealAttributes;
      "dia-dot-pattern": DiaDotPatternAttributes;
      "dia-logo-particles": DiaLogoParticlesAttributes;
      "dia-terminal": DiaTerminalAttributes;
      "dia-file-tree": PrototypeElementAttributes;
      "dia-blur-fade": DiaBlurFadeAttributes;
      "dia-pixel-image": PrototypeElementAttributes;
      "dia-icon-cloud": DiaIconCloudAttributes;
      "dia-animated-list": DiaAnimatedListAttributes;
      "dia-marquee": DiaMarqueeAttributes;
      "dia-avatar-circles": PrototypeElementAttributes;
      "dia-retro-grid": PrototypeElementAttributes;
      "threeui-character-carousel": ThreeuiAttributes;
      "threeui-globe-study": ThreeuiAttributes;
    }
  }
}
