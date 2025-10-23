import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

/**
 * Create blog page - Form to create a new blog post
 */
export default function CreateBlog() {
  const { isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const createBlogMutation = trpc.blog.create.useMutation({
    onSuccess: (result) => {
      navigate("/blogs");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("กรุณากรอกชื่อและเนื้อหาบทความ");
      return;
    }

    await createBlogMutation.mutateAsync({
      title: title.trim(),
      content: content.trim(),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">กรุณาเข้าสู่ระบบเพื่อเขียนบทความ</p>
          <Button onClick={() => navigate("/")}>กลับไปยังหน้าแรก</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/blogs")}>
            ← กลับ
          </Button>
          <h1 className="text-2xl font-bold flex-1 text-center">เขียนบทความใหม่</h1>
          <Button 
            variant="outline" 
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            ออกจากระบบ
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>สร้างบทความใหม่</CardTitle>
            <CardDescription>กรอกข้อมูลบทความของคุณด้านล่าง</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อบทความ</label>
                <Input
                  type="text"
                  placeholder="ชื่อบทความของคุณ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Content Input */}
              <div>
                <label className="block text-sm font-medium mb-2">เนื้อหา</label>
                <Textarea
                  placeholder="เขียนเนื้อหาบทความของคุณ..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={createBlogMutation.isPending || !title.trim() || !content.trim()}
                >
                  {createBlogMutation.isPending ? "กำลังบันทึก..." : "เผยแพร่บทความ"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/blogs")}
                >
                  ยกเลิก
                </Button>
              </div>

              {/* Error Message */}
              {createBlogMutation.isError && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                  {(createBlogMutation.error as any)?.message || "เกิดข้อผิดพลาดในการสร้างบทความ"}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

