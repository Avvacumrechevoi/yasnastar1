/*
 * Design note for Yasnas.tsx:
 * Каталог всех Ясн должен ощущаться как библиотека моделей в том же product-led стиле,
 * что и лендинг: тёмный фон, чистая типографика, зелёный акцент, умеренная анимация
 * и ясная фильтрация без визуального шума.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { AlertTriangle, ArrowLeft, LibraryBig, Orbit, Search, Sparkles } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { STATIC_PREVIEW_MODE, useStaticCatalogData } from "./star/staticPreview";

function YasnasPage() {
  const { catalogData: staticCatalogData } = useStaticCatalogData(STATIC_PREVIEW_MODE);
  const catalogQuery = trpc.yasna.catalog.useQuery(undefined, {
    enabled: !STATIC_PREVIEW_MODE,
  });
  const catalogData = STATIC_PREVIEW_MODE ? staticCatalogData : catalogQuery.data;
  const yasnaCatalog = catalogData?.yasnas ?? [];
  const yasnaTypes = useMemo(() => ["Все типы", ...Array.from(new Set(yasnaCatalog.map(item => item.family)))], [yasnaCatalog]);
  const [activeType, setActiveType] = useState<string>("Все типы");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!yasnaTypes.includes(activeType)) {
      setActiveType("Все типы");
    }
  }, [activeType, yasnaTypes]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return yasnaCatalog.filter(item => {
      const matchesType = activeType === "Все типы" ? true : item.family === activeType;
      const matchesSearch =
        normalizedQuery.length === 0
          ? true
          : [item.title, item.summary, item.family, item.contextAccent, ...item.mechanics]
              .join(" ")
              .toLowerCase()
              .includes(normalizedQuery);

      return matchesType && matchesSearch;
    });
  }, [activeType, searchQuery, yasnaCatalog]);

  const isLoading = !STATIC_PREVIEW_MODE && catalogQuery.isLoading;
  const isError = !STATIC_PREVIEW_MODE && catalogQuery.isError;

  return (
    <main className="min-h-screen bg-[#040404] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,226,125,0.14),transparent_22%),radial-gradient(circle_at_90%_10%,rgba(255,255,255,0.06),transparent_18%)]" />
        <div className="yasna-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="yasna-noise pointer-events-none absolute inset-0 opacity-[0.08]" />

        <div className="relative mx-auto flex w-full max-w-[1380px] flex-col px-5 pb-20 pt-6 sm:px-8 lg:px-10">
          <header className="sticky top-0 z-30 mb-8 rounded-full border border-white/10 bg-black/55 px-4 py-3 shadow-[0_18px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-black/45 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[#38e27d] shadow-[0_0_24px_rgba(56,226,125,0.18)]">
                  <LibraryBig className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/45">
                    Yasna
                  </p>
                  <p className="text-sm font-semibold tracking-[-0.03em] text-white">
                    Все Ясны
                  </p>
                </div>
              </div>

              <nav className="hidden items-center gap-2 md:flex">
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white"
                >
                  Главная
                </Link>
                <Link
                  href="/star"
                  className="rounded-full px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white"
                >
                  Звезда
                </Link>
              </nav>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-[#38e27d] px-5 py-2.5 text-sm font-semibold text-black transition hover:translate-y-[-1px] hover:bg-[#4bef8d]"
              >
                Вернуться на главную
              </Link>
            </div>
          </header>

          <section className="rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.96)_0%,rgba(5,5,5,0.98)_100%)] px-6 pb-10 pt-10 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:px-10 lg:px-14 lg:pb-12 lg:pt-12">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)] xl:items-end">
              <div className="max-w-[760px]">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#38e27d]">
                  Библиотека моделей
                </p>
                <h1 className="mt-4 font-display text-[2.7rem] font-semibold leading-[0.95] tracking-[-0.07em] text-white sm:text-[4.2rem] lg:text-[4.9rem]">
                  Все Ясны
                  <br />
                  с фильтрацией
                  <span className="text-[#38e27d]"> по типу</span>
                </h1>
                <p className="mt-6 max-w-[620px] text-base leading-7 text-white/66 sm:text-lg">
                  Каталог помогает быстро ориентироваться в методе: увидеть полный набор Ясн, отфильтровать модели по типу и открыть подходящий способ чтения ситуации.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <article className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.26)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42">
                        Найдено моделей
                      </p>
                      <p className="mt-3 text-[2rem] font-semibold tracking-[-0.06em] text-white">
                        {filteredItems.length}
                      </p>
                    </div>
                    <div className="rounded-full border border-[#38e27d]/25 bg-[#38e27d]/10 p-3 text-[#38e27d]">
                      <Orbit className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/60">
                    Каталог пересобирается сразу по типу и поисковому запросу, без перезагрузки страницы.
                  </p>
                </article>

                <article className="rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.26)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42">
                        Активный режим
                      </p>
                      <p className="mt-3 text-lg font-semibold tracking-[-0.05em] text-white">
                        {activeType}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/35 p-3 text-white/70">
                      <Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-white/60">
                    Сначала можно смотреть всю библиотеку целиком, а затем быстро сузить круг до конкретного семейства Ясен из серверного каталога.
                  </p>
                </article>
              </div>
            </div>

            <div className="mt-10 rounded-[30px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[32rem]">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#38e27d]">
                    Фильтрация каталога
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    Выберите тип и при необходимости введите часть названия, семейства или механики, чтобы быстро сузить библиотеку.
                  </p>
                </div>

                <div className="flex w-full max-w-[26rem] items-center gap-3 rounded-[22px] border border-white/10 bg-black/25 px-4 py-3">
                  <Search className="h-4 w-4 shrink-0 text-white/42" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Поиск по названию, семейству или механике"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {yasnaTypes.map(type => {
                  const isActive = type === activeType;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setActiveType(type)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition duration-300 ${
                        isActive
                          ? "border-[#38e27d]/45 bg-[#38e27d]/12 text-white shadow-[0_0_30px_rgba(56,226,125,0.14)]"
                          : "border-white/10 bg-white/[0.03] text-white/68 hover:border-white/22 hover:bg-white/[0.05] hover:text-white"
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              {activeType !== "Все типы" || searchQuery.trim().length > 0 ? (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveType("Все типы");
                      setSearchQuery("");
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/30 px-4 py-2 text-sm font-medium text-white/78 transition hover:border-white/25 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Сбросить фильтры
                  </button>
                </div>
              ) : null}
            </div>

            {isError ? (
              <div className="mt-8 rounded-[30px] border border-rose-500/20 bg-rose-500/[0.08] p-6 text-white">
                <div className="flex items-start gap-3">
                  <div className="rounded-full border border-rose-400/25 bg-rose-400/10 p-3 text-rose-200">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold tracking-[-0.04em] text-white">
                      Каталог временно недоступен
                    </h2>
                    <p className="mt-2 max-w-[42rem] text-sm leading-6 text-white/74">
                      Не удалось получить данные с сервера. Проверьте API или базу данных: библиотека Ясн должна возвращать каталог без ошибок и с предсказуемыми состояниями загрузки.
                    </p>
                  </div>
                </div>
              </div>
            ) : isLoading ? (
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={`yasna-skeleton-${index}`}
                    className="rounded-[30px] border border-white/10 bg-white/[0.03] p-5 shadow-[0_18px_64px_rgba(0,0,0,0.18)]"
                  >
                    <div className="h-3 w-28 rounded-full bg-white/10" />
                    <div className="mt-4 h-8 w-2/3 rounded-full bg-white/10" />
                    <div className="mt-4 space-y-2">
                      <div className="h-3 rounded-full bg-white/8" />
                      <div className="h-3 rounded-full bg-white/8" />
                      <div className="h-3 w-4/5 rounded-full bg-white/8" />
                    </div>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="h-20 rounded-[20px] bg-white/8" />
                      <div className="h-20 rounded-[20px] bg-white/8" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="mt-8 rounded-[30px] border border-white/10 bg-white/[0.03] p-6 text-center">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#38e27d]">
                  Ничего не найдено
                </p>
                <h2 className="mt-3 text-[1.7rem] font-semibold tracking-[-0.05em] text-white">
                  Измените фильтры или поисковый запрос
                </h2>
                <p className="mx-auto mt-3 max-w-[34rem] text-sm leading-6 text-white/62">
                  В текущем наборе Ясн нет совпадений по выбранному типу или тексту запроса. Сбросьте фильтры, чтобы вернуться ко всему каталогу.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredItems.map(item => (
                  <article
                    key={item.id}
                    className="group rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] p-5 shadow-[0_18px_64px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#38e27d]/30 hover:shadow-[0_24px_90px_rgba(0,0,0,0.34)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#38e27d]">
                          {item.family}
                        </p>
                        <h2 className="mt-3 text-[1.45rem] font-semibold leading-tight tracking-[-0.05em] text-white">
                          {item.title}
                        </h2>
                      </div>
                      <div className="rounded-full border border-white/10 bg-black/30 p-3 text-white/56 transition group-hover:border-[#38e27d]/25 group-hover:text-[#38e27d]">
                        <Orbit className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-white/62">{item.summary}</p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[20px] border border-white/10 bg-black/25 px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42">
                          Уроков в модели
                        </p>
                        <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">
                          {item.lessonCount}
                        </p>
                      </div>
                      <div className="rounded-[20px] border border-[#38e27d]/18 bg-[#38e27d]/[0.06] px-4 py-3">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#38e27d]">
                          Контекстный акцент
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/72">{item.contextAccent}</p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 px-4 py-4">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42">
                        Первые полочки
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {item.pointsPreview.map(point => (
                          <div
                            key={`${item.id}-${point.index}`}
                            className="rounded-[16px] border border-white/10 bg-white/[0.03] px-3 py-2.5"
                          >
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#38e27d]">
                              {point.index}
                            </p>
                            <p className="mt-1 text-sm leading-5 text-white/74">{point.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/42">
                        Активные механики
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {item.mechanics.map(mechanic => (
                          <span
                            key={mechanic}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/72"
                          >
                            {mechanic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

export default YasnasPage;
