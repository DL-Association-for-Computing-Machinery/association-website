/**
 * 首页基线里那些原生 Web Component 的 JSX 类型声明。
 *
 * 它们不是 React 组件，而是注册在客户端的自定义元素（脚本清单见
 * `src/lib/site-runtime.ts`，由 `src/components/prototype-scripts.tsx` 在水合后加载），
 * 属性一律按 HTML 属性的写法传递：全小写、带连字符，值用字符串。
 * 属性名与取值照 `public/prototype/index.html`，不另起一套。
 */
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type CustomElementProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

interface DiaTextRevealProps extends CustomElementProps {
  text?: string;
  colors?: string;
  "text-color"?: string;
  trigger?: "hover" | "view";
  duration?: string;
  delay?: string;
  "start-on-view"?: string;
  stack?: string;
}

interface DiaDockProps extends CustomElementProps {
  scale?: string;
  distance?: string;
}

interface DiaTerminalProps extends CustomElementProps {
  speed?: string;
  shine?: string;
  "shine-duration"?: string;
}

interface DiaDotPatternProps extends CustomElementProps {
  spacing?: string;
  radius?: string;
  glow?: string;
}

interface DiaIconCloudProps extends CustomElementProps {
  size?: string;
  speed?: string;
}

interface DiaAnimatedListProps extends CustomElementProps {
  delay?: string;
  duration?: string;
  "start-on-view"?: string;
}

interface DiaMarqueeProps extends CustomElementProps {
  repeat?: string;
  reverse?: string;
  vertical?: string;
  "pause-on-hover"?: string;
}

interface DiaLogoParticlesProps extends CustomElementProps {
  src?: string;
}

interface ThreeUiGlobeStudyProps extends CustomElementProps {
  mode?: string;
  scale?: string;
  opacity?: string;
  hue?: string;
  saturation?: string;
  brightness?: string;
}

interface ThreeUiCharacterCarouselProps extends CustomElementProps {
  variant?: string;
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
      "dia-dock": DiaDockProps;
      "dia-text-reveal": DiaTextRevealProps;
      "dia-terminal": DiaTerminalProps;
      "dia-file-tree": CustomElementProps;
      "dia-blur-fade": CustomElementProps & { "in-view"?: string; delay?: string };
      "dia-dot-pattern": DiaDotPatternProps;
      "dia-icon-cloud": DiaIconCloudProps;
      "dia-animated-list": DiaAnimatedListProps;
      "dia-marquee": DiaMarqueeProps;
      "dia-avatar-circles": CustomElementProps;
      "dia-retro-grid": CustomElementProps;
      "dia-logo-particles": DiaLogoParticlesProps;
      "threeui-globe-study": ThreeUiGlobeStudyProps;
      "threeui-character-carousel": ThreeUiCharacterCarouselProps;
    }
  }
}
