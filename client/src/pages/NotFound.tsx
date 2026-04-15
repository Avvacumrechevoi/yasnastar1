import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <main className="min-h-screen bg-[#040404] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,226,125,0.14),transparent_22%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.06),transparent_18%)]" />
        <div className="yasna-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="yasna-noise pointer-events-none absolute inset-0 opacity-[0.08]" />

        <div className="relative mx-auto flex min-h-screen max-w-[1280px] items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          <Card className="w-full max-w-[40rem] rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,15,15,0.96)_0%,rgba(5,5,5,0.98)_100%)] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
            <CardContent className="px-6 pb-8 pt-8 text-center sm:px-8">
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#38e27d]/16 blur-xl" />
                  <div className="relative rounded-full border border-white/10 bg-white/[0.04] p-4">
                    <AlertCircle className="h-12 w-12 text-[#38e27d]" />
                  </div>
                </div>
              </div>

              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[#38e27d]">
                Маршрут не найден
              </p>
              <h1 className="mt-4 font-display text-[3rem] font-semibold leading-none tracking-[-0.07em] text-white">
                404
              </h1>

              <h2 className="mt-3 text-xl font-semibold tracking-[-0.04em] text-white/90">
                Такой страницы сейчас нет в интерфейсе
              </h2>

              <p className="mx-auto mt-4 max-w-[30rem] text-sm leading-7 text-white/64 sm:text-base">
                Ссылка могла устареть, а маршрут — измениться после переработки структуры приложения. Вернитесь на главную и продолжите работу через каталог Ясн или звезду.
              </p>

              <div
                id="not-found-button-group"
                className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"
              >
                <Button
                  onClick={handleGoHome}
                  className="rounded-full bg-[#38e27d] px-6 py-2.5 font-semibold text-black transition hover:bg-[#4bef8d]"
                >
                  <Home className="mr-2 h-4 w-4" />
                  На главную
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
