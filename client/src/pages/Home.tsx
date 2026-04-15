/*
 * Design note for Home.tsx:
 * Главная страница сведена к одному hero-экрану: чистая тёмная сцена,
 * компактная верхняя навигация, крупный оффер и ряд интерактивных
 * фигур-модулей под кнопками как продуктовый вход в метод Ясны.
 */
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { productFigures, type ProductFigure } from "@/pages/home/productModules";
import { ArrowRight, Compass, Menu } from "lucide-react";
import { Link } from "wouter";

type NavigationItem = {
  label: string;
  href: string;
  kind: "anchor" | "route";
};

const navigation: NavigationItem[] = [
  { label: "Главная", href: "#hero", kind: "anchor" },
  { label: "Звезда", href: "/star", kind: "route" },
  { label: "Каталог", href: "/yasnas", kind: "route" },
];

function FigureGlyph({ kind }: { kind: ProductFigure["kind"] }) {
  if (kind === "layers") {
    return (
      <div className="relative h-16 w-16">
        <span className="absolute left-1/2 top-1 block h-0 w-0 -translate-x-1/2 border-x-[18px] border-b-[12px] border-x-transparent border-b-white/80" />
        <span className="absolute left-1/2 top-5 block h-0 w-0 -translate-x-1/2 border-x-[22px] border-b-[14px] border-x-transparent border-b-white/45" />
        <span className="absolute left-1/2 top-10 block h-0 w-0 -translate-x-1/2 border-x-[26px] border-b-[16px] border-x-transparent border-b-[#38e27d] shadow-[0_0_24px_rgba(56,226,125,0.5)]" />
      </div>
    );
  }

  if (kind === "flow") {
    return (
      <div className="relative h-16 w-16">
        <span className="absolute left-2 top-4 h-7 w-7 rounded-full border-[10px] border-white/70 border-r-transparent border-b-transparent rotate-[-18deg]" />
        <span className="absolute bottom-1 left-7 h-10 w-5 rounded-b-[12px] bg-[#38e27d] shadow-[0_0_22px_rgba(56,226,125,0.45)]" />
      </div>
    );
  }

  if (kind === "core") {
    return (
      <div className="relative h-16 w-16">
        <span className="absolute left-1/2 top-1 h-12 w-12 -translate-x-1/2 rounded-full border border-white/30" />
        <span className="absolute left-1/2 top-4 h-8 w-8 -translate-x-1/2 rotate-45 rounded-[8px] border border-white/65 bg-[#38e27d]/18" />
        <span className="absolute left-1/2 top-6 h-4 w-4 -translate-x-1/2 rotate-45 rounded-[4px] bg-[#38e27d] shadow-[0_0_20px_rgba(56,226,125,0.65)]" />
        <span className="absolute left-1 top-5 h-10 w-10 rounded-full border border-white/18" />
      </div>
    );
  }

  if (kind === "bridge") {
    return (
      <div className="relative h-16 w-16">
        <span className="absolute left-2 top-4 h-9 w-5 skew-y-[-28deg] rounded-[4px] bg-white/38" />
        <span className="absolute left-7 top-1 h-7 w-5 rounded-[4px] bg-[#38e27d] shadow-[0_0_18px_rgba(56,226,125,0.42)]" />
        <span className="absolute right-2 top-4 h-9 w-5 skew-y-[28deg] rounded-[4px] bg-white/2" />
        <span className="absolute left-8 top-10 h-3 w-3 rounded-full bg-[#38e27d]" />
      </div>
    );
  }

  return (
    <div className="relative h-16 w-16">
      <span className="absolute bottom-1 left-1 h-4 w-4 rounded-[3px] bg-white/32" />
      <span className="absolute bottom-1 left-6 h-7 w-4 rounded-[3px] bg-white/54" />
      <span className="absolute bottom-1 left-11 h-11 w-4 rounded-[3px] bg-[#38e27d] shadow-[0_0_22px_rgba(56,226,125,0.5)]" />
    </div>
  );
}

