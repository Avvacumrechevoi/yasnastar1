/*
 * Design note for App.tsx:
 * Корневая маршрутизация должна сохранять роль лендинга как точки входа и
 * давать быстрый переход в две продуктовые ветки: «Звезда Ясны» и каталог «Все Ясны».
 */
import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { STATIC_PREVIEW_MODE } from "@/pages/star/staticPreview";

const Home = lazy(() => import("@/pages/Home"));
const StarPage = lazy(() => import("@/pages/Star"));
const YasnasPage = lazy(() => import("@/pages/Yasnas"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

function RouteFallback() {
  return (
    <main className="min-h-screen bg-[#050b09] text-white">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm text-white/70 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          Загружаем интерфейс Ясны…
        </div>
      </div>
    </main>
  );
}

function App() {
  const routerHook = STATIC_PREVIEW_MODE ? useHashLocation : undefined;

  return (
    <Router hook={routerHook}>
      <Suspense fallback={<RouteFallback />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/star" component={StarPage} />
          <Route path="/yasnas" component={YasnasPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Suspense>
    </Router>
  );
}

export default App;
