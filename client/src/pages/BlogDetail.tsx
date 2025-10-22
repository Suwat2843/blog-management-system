import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";

/**
 * Blog detail page - Display a single blog with comments
 */
export default function BlogDetail({ params }: { params: { id: string } }) {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const blogId = parseInt(params.id);
  const [commentContent, setCommentContent] = useState("");

  // Fetch blog details
  const { data: blog, isLoading } = trpc.blog.getById.useQuery({ id: blogId });

  // Fetch comments
  const { data: comments } = trpc.comment.getByBlogId.useQuery({ blogId });

  // Mutations
  const deleteBlogMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      navigate("/blogs");
    },
  });

  const createCommentMutation = trpc.comment.create.useMutation({
    onSuccess: () => {
      setCommentContent("");
      // Refetch comments
      trpc.useUtils().comment.getByBlogId.invalidate({ blogId });
    },
  });

  const deleteCommentMutation = trpc.comment.delete.useMutation({
    onSuccess: () => {
      trpc.useUtils().comment.getByBlogId.invalidate({ blogId });
    },
  });

  const handleDeleteBlog = async () => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบบทความนี้?")) {
      await deleteBlogMutation.mutateAsync({ id: blogId });
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) return;
    await createCommentMutation.mutateAsync({
      blogId,
      content: commentContent,
    });
  };

  const handleDeleteComment = async (commentId: number) => {
    if (confirm("คุณแน่ใจหรือว่าต้องการลบความเห็นนี้?")) {
      await deleteCommentMutation.mutateAsync({ id: commentId });
    }
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

  const isAuthor = user?.id === blog.authorId;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/blogs")}>
            ← กลับ
          </Button>
          <h1 className="text-2xl font-bold flex-1 text-center">รายละเอียดบทความ</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Blog Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-3xl">{blog.title}</CardTitle>
            <CardDescription>
              โดย {blog.author?.name || "ไม่ระบุชื่อ"} • {new Date(blog.createdAt).toLocaleDateString('th-TH')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="whitespace-pre-wrap">{blog.content}</p>
            </div>

            {/* Edit/Delete Buttons */}
            {isAuthor && (
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => navigate(`/edit/${blog.id}`)}>
                  แก้ไข
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBlog}
                  disabled={deleteBlogMutation.isPending}
                >
                  ลบ
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments Section */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">ความเห็น</h2>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>เพิ่มความเห็น</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="เขียนความเห็นของคุณ..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="mb-4"
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!commentContent.trim() || createCommentMutation.isPending}
                >
                  ส่งความเห็น
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  กรุณา{" "}
                  <a href="/login" className="text-primary hover:underline">
                    เข้าสู่ระบบ
                  </a>{" "}
                  เพื่อเพิ่มความเห็น
                </p>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          {comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment: any) => (
                <Card key={comment.id}>
                  <CardHeader>
                    <CardDescription>
                      {comment.author?.name || "ไม่ระบุชื่อ"} • {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{comment.content}</p>
                    {user?.id === comment.authorId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                      >
                        ลบ
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">ยังไม่มีความเห็น</p>
          )}
        </div>
      </main>
    </div>
  );
}

