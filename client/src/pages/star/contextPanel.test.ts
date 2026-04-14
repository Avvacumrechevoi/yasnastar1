import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ContextPanel } from "./ContextPanel";
import { buildContextPanelModel, getSingleSentence } from "./contextPanel";

describe("contextPanel", () => {
  it("shows only yasna header and hint when nothing else is selected", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Облачность",
        summary: "Эта Ясна о плотности, просветах и динамике облаков. Второе предложение не должно попасть в хедер.",
      },
      activeMechanics: [],
      selectedPoint: null,
    });

    expect(model.headerTitle).toBe("Облачность");
    expect(model.headerDescription).toBe("Эта Ясна о плотности, просветах и динамике облаков.");
    expect(model.blocks).toEqual([]);
    expect(model.hint).toContain("Выберите полочку звезды");
  });

  it("shows a point block, lesson preview blocks, note blocks and then all mechanic blocks in activation order", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Атмосфера встречи",
        summary: "Эта Ясна читает общий воздух переговоров.",
        notes: ["Эта Ясна нужна до обсуждения содержания спора. Второе предложение не нужно."],
        mechanics: ["атмосфера", "просветы", "уровень доверия"],
        lessonPreviews: [
          {
            id: "lesson-1",
            title: "Урок 1. Ранние сигналы атмосферы переговоров.",
            description: "Помогает увидеть общий воздух до анализа предмета спора. Второе предложение не нужно.",
            sourceLesson: "Урок 1. Ранние сигналы атмосферы переговоров.",
            sourceFile: "1__Урок_1_атмосфера.docx",
          },
          {
            id: "lesson-2",
            title: "Урок 2. Просветы в напряжённом разговоре.",
            description: "Показывает, где переговоры ещё можно мягко прояснить до жёсткой фиксации позиций.",
            sourceLesson: "Урок 2. Просветы в напряжённом разговоре.",
            sourceFile: "2__Урок_2_просветы.docx",
          },
        ],
      },
      activeMechanics: [
        {
          id: "support-cross",
          title: "Опорный крест",
          contextText: "Держит выбранную полочку как опорную точку всей сцены. Второе предложение не нужно.",
        },
        {
          id: "fire",
          title: "Стихия огня",
          contextText: "Усиливает температуру обсуждения вокруг выбранной полочки и показывает, где появляется напор.",
        },
      ],
      selectedPoint: {
        index: 0,
        title: "Зерно воды",
        text: "Полочка задаёт исходное ядро процесса и коротко объясняет, что именно здесь начинает собираться.",
      },
    });

    expect(model.blocks.map((block) => block.id)).toEqual([
      "point-0",
      "lesson-lesson-1",
      "lesson-lesson-2",
      "note-0",
      "mechanic-support-cross",
      "mechanic-fire",
    ]);
    expect(model.blocks.map((block) => block.kind)).toEqual(["point", "yasna", "yasna", "note", "mechanic", "mechanic"]);
    expect(model.blocks[0]).toMatchObject({
      label: "Полочка 0",
      title: "Зерно воды",
      description: "Полочка задаёт исходное ядро процесса и коротко объясняет, что именно здесь начинает собираться.",
    });
    expect(model.blocks[1]).toMatchObject({
      label: "Урок Ясны",
      title: "Урок 1.",
      description: "Помогает увидеть общий воздух до анализа предмета спора. Опора: Урок 1. Источник: 1__Урок_1_атмосфера.docx.",
    });
    expect(model.blocks[2]).toMatchObject({
      label: "Урок Ясны",
      title: "Урок 2.",
      description: "Показывает, где переговоры ещё можно мягко прояснить до жёсткой фиксации позиций. Опора: Урок 2. Источник: 2__Урок_2_просветы.docx.",
    });
    expect(model.blocks[3]).toMatchObject({
      label: "Опора Ясны",
      title: "Методическая опора 1",
      description: "Эта Ясна нужна до обсуждения содержания спора.",
    });
    expect(model.blocks[4]).toMatchObject({
      label: "Механика",
      title: "Опорный крест",
      description: "Держит выбранную полочку как опорную точку всей сцены.",
    });
    expect(model.blocks[5]).toMatchObject({
      label: "Механика",
      title: "Стихия огня",
      description: "Усиливает температуру обсуждения вокруг выбранной полочки и показывает, где появляется напор.",
    });
    expect(model.hint).toBeNull();
  });

  it("removes only the corresponding mechanic block when a mechanic is turned off", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Домашние животные",
        summary: "Эта Ясна показывает роли и пространства домашней сцены.",
      },
      activeMechanics: [
        {
          id: "earth",
          title: "Земля",
          contextText: "Показывает опорную среду, где разворачивается вся конфигурация.",
        },
      ],
      selectedPoint: {
        index: 4,
        title: "Коровник",
        text: "Полочка фиксирует пространство устойчивого содержания и распределения ролей.",
      },
    });

    expect(model.blocks.map((block) => block.id)).toEqual(["point-4", "mechanic-earth"]);

    const updatedModel = buildContextPanelModel({
      yasna: {
        title: "Домашние животные",
        summary: "Эта Ясна показывает роли и пространства домашней сцены.",
      },
      activeMechanics: [],
      selectedPoint: {
        index: 4,
        title: "Коровник",
        text: "Полочка фиксирует пространство устойчивого содержания и распределения ролей.",
      },
    });

    expect(updatedModel.blocks.map((block) => block.id)).toEqual(["point-4"]);
    expect(updatedModel.blocks[0]).toMatchObject({
      label: "Полочка 4",
      title: "Коровник",
    });
    expect(updatedModel.hint).toBeNull();
  });

  it("asks the user to select a point before showing active mechanics", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Круговорот воды",
        summary: "Эта Ясна показывает цикл движения и превращения воды.",
      },
      activeMechanics: [
        {
          id: "support",
          title: "Опора",
          description: "Помогает удерживать устойчивый каркас разговора. Дополнительная деталь не нужна.",
        },
      ],
      selectedPoint: null,
    });

    expect(model.blocks).toEqual([]);
    expect(model.hint).toContain("Сначала выберите полочку звезды");
  });

  it("falls back to empty yasna state when header data is absent", () => {
    const model = buildContextPanelModel({
      yasna: null,
      activeMechanics: [],
      selectedPoint: null,
    });

    expect(model.headerTitle).toBe("Ясна не выбрана");
    expect(model.headerDescription).toBe("Выберите Ясну сверху, чтобы увидеть её краткое описание.");
    expect(model.blocks).toEqual([]);
    expect(model.hint).toContain("Выберите полочку звезды");
  });

  it("renders accumulated blocks inside a scrollable panel container", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Атмосфера встречи",
        summary: "Эта Ясна читает общий воздух переговоров.",
        notes: ["Эта Ясна нужна до обсуждения содержания спора. Второе предложение не нужно."],
        mechanics: ["атмосфера", "просветы", "уровень доверия"],
        lessonPreviews: [
          {
            id: "lesson-1",
            title: "Урок 1. Ранние сигналы атмосферы переговоров.",
            description: "Помогает увидеть общий воздух до анализа предмета спора. Второе предложение не нужно.",
            sourceLesson: "Урок 1. Ранние сигналы атмосферы переговоров.",
            sourceFile: "1__Урок_1_атмосфера.docx",
          },
        ],
      },
      activeMechanics: [
        {
          id: "support-cross",
          title: "Опорный крест",
          contextText: "Держит выбранную полочку как опорную точку всей сцены.",
        },
        {
          id: "fire",
          title: "Стихия огня",
          contextText: "Усиливает температуру обсуждения вокруг выбранной полочки.",
        },
      ],
      selectedPoint: {
        index: 3,
        title: "Осадок",
        text: "Полочка показывает слой, где уже начинает собираться результат процесса.",
      },
    });

    const html = renderToStaticMarkup(createElement(ContextPanel, { model }));

    expect(html).toContain("overflow-hidden");
    expect(html).toContain("lg:overflow-y-auto");
    expect(html).toContain("lg:max-h-full");
    expect(html).toContain("lg:self-stretch");
    expect(html).toContain(">Свернуть<");
    expect(html).toContain("rounded-[18px]");
    expect(html).toContain("text-[14px] font-semibold");
    expect(html).toContain("text-[12px] leading-[1.45] text-white/62");
    expect(html).not.toContain(">Ясна<");
    expect(html).not.toContain("Активная Ясна");
    expect(html).not.toContain("Эта Ясна читает общий воздух переговоров.");
    expect(html).not.toContain("Механики, упомянутые в уроках");
    expect(html).not.toContain("Проверенные уроки");
    expect(html).not.toContain("Заметки для интерфейса");
    expect(html).toContain("Полочка 3");
    expect(html).not.toContain("Фокус Ясны");
    expect(html).toContain("Урок Ясны");
    expect(html).toContain("Урок 1.");
    expect(html).toContain("Помогает увидеть общий воздух до анализа предмета спора. Опора: Урок 1. Источник: 1__Урок_1_атмосфера.docx.");
    expect(html).toContain("Опора Ясны");
    expect(html).toContain("Методическая опора 1");
    expect(html).toContain("Эта Ясна нужна до обсуждения содержания спора.");
    expect(html).not.toContain("Ключевые механики: атмосфера, просветы, уровень доверия.");
    expect(html).toContain("Опорный крест");
    expect(html).toContain("Стихия огня");
    expect(html).toContain('title="Полочка показывает слой, где уже начинает собираться результат процесса."');
    expect(html).not.toContain('title="Ключевые механики: атмосфера, просветы, уровень доверия."');
    expect(html).toContain('title="Помогает увидеть общий воздух до анализа предмета спора. Опора: Урок 1. Источник: 1__Урок_1_атмосфера.docx."');
    expect(html).toContain('title="Эта Ясна нужна до обсуждения содержания спора."');
    expect(html).toContain('title="Держит выбранную полочку как опорную точку всей сцены."');
    expect(html).toContain(">Полочка показывает слой, где уже начинает собираться результат процесса.<");
    expect(html).toContain(">Эта Ясна нужна до обсуждения содержания спора.<");
    expect(html).toContain(">Помогает увидеть общий воздух до анализа предмета спора. Опора: Урок 1. Источник: 1__Урок_1_атмосфера.docx.<");
    expect(html).toContain(">Держит выбранную полочку как опорную точку всей сцены.<");
  });

  it("renders hint as a compact readable card instead of a truncated chip", () => {
    const model = buildContextPanelModel({
      yasna: null,
      activeMechanics: [],
      selectedPoint: null,
    });

    const html = renderToStaticMarkup(createElement(ContextPanel, { model }));

    expect(html).toContain("rounded-[20px]");
    expect(html).toContain(">Навигация<");
    expect(html).toContain(">Выберите полочку звезды, чтобы справа появился базовый блок точки, а затем добавляйте механики слева для накопительного контекста.<");
    expect(html).not.toContain("truncate rounded-[18px]");
  });

  it("does not render a second line when the description duplicates the title", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Атмосфера встречи",
        summary: "Эта Ясна читает общий воздух переговоров.",
      },
      activeMechanics: [],
      selectedPoint: {
        index: 5,
        title: "Рабочий воздух",
        text: "Рабочий воздух.",
      },
    });

    const html = renderToStaticMarkup(createElement(ContextPanel, { model }));

    expect(html).toContain(">Рабочий воздух<");
    expect(html).not.toContain(">Рабочий воздух.<");
  });

  it("renders a compact collapsed state for the floating overlay panel", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Атмосфера встречи",
        summary: "Эта Ясна читает общий воздух переговоров.",
        notes: ["Эта Ясна нужна до обсуждения содержания спора. Второе предложение не нужно."],
        mechanics: ["атмосфера", "просветы", "уровень доверия"],
        lessonPreviews: [
          {
            id: "lesson-1",
            title: "Урок 1. Ранние сигналы атмосферы переговоров.",
            description: "Помогает увидеть общий воздух до анализа предмета спора. Второе предложение не нужно.",
            sourceLesson: "Урок 1. Ранние сигналы атмосферы переговоров.",
            sourceFile: "1__Урок_1_атмосфера.docx",
          },
        ],
      },
      activeMechanics: [
        {
          id: "support-cross",
          title: "Опорный крест",
          contextText: "Держит выбранную полочку как опорную точку всей сцены.",
        },
      ],
      selectedPoint: {
        index: 2,
        title: "Переход",
        text: "Полочка показывает зону смены состояния и переговорного режима.",
      },
    });

    const html = renderToStaticMarkup(createElement(ContextPanel, { model, initialCollapsed: true }));

    expect(html).toContain(">Развернуть<");
    expect(html).not.toContain(">Свернуть<");
    expect(html).not.toContain(">Навигация<");
    expect(html).not.toContain(">Переход<");
    expect(html).not.toContain(">Фокус Ясны<");
    expect(html).not.toContain(">Опорный крест<");
  });

  it("adds preset, omens, recommendations and synthesis bridges to the floating point card", () => {
    const model = buildContextPanelModel({
      yasna: {
        title: "Атмосфера переговоров",
        summary: "Эта Ясна читает общий воздух встречи и его ранние сдвиги.",
      },
      activeMechanics: [
        {
          id: "wind-shift",
          title: "Смена ветра",
          contextText: "Показывает, в какой момент разговор можно мягко перенаправить в более рабочий коридор.",
        },
      ],
      selectedPoint: {
        index: 6,
        title: "Фронт напряжения",
        text: "Полочка фиксирует линию, где встречаются два разных режима разговора и начинается перестройка сцены.",
      },
      negotiation: {
        activePreset: {
          id: "forecast",
          label: "Сценарий",
          title: "Ранняя грозовая примета",
          description: "Пресет собирает ранние сигналы эскалации до прямого конфликта. Второе предложение не нужно.",
          tone: "accent",
        },
        insights: [
          {
            id: "point-duplicate",
            label: "Полочка",
            title: "Полочка 6",
            description: "Этот дубликат базового блока не должен попадать в overlay.",
            tone: "neutral",
          },
          {
            id: "cloud-profile",
            label: "Полочка",
            title: "Грозовой узел повторов",
            description: "Цикл уже начинает управлять ритмом встречи и требует остановки автоматического повтора.",
            tone: "warning",
          },
          {
            id: "omen-1",
            label: "Примета",
            title: "Перистые сигналы",
            description: "Сначала появляются лёгкие признаки дистанции и ухода от прямого ответа. Вторая деталь не нужна.",
            tone: "warning",
          },
        ],
        recommendations: [
          {
            id: "step-1",
            title: "Назвать ранний риск",
            description: "Озвучить наблюдаемое изменение воздуха встречи и вернуть разговор к общим условиям работы.",
            reason: "Это снижает плотность домыслов и помогает не довести сцену до грозового накопления.",
          },
        ],
      },
      synthesis: {
        enabled: true,
        title: "Синтез атмосферы и облаков",
        summary: "Вторая Ясна подтверждает, что изменение воздуха уже собирается в плотное проблемное облако.",
        bridges: [
          {
            id: "bridge-1",
            title: "Воздух становится облаком",
            description: "Мост показывает переход от атмосферы недоверия к уже различимому скоплению проблем.",
          },
        ],
      },
    });

    expect(model.blocks.map((block) => block.id)).toEqual([
      "point-6",
      "preset-forecast",
      "insight-cloud-profile",
      "insight-omen-1",
      "mechanic-wind-shift",
      "recommendation-step-1",
      "synthesis-summary",
      "synthesis-bridge-bridge-1",
    ]);
    expect(model.blocks.map((block) => block.kind)).toEqual([
      "point",
      "insight",
      "insight",
      "insight",
      "mechanic",
      "recommendation",
      "synthesis",
      "synthesis",
    ]);
    expect(model.blocks[1]).toMatchObject({
      label: "Сценарий",
      title: "Ранняя грозовая примета",
      description: "Пресет собирает ранние сигналы эскалации до прямого конфликта.",
      tone: "accent",
    });
    expect(model.blocks[2]).toMatchObject({
      label: "Полочка",
      title: "Грозовой узел повторов",
      description: "Цикл уже начинает управлять ритмом встречи и требует остановки автоматического повтора.",
      tone: "warning",
    });
    expect(model.blocks[3]).toMatchObject({
      label: "Примета",
      title: "Перистые сигналы",
      description: "Сначала появляются лёгкие признаки дистанции и ухода от прямого ответа.",
      tone: "warning",
    });
    expect(model.blocks[5]).toMatchObject({
      label: "Следующий шаг",
      title: "Назвать ранний риск",
    });
    expect(model.blocks[5].description).toContain("Основание:");
    expect(model.blocks[6]).toMatchObject({
      label: "Синтез Ясен",
      title: "Синтез атмосферы и облаков",
    });
    expect(model.blocks[7]).toMatchObject({
      label: "Мост между Яснами",
      title: "Воздух становится облаком",
    });
    expect(model.blocks.some((block) => block.id === "insight-point-duplicate")).toBe(false);
  });

  it("extracts only the first sentence for compact descriptions", () => {
    expect(getSingleSentence("Первая мысль. Вторая мысль.")).toBe("Первая мысль.");
    expect(getSingleSentence("Без точки", "Запасной текст")).toBe("Без точки");
    expect(getSingleSentence("   ", "Запасной текст")).toBe("Запасной текст");
  });
});