function Home() {
  const navLinkClass = "rounded-full px-4 py-2 text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white";

  return (
    <main className="min-h-screen bg-[#040404] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(54,226,124,0.14),transparent_24%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.06),transparent_16%),radial-gradient(circle_at_82%_28%,rgba(54,226,124,0.09),transparent_20%)]" />
        <div className="yasna-grid pointer-events-none absolute inset-0 opacity-35" />
        <div className="yasna-noise pointer-events-none absolute inset-0 opacity-[0.07]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-5 pb-8 pt-6 sm:px-8 lg:px-10">
          <header className="sticky top-0 z-30 mb-6 rounded-full border border-white/10 bg-black/55 px-4 py-3 shadow-[0_18px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-black/45 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <a href="#hero" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/6 text-[#38e27d] shadow-[0_0_24px_rgba(56,226,125,0.18)]">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-white/45">
                    Yasna
                  </p>
                  <p className="text-sm font-semibold tracking-[-0.03em] text-white">
                    Навигация по переговорам
                  </p>
                </div>
              </a>

              <nav className="hidden items-center gap-2 md:flex">
                {navigation.map(item =>
                  item.kind === "anchor" ? (
                    <a
                      key={item.label}
                      href={item.href}
                      className={navLinkClass}
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={navLinkClass}
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </nav>

              <div className="flex items-center gap-2">
                <Link
                  href="/star"
                  className="inline-flex items-center justify-center rounded-full bg-[#38e27d] px-5 py-2.5 text-sm font-semibold text-black transition hover:translate-y-[-1px] hover:bg-[#4bef8d]"
                >
                  Открыть звезду
                </Link>

                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-white transition hover:border-white/22 hover:bg-white/[0.08] md:hidden"
                      aria-label="Открыть меню"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="border-white/10 bg-[#08100d] text-white sm:max-w-[22rem]"
                  >
                    <SheetHeader className="border-b border-white/10 pb-4">
                      <SheetTitle className="text-left text-white">Навигация по Ясне</SheetTitle>
                      <SheetDescription className="text-left text-white/60">
                        Быстрые переходы к основным сценариям интерфейса.
                      </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-1 flex-col gap-3 px-4 pb-6">
                      {navigation.map(item =>
                        item.kind === "anchor" ? (
                          <SheetClose asChild key={item.label}>
                            <a
                              href={item.href}
                              className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-[#38e27d]/30 hover:bg-[#38e27d]/[0.08]"
                            >
                              {item.label}
                            </a>
                          </SheetClose>
                        ) : (
                          <SheetClose asChild key={item.label}>
                            <Link
                              href={item.href}
                              className="rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition hover:border-[#38e27d]/30 hover:bg-[#38e27d]/[0.08]"
                            >
                              {item.label}
                            </Link>
                          </SheetClose>
                        )
                      )}

                      <div className="mt-3 rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(56,226,125,0.12)_0%,rgba(255,255,255,0.03)_100%)] p-4">
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#38e27d]">
                          Быстрый старт
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/68">
                          Откройте звезду, если нужно сразу работать с механиками, или перейдите в каталог, чтобы выбрать подходящую Ясну.
                        </p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          <section
            id="hero"
            className="relative flex flex-1 items-center overflow-hidden rounded-[40px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.96)_0%,rgba(5,5,5,0.985)_100%)] px-6 py-14 shadow-[0_30px_120px_rgba(0,0,0,0.45)] sm:px-10 lg:px-14 lg:py-[4.5rem]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(56,226,125,0.16),transparent_62%)]" />
            <div className="pointer-events-none absolute left-1/2 top-[38%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#38e27d]/[0.08] blur-3xl" />
            <div className="pointer-events-none absolute inset-x-[18%] bottom-[-12%] h-44 rounded-full bg-white/[0.03] blur-3xl" />

            <div
              className="relative mx-auto flex w-full max-w-[980px] flex-col items-center text-center"
              data-testid="home-hero"
            >
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-[#38e27d]">
                Ясна для встреч и переговоров
              </p>
              <h1 className="mt-5 font-display text-[2.95rem] font-semibold leading-[0.94] tracking-[-0.08em] text-white sm:text-[4.7rem] lg:text-[6rem]">
                Управляйте переговорами
                <br />
                <span className="text-[#38e27d]">по методу Ясны</span>
              </h1>
              <p className="mt-6 max-w-[700px] text-base leading-7 text-white/66 sm:text-lg">
                Читайте атмосферу встречи, собирайте облака проблем, различайте образ конфликта
                и переводите разговор к следующему наблюдаемому шагу через визуальную механику Ясны.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/star"
                  data-testid="home-open-star"
                  className="inline-flex items-center gap-2 rounded-full bg-[#38e27d] px-5 py-3 text-sm font-semibold text-black transition hover:translate-y-[-1px] hover:bg-[#4bef8d]"
                >
                  Открыть звезду механик
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/yasnas"
                  data-testid="home-open-catalog"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/24 hover:bg-white/[0.08]"
                >
                  Смотреть каталог Ясн
                </Link>
              </div>

              <div className="mt-10 w-full max-w-[1120px]">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {productFigures.map(item => (
                    <Dialog key={item.title}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="group relative overflow-hidden rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] px-4 py-5 text-left shadow-[0_18px_48px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 hover:border-[#38e27d]/24 hover:bg-[linear-gradient(180deg,rgba(56,226,125,0.12)_0%,rgba(255,255,255,0.03)_100%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38e27d]/60"
                          aria-label={`${item.title}: ${item.subtitle}`}
                        >
                          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent transition group-hover:via-[#38e27d]/55" />
                          <div className="flex min-h-[176px] flex-col items-center justify-between gap-4 text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-black/28 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition duration-300 group-hover:scale-105 group-hover:bg-black/38">
                              <FigureGlyph kind={item.kind} />
                            </div>
                            <div>
                              <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-[#38e27d]">
                                {item.badge}
                              </p>
                              <h3 className="mt-2 text-base font-semibold tracking-[-0.04em] text-white">
                                {item.title}
                              </h3>
                              <p className="mt-1 text-sm leading-6 text-white/52">{item.subtitle}</p>
                              <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/38">
                                Открыть пояснение
                              </p>
                            </div>
                          </div>
                        </button>
                      </DialogTrigger>

                      <DialogContent className="max-w-[640px] border-white/10 bg-[#0b0f0d] text-white shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
                        <DialogHeader className="text-left">
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#38e27d]">
                            {item.badge}
                          </p>
                          <DialogTitle className="text-[1.75rem] tracking-[-0.05em] text-white">
                            {item.title}
                          </DialogTitle>
                          <DialogDescription className="text-base leading-7 text-white/68">
                            {item.summary}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#38e27d]">
                              Когда открывать
                            </p>
                            <p className="mt-3 text-sm leading-6 text-white/70">{item.useCase}</p>
                          </div>
                          <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#38e27d]">
                              Что получаете
                            </p>
                            <p className="mt-3 text-sm leading-6 text-white/70">{item.outcome}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(56,226,125,0.12)_0%,rgba(255,255,255,0.03)_100%)] px-4 py-4">
                          <div className="text-left">
                            <p className="text-sm font-semibold text-white">Открыть соответствующую механику в звезде</p>
                            <p className="mt-1 text-sm leading-6 text-white/60">
                              Перейдите в рабочий интерфейс, чтобы применить этот модуль к конкретной Ясне и полочке.
                            </p>
                          </div>
                          <Link
                            href="/star"
                            className="inline-flex items-center gap-2 rounded-full bg-[#38e27d] px-4 py-2.5 text-sm font-semibold text-black transition hover:translate-y-[-1px] hover:bg-[#4bef8d]"
                          >
                            Перейти в звезду
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Home;
