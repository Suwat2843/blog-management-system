import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { Link, useLocation } from "wouter";

/**
 * Home page - Landing page for the blog management system
 */
export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Navigation */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {APP_LOGO && <img src={APP_LOGO} alt="Logo" className="h-8 w-8" />}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <nav className="flex gap-4 items-center">
            {isAuthenticated ? (
              <>
                <Link href="/blogs">
                  <Button variant="ghost">บทความของฉัน</Button>
                </Link>
                <Link href="/create">
                  <Button variant="default">เขียนบทความใหม่</Button>
                </Link>
                <div className="text-sm text-muted-foreground">
                  {user?.username || user?.email}
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  เข้าสู่ระบบ
                </Button>
                <Button variant="default" onClick={() => navigate("/register")}>
                  สมัครสมาชิก
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {isAuthenticated ? (
            <div>
              <h2 className="text-3xl font-bold mb-8">ยินดีต้อนรับ, {user?.username || "ผู้ใช้"}</h2>
              <div className="grid gap-4">
                <Link href="/blogs">
                  <Button variant="outline" className="w-full">
                    ดูบทความทั้งหมด
                  </Button>
                </Link>
                <Link href="/create">
                  <Button variant="default" className="w-full">
                    เขียนบทความใหม่
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">ยินดีต้อนรับสู่ระบบจัดการบทความ</h2>
              <p className="text-lg text-muted-foreground mb-8">
                แพลตฟอร์มสำหรับการเขียน แก้ไข และแชร์บทความของคุณ
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/login")}>
                  เข้าสู่ระบบ
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                  สมัครสมาชิก
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

