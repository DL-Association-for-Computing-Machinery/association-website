import { HOME_GREETING } from "@/lib/home-content";
import { GreetingConfetti } from "./greeting-confetti";

/**
 * 问候区：首屏之下，向下滚动才进入视口。
 *
 * 终端与文件树是基线的组件演示（客户端自定义元素），文案照原型原文；
 * 两者都不属于内容包要求的内容，真实内容仍待 #4/#5 补。
 */
export function HomeGreeting() {
  return (
    <section className="greeting" aria-labelledby="greeting-title">
      <GreetingConfetti />

      <h2 className="greeting-title" id="greeting-title">
        {HOME_GREETING.title}
      </h2>
      <p className="greeting-subtitle">{HOME_GREETING.subtitle}</p>

      <div className="greeting-tools">
        <dia-terminal speed="45" shine="" shine-duration="9">
          {HOME_GREETING.terminalLines.map((line) => (
            <span key={line.text} data-typing={line.typing ? "" : undefined}>
              {line.text}
            </span>
          ))}
        </dia-terminal>

        <dia-file-tree />
      </div>
    </section>
  );
}
