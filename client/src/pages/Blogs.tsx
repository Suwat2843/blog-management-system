import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useState } from "react";

/**
 * Blogs list page - Display all blogs with search functionality
 */
export default function Blogs() {
  const { isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all blogs
  const { data: blogs, isLoading } = trpc.blog.list.useQuery();

  // Search blogs
  const { data: searchResults } = trpc.blog.search.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 }
  );

  const displayBlogs = searchQuery.length > 0 ? searchResults : blogs;

  const handleBlogClick = (blogId: number) => {
    navigate(`/blogs/${blogId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost">← กลับ</Button>
          </Link>
          <h1 className="text-2xl font-bold">บทความทั้งหมด</h1>
          <div className="flex gap-2 items-center">
            {isAuthenticated && (
              <>
                <Link href="/create">
                  <Button variant="default">เขียนใหม่</Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  ออกจากระบบ
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="ค้นหาบทความ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Blogs List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">กำลังโหลด...</p>
          </div>
        ) : displayBlogs && displayBlogs.length > 0 ? (
          <div className="grid gap-4">
            {displayBlogs.map((blog: any) => (
              <Card
                key={blog.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleBlogClick(blog.id)}
              >
                <CardHeader>
                  <CardTitle>{blog.title}</CardTitle>
                  <CardDescription>
                    โดย {blog.author?.username || "ไม่ระบุชื่อ"} • {new Date(blog.createdAt).toLocaleDateString('th-TH')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-2">
                    {blog.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? "ไม่พบบทความที่ตรงกับการค้นหา" : "ยังไม่มีบทความ"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

