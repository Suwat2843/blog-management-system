import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

/**
 * Edit blog page - Form to edit an existing blog post
 */
export default function EditBlog({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const blogId = parseInt(params.id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Fetch blog details
  const { data: blog, isLoading } = trpc.blog.getById.useQuery({ id: blogId });

  // Update blog mutation
  const updateBlogMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      navigate(`/blogs/${blogId}`);
    },
  });

  // Populate form with blog data
  useEffect(() => {
    if (blog) {
      setTitle(blog.title);
      setContent(blog.content);
    }
  }, [blog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("กรุณากรอกชื่อและเนื้อหาบทความ");
      return;
    }

    await updateBlogMutation.mutateAsync({
      id: blogId,
      title: title.trim(),
      content: content.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">กำลังโหลด...</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ไม่พบบทความนี้</p>
          <Button onClick={() => navigate("/blogs")}>กลับไปยังรายการบทความ</Button>
        </div>
      </div>
    );
  }

  // Check if user is the author
  if (user?.id !== blog.authorId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">คุณไม่มีสิทธิ์แก้ไขบทความนี้</p>
          <Button onClick={() => navigate(`/blogs/${blogId}`)}>กลับไปยังบทความ</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(`/blogs/${blogId}`)}>
            ← กลับ
          </Button>
          <h1 className="text-2xl font-bold flex-1 text-center">แก้ไขบทความ</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>แก้ไขบทความ</CardTitle>
            <CardDescription>อัปเดตข้อมูลบทความของคุณ</CardDescription>
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
                  disabled={updateBlogMutation.isPending || !title.trim() || !content.trim()}
                >
                  {updateBlogMutation.isPending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/blogs/${blogId}`)}
                >
                  ยกเลิก
                </Button>
              </div>

              {/* Error Message */}
              {updateBlogMutation.isError && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                  {(updateBlogMutation.error as any)?.message || "เกิดข้อผิดพลาดในการแก้ไขบทความ"}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

